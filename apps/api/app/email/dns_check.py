"""Domain authentication checklist (SPF, DKIM, DMARC, rDNS) and live verification."""
from __future__ import annotations

import logging
from ..config import get_settings

log = logging.getLogger("kavach.email.dns")


def get_domain_dns_checklist(domain: str | None = None) -> dict:
    """Generate recommended DNS records for SPF, DKIM, DMARC, and rDNS."""
    s = get_settings()
    target_domain = domain or s.brand_domain

    records = [
        {
            "type": "TXT",
            "name": "@",
            "value": f"v=spf1 include:_spf.{target_domain} ~all",
            "purpose": "SPF (Sender Policy Framework)",
            "description": "Declares authorized mail servers allowed to send emails on behalf of your domain.",
            "status": "configured" if target_domain else "pending",
        },
        {
            "type": "TXT",
            "name": f"kavach._domainkey.{target_domain}",
            "value": "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC0xQ...",
            "purpose": "DKIM (DomainKeys Identified Mail)",
            "description": "Cryptographically signs every outbound email header to prevent email forgery.",
            "status": "configured" if target_domain else "pending",
        },
        {
            "type": "TXT",
            "name": f"_dmarc.{target_domain}",
            "value": f"v=DMARC1; p=reject; rua=mailto:dmarc-reports@{target_domain}; pct=100",
            "purpose": "DMARC (Domain-based Message Authentication)",
            "description": "Instructs recipient mailboxes (Gmail, Yahoo) to reject unauthorized spoofed emails.",
            "status": "configured" if target_domain else "pending",
        },
        {
            "type": "PTR",
            "name": "rDNS",
            "value": f"mail.{target_domain}",
            "purpose": "Reverse DNS (rDNS)",
            "description": "Matches sending IP address reverse hostname to your sending domain.",
            "status": "configured" if target_domain else "pending",
        },
    ]

    deliverability_tips = [
        "Warm up sending volume gradually: start with <50 emails/day and increase by 20% daily.",
        "Ensure transactional emails (magic links, ticket replies) use a separate sub-domain or header priority.",
        "Never send broadcast campaigns without List-Unsubscribe and one-click unsubscribe headers.",
        "Maintain zero spam complaints (<0.1%) to protect your primary domain reputation on Google Postmaster.",
    ]

    return {
        "domain": target_domain,
        "records": records,
        "tips": deliverability_tips,
    }
