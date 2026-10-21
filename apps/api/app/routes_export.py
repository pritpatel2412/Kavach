"""Export Center: multi-format (CSV, XLSX, JSON, HTML) exports with formula injection neutralization, UTF-8 BOM, PII masking, 24h expiry, and audit tracking."""
from __future__ import annotations

import csv
import hashlib
import io
import json
import logging
import re
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, Response
from fastapi.responses import Response, StreamingResponse
import openpyxl
from openpyxl.styles import Font, PatternFill
from pydantic import BaseModel, Field

from . import admin_auth, audit, db
from .config import get_settings
from .signed_token import create_action_token, verify_action_token

log = logging.getLogger("kavach.export")

admin_export_router = APIRouter(
    prefix="/admin-api/export",
    tags=["admin-export"],
    dependencies=[Depends(admin_auth.check_admin_security)],
)

# In-memory storage for generated export buffers (purged on restart or after 24h)
_export_files: dict[str, tuple[str, str, bytes, datetime]] = {}  # job_id -> (filename, content_type, data, expires_at)


def sanitize_formula_cell(val: Any) -> Any:
    """Neutralize spreadsheet formula injection by prepending ' if value starts with =, +, -, @, \\t, \\r."""
    if val is None:
        return ""
    s = str(val)
    if len(s) > 0 and s[0] in ("=", "+", "-", "@", "\t", "\r"):
        return f"'{s}"
    return s


class ExportRequest(BaseModel):
    module: str = Field(..., pattern="^(waitlist|tickets|coupons|audit_log|analytics_summary)$")
    format: str = Field("csv", pattern="^(csv|xlsx|json|html)$")
    columns: list[str] | None = None
    filters: dict[str, Any] | None = None
    reveal_pii: bool = False


def _fetch_module_data(module: str, filters: dict[str, Any] | None, reveal_pii: bool) -> tuple[list[str], list[dict[str, Any]]]:
    """Fetch rows for requested module with selective PII masking."""
    with db.db() as conn:
        if module == "waitlist":
            rows = conn.execute("SELECT id, name, email, phone, language, city, status, source, created_at FROM waitlist ORDER BY created_at DESC;").fetchall()
            cols = ["id", "name", "email", "phone", "language", "city", "status", "source", "created_at"]
            records = []
            for r in rows:
                name = r[1] if reveal_pii else audit.mask_name(r[1])
                email = r[2] if reveal_pii else audit.mask_email(r[2])
                phone = r[3] if reveal_pii else audit.mask_phone(r[3])
                records.append({
                    "id": r[0], "name": name, "email": email, "phone": phone,
                    "language": r[4], "city": r[5] or "Other", "status": r[6], "source": r[7], "created_at": r[8],
                })
            return cols, records

        elif module == "tickets":
            rows = conn.execute(
                """
                SELECT ticket_number, requester_name, requester_email, category, priority, status, subject, csat_rating, created_at, resolved_at
                FROM tickets ORDER BY created_at DESC;
                """
            ).fetchall()
            cols = ["ticket_number", "requester_name", "requester_email", "category", "priority", "status", "subject", "csat_rating", "created_at", "resolved_at"]
            records = []
            for r in rows:
                name = r[1] if reveal_pii else audit.mask_name(r[1])
                email = r[2] if reveal_pii else audit.mask_email(r[2])
                records.append({
                    "ticket_number": r[0], "requester_name": name, "requester_email": email,
                    "category": r[3], "priority": r[4], "status": r[5], "subject": r[6],
                    "csat_rating": r[7], "created_at": r[8], "resolved_at": r[9] or "Pending",
                })
            return cols, records

        elif module == "coupons":
            rows = conn.execute("SELECT code, discount_type, discount_value, max_redemptions, current_redemptions, is_active, created_at, expires_at FROM coupons ORDER BY created_at DESC;").fetchall()
            cols = ["code", "discount_type", "discount_value", "max_redemptions", "current_redemptions", "is_active", "created_at", "expires_at"]
            records = []
            for r in rows:
                records.append({
                    "code": r[0], "discount_type": r[1], "discount_value": r[2],
                    "max_redemptions": r[3] or "Unlimited", "current_redemptions": r[4],
                    "is_active": "Active" if r[5] else "Paused", "created_at": r[6], "expires_at": r[7] or "None",
                })
            return cols, records

        elif module == "audit_log":
            rows = conn.execute("SELECT id, prev_hash, actor_email, action, entity_type, entity_id, payload_masked, hash, created_at FROM audit_log ORDER BY created_at DESC, id DESC LIMIT 500;").fetchall()
            cols = ["id", "prev_hash", "actor_email", "action", "entity_type", "entity_id", "payload_masked", "hash", "created_at"]
            records = []
            for r in rows:
                actor = r[2] if reveal_pii else audit.mask_email(r[2])
                records.append({
                    "id": r[0], "prev_hash": r[1], "actor_email": actor, "action": r[3],
                    "entity_type": r[4], "entity_id": r[5] or "", "payload_masked": r[6],
                    "hash": r[7], "created_at": r[8],
                })
            return cols, records

        elif module == "analytics_summary":
            rows = conn.execute("SELECT day, waitlist_total, waitlist_confirmed, sessions_total, alerts_l2, alerts_l3, revenue_paise FROM daily_analytics_rollups ORDER BY day DESC;").fetchall()
            cols = ["day", "waitlist_total", "waitlist_confirmed", "sessions_total", "alerts_l2", "alerts_l3", "revenue_inr"]
            records = []
            for r in rows:
                records.append({
                    "day": r[0], "waitlist_total": r[1], "waitlist_confirmed": r[2],
                    "sessions_total": r[3], "alerts_l2": r[4], "alerts_l3": r[5],
                    "revenue_inr": round(r[6] / 100, 2),
                })
            return cols, records

        return [], []


