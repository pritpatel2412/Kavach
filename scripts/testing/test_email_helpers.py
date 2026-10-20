"""Test helper for L11 email suite."""
import sys
import json
from pathlib import Path

# Add project paths
sys.path.insert(0, str(Path("apps/api").resolve()))

from app.email.templates import TEMPLATES, render_template
from app.email.sender import send_raw_email, validate_header_value
from app.email.suppression import add_to_suppression_list, is_suppressed

def run_checks():
    results = {}

    # 1. Multi-language template rendering
    sample_vars = {
        'brand_name': 'Kavach',
        'name': 'Dada Ji',
        'confirm_url': 'http://localhost:8000/confirm',
        'login_link': 'http://localhost:3002/auth',
        'expires_in_minutes': 15,
        'rank': 42,
        'invite_code': 'BETA-1234',
        'onboard_url': 'http://localhost:3000/onboard',
        'coupon_code': 'DEMO50',
        'discount_description': '50% Community Discount',
        'pricing_url': 'http://localhost:3000/pricing',
        'subject_title': 'Community Update',
        'body_html': '<p>Scam Advisory</p>',
        'ticket_number': 'KAV-001',
        'subject_clean': 'Emergency Report',
        'portal_url': 'http://localhost:8000/portal',
        'sla_hours': 12,
        'agent_name': 'Prit',
        'reply_body': 'We are monitoring the line.',
        'solution_summary': 'Hang up confirmed.',
        'csat_url': 'http://localhost:8000/csat',
        'elder_name': 'Kishore',
        'scam_type': 'digital_arrest',
        'confidence_pct': 98,
        'guidance_step': 'Call 1930',
        'call_time_ist': '7:30 PM IST',
        'headline': 'Security Advisory',
        'body_text': 'Beware of fake CBI calls.',
        'cta_label': 'Learn More',
        'cta_url': 'http://localhost:3000/advisory'
    }

    rendered_count = 0
    for tmpl in TEMPLATES:
        for loc in ['en', 'hi', 'gu']:
            subj, html, text = render_template(tmpl, loc, sample_vars)
            if len(subj) > 0 and len(html) > 0 and len(text) > 0:
                rendered_count += 1
    results['rendered_count'] = rendered_count

    # 2. RFC 8058 List-Unsubscribe
    class MockSmtp:
        def __init__(self):
            self.last_msg = None
        def send_message(self, msg):
            self.last_msg = msg

    client = MockSmtp()
    send_raw_email('user@example.com', 'Subject', '<p>Test</p>', 'Test', is_marketing=True, custom_smtp_client=client)
    msg = client.last_msg
    results['has_rfc_unsub'] = ('List-Unsubscribe' in msg) and (msg.get('List-Unsubscribe-Post') == 'List-Unsubscribe=One-Click')

    # 3. CRLF header injection defense
    crlf_caught = False
    try:
        validate_header_value('To', 'victim@example.com\r\nBcc: hacker@evil.com')
    except ValueError:
        crlf_caught = True
    results['crlf_caught'] = crlf_caught

    # 4. Suppression list
    add_to_suppression_list('suppressed_user@example.com', 'unsubscribed')
    results['suppression_working'] = is_suppressed('suppressed_user@example.com') and not is_suppressed('active_user@example.com')

    print(json.dumps(results))

if __name__ == '__main__':
    run_checks()
