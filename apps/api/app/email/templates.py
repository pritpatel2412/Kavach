"""Localized email templates (en/hi/gu with English fallback) and brand HTML layout."""
from __future__ import annotations

from typing import Any
from ..config import get_settings
from ..signed_token import create_action_token

# Master Brand Layout Template
HTML_LAYOUT = """<!DOCTYPE html>
<html lang="{locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
  <style>
    body {{ margin: 0; padding: 0; background-color: #f4f6f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917; }}
    .wrapper {{ width: 100%; max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e7e5e4; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }}
    .header {{ background: linear-gradient(160deg, #0a2a12 0%, #0d3617 100%); padding: 32px 24px; text-align: center; }}
    .brand {{ color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; text-decoration: none; }}
    .brand span {{ color: #c8f542; }}
    .content {{ padding: 36px 32px; font-size: 15px; line-height: 1.6; color: #292524; }}
    .btn {{ display: inline-block; background-color: #c8f542; color: #0a2a12 !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px; margin: 24px 0; text-align: center; }}
    .badge {{ display: inline-block; background: #e3e8dc; color: #0a2a12; font-family: monospace; font-size: 13px; font-weight: 700; padding: 6px 12px; border-radius: 6px; }}
    .alert-box {{ background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #991b1b; }}
    .footer {{ background: #f5f5f4; padding: 24px 32px; text-align: center; font-size: 12px; color: #78716c; border-top: 1px solid #e7e5e4; }}
    .footer a {{ color: #57534e; text-decoration: underline; }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <a href="{public_url}" class="brand">{brand_name} <span>Guardian</span></a>
    </div>
    <div class="content">
      {body_html}
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px;"><strong>{brand_name} Technologies India Pvt. Ltd.</strong><br>
      Cyber Defence Center, Outer Ring Road, Bengaluru, Karnataka 560103</p>
      {footer_extra}
    </div>
  </div>
</body>
</html>
"""