def _generate_csv(cols: list[str], records: list[dict[str, Any]]) -> bytes:
    """Generate CSV with UTF-8 BOM (for Excel Hindi/Gujarati support) and formula escaping."""
    output = io.StringIO()
    # Write UTF-8 BOM
    output.write("\ufeff")
    writer = csv.writer(output)
    writer.writerow(cols)

    for rec in records:
        row = [sanitize_formula_cell(rec.get(c, "")) for c in cols]
        writer.writerow(row)

    return output.getvalue().encode("utf-8")


def _generate_xlsx(cols: list[str], records: list[dict[str, Any]], title: str) -> bytes:
    """Generate styled XLSX using openpyxl with formula escaping."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = title[:31]

    # Header styling (dark green with white bold text)
    header_fill = PatternFill(start_color="0A2A12", end_color="0A2A12", fill_type="solid")
    header_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")

    ws.append(cols)
    for col_num in range(1, len(cols) + 1):
        cell = ws.cell(row=1, column=col_num)
        cell.fill = header_fill
        cell.font = header_font

    for rec in records:
        row_vals = [sanitize_formula_cell(rec.get(c, "")) for c in cols]
        ws.append(row_vals)

    # Auto-adjust column widths
    for col in ws.columns:
        max_len = max(len(str(cell.value or "")) for cell in col)
        col_letter = openpyxl.utils.get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = max(max_len + 3, 12)

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


def _generate_html_report(module: str, cols: list[str], records: list[dict[str, Any]]) -> bytes:
    """Generate print-ready HTML report with CoinCompass theme styling."""
    rows_html = []
    for rec in records:
        tds = "".join(f"<td>{sanitize_formula_cell(rec.get(c, ''))}</td>" for c in cols)
        rows_html.append(f"<tr>{tds}</tr>")

    headers_html = "".join(f"<th>{c.replace('_', ' ').title()}</th>" for c in cols)
    now_str = datetime.now(timezone.utc).strftime("%d %b %Y, %H:%M UTC")
    brand = get_settings().brand_name

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{brand} Export Report - {module.title()}</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; color: #111; margin: 30px; }}
    .header {{ border-bottom: 2px solid #0a2a12; padding-bottom: 15px; margin-bottom: 20px; }}
    .header h1 {{ margin: 0; color: #0a2a12; font-size: 24px; }}
    .header p {{ margin: 5px 0 0; color: #555; font-size: 13px; }}
    table {{ width: 100%; border-collapse: collapse; font-size: 13px; }}
    th {{ background: #0a2a12; color: #fff; padding: 10px 8px; text-align: left; font-weight: 600; }}
    td {{ padding: 8px; border-bottom: 1px solid #e0e0e0; }}
    tr:nth-child(even) {{ background: #f9fafb; }}
    .footer {{ margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 11px; color: #777; }}
    @media print {{
      body {{ margin: 10mm; }}
      th {{ background-color: #0a2a12 !important; color: #fff !important; -webkit-print-color-adjust: exact; }}
    }}
  </style>
</head>
<body>
  <div class="header">
    <h1>{brand} Admin Export - {module.replace('_', ' ').title()}</h1>
    <p>Generated at: {now_str} &bull; Total records: {len(records)}</p>
  </div>
  <table>
    <thead><tr>{headers_html}</tr></thead>
    <tbody>{"".join(rows_html)}</tbody>
  </table>
  <div class="footer">
    Confidential &bull; {brand} Telemetry &bull; Form-Safe Export
  </div>
</body>
</html>"""
    return html.encode("utf-8")


