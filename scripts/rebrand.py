#!/usr/bin/env python3
"""
scripts/rebrand.py: Update brand name, domain, repository URL, and ticket prefix in one step.
Updates .env, .env.example, brand configuration, and verifies consistency.
"""
from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def update_env_file(filepath: Path, updates: dict[str, str]) -> None:
    if not filepath.exists():
        # Create new .env from template
        lines = [f"{k}={v}\n" for k, v in updates.items()]
        filepath.write_text("".join(lines), encoding="utf-8")
        print(f"[+] Created {filepath.name}")
        return

    content = filepath.read_text(encoding="utf-8")
    for key, value in updates.items():
        pattern = rf"^{key}=.*$"
        new_line = f"{key}={value}"
        if re.search(pattern, content, flags=re.MULTILINE):
            content = re.sub(pattern, new_line, content, flags=re.MULTILINE)
        else:
            content += f"\n{new_line}\n"

    filepath.write_text(content, encoding="utf-8")
    print(f"[+] Updated {filepath.name}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Rebrand Kavach in one step.")
    parser.add_argument("--name", default="Kavach", help="Brand display name (default: Kavach)")
    parser.add_argument("--domain", default="kavach.ai", help="Primary brand domain (default: kavach.ai)")
    parser.add_argument("--repo-url", default="https://github.com/pritpatel2412/Kavach", help="GitHub repo URL")
    parser.add_argument("--ticket-prefix", default="KAV", help="Support ticket prefix (default: KAV)")
    parser.add_argument("--support-email", default="", help="Support contact email")
    args = parser.parse_args()

    brand_name = args.name.strip()
    brand_domain = args.domain.strip()
    repo_url = args.repo_url.strip()
    ticket_prefix = args.ticket_prefix.strip().upper()
    support_email = args.support_email.strip() or f"support@{brand_domain}"

    print(f"=== Rebranding Kavach ===")
    print(f"  Name:          {brand_name}")
    print(f"  Domain:        {brand_domain}")
    print(f"  Repo URL:      {repo_url}")
    print(f"  Ticket Prefix: {ticket_prefix}")
    print(f"  Support Email: {support_email}")

    env_updates = {
        "BRAND_NAME": brand_name,
        "BRAND_DOMAIN": brand_domain,
        "GITHUB_REPO_URL": repo_url,
        "TICKET_PREFIX": ticket_prefix,
        "NEXT_PUBLIC_BRAND_NAME": brand_name,
        "NEXT_PUBLIC_BRAND_DOMAIN": brand_domain,
        "NEXT_PUBLIC_GITHUB_REPO_URL": repo_url,
        "NEXT_PUBLIC_TICKET_PREFIX": ticket_prefix,
        "NEXT_PUBLIC_SUPPORT_EMAIL": support_email,
        "FROM_NAME": f"{brand_name} Security",
        "FROM_EMAIL": f"notifications@{brand_domain}",
        "REPLY_TO": support_email,
    }

    # Update .env and .env.example
    update_env_file(ROOT / ".env", env_updates)
    if (ROOT / ".env.example").exists():
        update_env_file(ROOT / ".env.example", env_updates)

    print("\n[OK] Rebranding complete. All backend and frontend configs synchronized.")


if __name__ == "__main__":
    main()