TEMPLATES: dict[str, dict[str, dict[str, str]]] = {
    "admin_login_link": {
        "en": {
            "subject": "Your {brand_name} Operations Console Magic Link",
            "html": """
              <h2>Administrative Console Access</h2>
              <p>You requested a secure, passwordless login link for the {brand_name} Security Operations Console.</p>
              <div style="text-align: center;">
                <a href="{login_link}" class="btn">Authenticate Admin Console</a>
              </div>
              <p style="font-size: 13px; color: #78716c;">This single-use link expires in {expires_in_minutes} minutes. Once authenticated, you will be prompted for your mandatory TOTP hardware code.</p>
              <p style="font-size: 12px; color: #a8a29e;">If you did not request this login link, please notify the security team immediately.</p>
            """,
            "text": "Your {brand_name} Admin Magic Link: {login_link}\n\nExpires in {expires_in_minutes} minutes. Hardware TOTP required upon verification.",
        }
    },
    "waitlist_confirm": {
        "en": {
            "subject": "Confirm your {brand_name} early access waitlist spot",
            "html": """
              <h2>Please confirm your email address</h2>
              <p>Hello {name},</p>
              <p>Thank you for signing up to protect your family with {brand_name}. Please confirm your email address to lock in your priority spot on the early access waitlist.</p>
              <div style="text-align: center;">
                <a href="{confirm_url}" class="btn">Confirm My Priority Access</a>
              </div>
              <p style="font-size: 13px; color: #78716c;">If you did not sign up for {brand_name}, you can safely disregard this email.</p>
            """,
            "text": "Hello {name},\n\nPlease confirm your {brand_name} early access spot by clicking this link: {confirm_url}\n\nThank you for protecting your elders.",
        },
        "hi": {
            "subject": "अपने {brand_name} वेटलिस्ट स्थान की पुष्टि करें",
            "html": """
              <h2>कृपया अपने ईमेल पते की पुष्टि करें</h2>
              <p>नमस्ते {name},</p>
              <p>{brand_name} के साथ अपने परिवार को सुरक्षित करने के लिए पंजीकरण करने हेतु धन्यवाद। प्रारंभिक वेटलिस्ट में अपना स्थान सुरक्षित करने के लिए कृपया नीचे दिए गए बटन पर क्लिक करें।</p>
              <div style="text-align: center;">
                <a href="{confirm_url}" class="btn">सुरक्षित स्थान की पुष्टि करें</a>
              </div>
            """,
            "text": "नमस्ते {name},\n\nकृपया {brand_name} वेटलिस्ट की पुष्टि करने के लिए इस लिंक पर क्लिक करें: {confirm_url}",
        },
        "gu": {
            "subject": "તમારા {brand_name} પ્રતીક્ષાસૂચિ સ્થાનની પુષ્ટિ કરો",
            "html": """
              <h2>કૃપા કરીને તમારા ઇમેઇલ સરનામાની પુષ્ટિ કરો</h2>
              <p>નમસ્તે {name},</p>
              <p>{brand_name} સાથે તમારા પરિવારને સ્કેમથી સુરક્ષિત કરવા બદલ આભાર. અગ્રતા પુષ્ટિ માટે નીચે આપેલા બટન પર ક્લિક કરો.</p>
              <div style="text-align: center;">
                <a href="{confirm_url}" class="btn">મારા સ્થાનની પુષ્ટિ કરો</a>
              </div>
            """,
            "text": "નમસ્તે {name},\n\n{brand_name} વેટલિસ્ટની પુષ્ટિ કરવા માટે આ લિંક પર ક્લિક કરો: {confirm_url}",
        },
    },
    "waitlist_welcome": {
        "en": {
            "subject": "You are confirmed! Welcome to {brand_name}",
            "html": """
              <h2>Welcome to the {brand_name} Circle!</h2>
              <p>Hello {name},</p>
              <p>Your spot is officially secured. We are rolling out invites to elder households in controlled batches to guarantee flawless living-room call acoustics and zero Gnani credit drops.</p>
              <p>Your waitlist priority rank: <span class="badge">PRIORITY-{rank}</span></p>
              <p>We will dispatch your beta onboarding invite as soon as your batch unlocks.</p>
            """,
            "text": "Hello {name},\n\nYour {brand_name} spot is secured! Priority: PRIORITY-{rank}.\nWe will contact you as soon as your batch unlocks.",
        }
    },
    "beta_invite": {
        "en": {
            "subject": "Your {brand_name} Beta Invite is ready",
            "html": """
              <h2>Your Private Beta Invite is Ready</h2>
              <p>Hello {name},</p>
              <p>We are delighted to invite your family to arm your elder's tabletop guardian with {brand_name}.</p>
              <p>Your single-use invite pass code:</p>
              <div style="text-align: center; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: 800; letter-spacing: 4px; padding: 12px 24px; background: #e3e8dc; border-radius: 8px; font-family: monospace; color: #0a2a12;">{invite_code}</span>
              </div>
              <div style="text-align: center;">
                <a href="{onboard_url}" class="btn">Get Started Now</a>
              </div>
              <p style="font-size: 13px; color: #78716c;">Discount coupon <strong>{coupon_code}</strong> has been pre-applied for 50% inaugural community sponsorship.</p>
            """,
            "text": "Hello {name},\n\nYour {brand_name} Beta Invite Code: {invite_code}\nStart here: {onboard_url}\nCoupon: {coupon_code}",
        }
    },
    "ticket_received": {
        "en": {
            "subject": "[{ticket_number}] We received your support request",
            "html": """
              <h2>Support Request Received</h2>
              <p>Hello {name},</p>
              <p>We received your support ticket regarding <strong>"{subject_clean}"</strong>.</p>
              <p>Ticket Number: <span class="badge">{ticket_number}</span></p>
              {emergency_notice}
              <p>You can track updates and respond securely at your customer portal:</p>
              <div style="text-align: center;">
                <a href="{portal_url}" class="btn">View Ticket Portal</a>
              </div>
              <p style="font-size: 13px; color: #78716c;">Expected initial response time: within {sla_hours} hours.</p>
            """,
            "text": "Hello {name},\n\nSupport Ticket [{ticket_number}] received for: {subject_clean}.\nTrack here: {portal_url}",
        }
    },
    "ticket_reply": {
        "en": {
            "subject": "[{ticket_number}] New reply from {brand_name} Support",
            "html": """
              <h2>New Message from {agent_name}</h2>
              <p>Hello {name},</p>
              <p>A support specialist has responded to your ticket <strong>{ticket_number}</strong>:</p>
              <div style="background: #f5f5f4; border-radius: 12px; padding: 20px; margin: 20px 0; font-size: 14px; color: #1c1917; white-space: pre-wrap;">{reply_body}</div>
              <div style="text-align: center;">
                <a href="{portal_url}" class="btn">Reply on Customer Portal</a>
              </div>
            """,
            "text": "Hello {name},\n\nNew reply on ticket {ticket_number}:\n\n{reply_body}\n\nView here: {portal_url}",
        }
    },
    "ticket_solved_csat": {
        "en": {
            "subject": "[{ticket_number}] Your support request has been solved",
            "html": """
              <h2>Your Issue is Marked Solved</h2>
              <p>Hello {name},</p>
              <p>Your support ticket <strong>{ticket_number}</strong> has been resolved. How did we do?</p>
              <p style="text-align: center; margin: 24px 0;">
                <a href="{portal_url}?csat=5" style="display:inline-block; margin: 0 4px; font-size: 24px; text-decoration: none;">⭐️⭐️⭐️⭐️⭐️ Great</a><br><br>
                <a href="{portal_url}?csat=1" style="font-size: 13px; color: #78716c;">Not satisfied? Reopen ticket</a>
              </p>
            """,
            "text": "Hello {name},\n\nTicket {ticket_number} is solved. Rate our service: {portal_url}",
        }
    },
    "coupon_gift": {
        "en": {
            "subject": "A special {brand_name} protection pass has been gifted to you",
            "html": """
              <h2>Special Scam Guardian Voucher</h2>
              <p>Hello {name},</p>
              <p>You have received a community sponsorship pass for {brand_name}.</p>
              <p style="text-align: center; font-size: 22px; font-weight: 800; font-family: monospace; color: #0a2a12;">{coupon_code}</p>
              <p style="text-align: center;">Benefit: <strong>{discount_description}</strong></p>
              <div style="text-align: center;">
                <a href="{pricing_url}?code={coupon_code}" class="btn">Claim Protection Pass</a>
              </div>
            """,
            "text": "Hello {name},\n\nYour {brand_name} coupon code is {coupon_code} ({discount_description}). Claim: {pricing_url}?code={coupon_code}",
        }
    },
    "broadcast_base": {
        "en": {
            "subject": "{subject_title}",
            "html": """
              <h2>{headline}</h2>
              <div>{body_html}</div>
            """,
            "text": "{headline}\n\n{body_text}",
        }
    },
}