@admin_export_router.post("")
async def create_export_job(
    req: ExportRequest,
    request: Request,
    session: dict = Depends(admin_auth.require_permission("export_data")),
) -> dict[str, Any]:
    # Sensitive exports containing unmasked PII require active step-up TOTP
    if req.reveal_pii:
        admin_auth.require_step_up(session)

    cols, records = _fetch_module_data(req.module, req.filters, req.reveal_pii)

    # Filter columns if specified
    if req.columns:
        selected_cols = [c for c in req.columns if c in cols]
        if selected_cols:
            cols = selected_cols

    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    expires_dt = now + timedelta(hours=24)
    expires_iso = expires_dt.isoformat()

    job_id = f"exp_{secrets.token_hex(8)}"
    brand = get_settings().brand_name
    filename_base = f"{brand.lower()}_{req.module}_{now.strftime('%Y%m%d_%H%M%S')}"

    if req.format == "csv":
        data_bytes = _generate_csv(cols, records)
        content_type = "text/csv; charset=utf-8"
        filename = f"{filename_base}.csv"
    elif req.format == "xlsx":
        data_bytes = _generate_xlsx(cols, records, req.module.title())
        content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = f"{filename_base}.xlsx"
    elif req.format == "json":
        data_bytes = json.dumps(records, indent=2, ensure_ascii=False).encode("utf-8")
        content_type = "application/json; charset=utf-8"
        filename = f"{filename_base}.json"
    elif req.format == "html":
        data_bytes = _generate_html_report(req.module, cols, records)
        content_type = "text/html; charset=utf-8"
        filename = f"{filename_base}.html"

    file_hash = hashlib.sha256(data_bytes).hexdigest()

    # Store in-memory buffer
    _export_files[job_id] = (filename, content_type, data_bytes, expires_dt)

    # Create signed download token (valid 24h)
    download_token = create_action_token(job_id, purpose="admin_export_download", ttl_s=24 * 3600)

    with db.db() as conn:
        conn.execute(
            """
            INSERT INTO export_jobs (id, module, format, filters_json, selected_columns, status, row_count, file_hash, download_token, include_pii, created_by, created_at, expires_at)
            VALUES (?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                job_id, req.module, req.format, json.dumps(req.filters or {}),
                json.dumps(cols), len(records), file_hash, download_token,
                1 if req.reveal_pii else 0, session["email"], now_iso, expires_iso,
            ),
        )

    # Cryptographic audit logging
    audit.record_audit_event(
        actor_email=session["email"],
        action="create_export",
        entity_type="export_job",
        entity_id=job_id,
        payload={
            "module": req.module, "format": req.format, "row_count": len(records),
            "file_hash": file_hash, "include_pii": req.reveal_pii,
        },
        ip=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("User-Agent", "unknown"),
    )

    return {
        "job_id": job_id,
        "module": req.module,
        "format": req.format,
        "row_count": len(records),
        "file_hash": file_hash,
        "download_url": f"/admin-api/export/download/{job_id}?token={download_token}",
        "expires_at": expires_iso,
    }


@admin_export_router.get("/download/{job_id}")
async def download_export_file(
    job_id: str,
    token: str = Query(..., min_length=10),
) -> Response:
    # Verify signed download token
    verified = verify_action_token(token, expected_purpose="admin_export_download")
    if not verified or verified.get("session_id") != job_id:
        raise HTTPException(status_code=403, detail="Invalid or expired download token.")

    # Check job in DB
    with db.db() as conn:
        row = conn.execute("SELECT id, expires_at, file_hash FROM export_jobs WHERE id = ?;", (job_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Export job not found.")

        now_iso = datetime.now(timezone.utc).isoformat()
        if row[1] < now_iso:
            raise HTTPException(status_code=410, detail="Export download has expired (24h retention limit).")

    if job_id not in _export_files:
        raise HTTPException(status_code=404, detail="Export file buffer has expired from memory cache.")

    filename, content_type, data_bytes, expires_dt = _export_files[job_id]

    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"',
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store, no-cache, must-revalidate",
    }

    return Response(content=data_bytes, media_type=content_type, headers=headers)


@admin_export_router.get("/jobs")
async def list_export_jobs(
    limit: int = 50,
    session: dict = Depends(admin_auth.require_permission("export_data")),
) -> dict[str, Any]:
    with db.db() as conn:
        rows = conn.execute(
            """
            SELECT id, module, format, row_count, file_hash, include_pii, created_by, created_at, expires_at
            FROM export_jobs
            ORDER BY created_at DESC LIMIT ?;
            """,
            (limit,),
        ).fetchall()

    jobs = []
    for r in rows:
        jobs.append({
            "job_id": r[0],
            "module": r[1],
            "format": r[2],
            "row_count": r[3],
            "file_hash": r[4],
            "include_pii": bool(r[5]),
            "created_by": r[6],
            "created_at": r[7],
            "expires_at": r[8],
        })

    return {"jobs": jobs, "total": len(jobs)}