def render_template(
    template_name: str,
    locale: str = "en",
    variables: dict | None = None,
    is_marketing: bool = False,
    recipient: str = "",
) -> tuple[str, str, str]:
    """Render localized template returning (subject, html_body, text_body)."""
    s = get_settings()
    vars_clean = dict(variables or {})
    vars_clean.setdefault("brand_name", s.brand_name)
    vars_clean.setdefault("brand_domain", s.brand_domain)
    vars_clean.setdefault("public_url", s.public_url)

    if vars_clean.get("is_scam_emergency"):
        vars_clean["emergency_notice"] = """
          <div class="alert-box">
            <strong>🚨 PRIORITY SCAM EMERGENCY PROTOCOL</strong><br>
            If an elder is currently on a suspicious call demanding funds, hang up immediately.<br>
            Dial the National Cybercrime Helpline: <strong>1930</strong> or register at <strong>cybercrime.gov.in</strong> immediately.
          </div>
        """
    else:
        vars_clean.setdefault("emergency_notice", "")

    tmpl_data = TEMPLATES.get(template_name)
    if not tmpl_data:
        raise ValueError(f"Unknown email template: {template_name}")

    # Fallback to English if requested locale is missing
    loc = locale if locale in tmpl_data else "en"
    if loc not in tmpl_data:
        loc = next(iter(tmpl_data))

    entry = tmpl_data[loc]
    raw_subject = entry["subject"].format(**vars_clean)
    raw_html = entry["html"].format(**vars_clean)
    raw_text = entry["text"].format(**vars_clean)


    # Marketing footer with unsubscribe token
    footer_extra = ""
    if is_marketing and recipient:
        unsub_token = create_action_token(recipient, purpose="email_unsubscribe", ttl_s=86400 * 365)
        unsub_url = f"{s.public_url}/unsubscribe?token={unsub_token}"
        footer_extra = f"""
          <p style="margin: 8px 0 0; font-size: 11px;">
            You received this broadcast because you registered for {s.brand_name} updates.<br>
            <a href="{unsub_url}">Unsubscribe with 1-click</a> · <a href="{s.public_url}/privacy">Privacy Policy</a>
          </p>
        """
        raw_text += f"\n\nTo unsubscribe from updates: {unsub_url}"

    full_html = HTML_LAYOUT.format(
        locale=loc,
        subject=raw_subject,
        brand_name=s.brand_name,
        public_url=s.public_url,
        body_html=raw_html,
        footer_extra=footer_extra,
    )

    return raw_subject, full_html, raw_text
