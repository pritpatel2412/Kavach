"""Lightweight local SMTP sink for Kavach testing.

Listens on 127.0.0.1:1025 and records all incoming RFC 822 messages
to docs/testing/artifacts/smtp_inbox.jsonl for test assertion verification.
"""
import asyncio
import email
from email import policy
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

OUT_FILE = Path(__file__).resolve().parent.parent.parent / "docs" / "testing" / "artifacts" / "smtp_inbox.jsonl"
OUT_FILE.parent.mkdir(parents=True, exist_ok=True)


class SmtpProtocol(asyncio.Protocol):
    def __init__(self):
        self.buffer = bytearray()
        self.state = "INIT"
        self.mail_from = ""
        self.rcpt_to = []

    def connection_made(self, transport):
        self.transport = transport
        self.transport.write(b"220 kavach-test-smtp ready\r\n")

    def data_received(self, data):
        self.buffer.extend(data)
        while b"\r\n" in self.buffer:
            line_bytes, _, self.buffer = self.buffer.partition(b"\r\n")
            line = line_bytes.decode("utf-8", errors="replace")

            if self.state == "DATA":
                if line == ".":
                    self.state = "CMD"
                    self._save_message()
                    self.transport.write(b"250 OK: message queued\r\n")
                    self.data_lines = []
                else:
                    # dot-unstuffing
                    if line.startswith(".."):
                        line = line[1:]
                    self.data_lines.append(line)
                continue

            cmd = line.split(" ", 1)[0].upper()
            if cmd in ("HELO", "EHLO"):
                self.transport.write(b"250-kavach-test-smtp\r\n250 HELP\r\n")
            elif cmd == "MAIL":
                self.mail_from = line
                self.rcpt_to = []
                self.transport.write(b"250 OK\r\n")
            elif cmd == "RCPT":
                self.rcpt_to.append(line)
                self.transport.write(b"250 OK\r\n")
            elif cmd == "DATA":
                self.state = "DATA"
                self.data_lines = []
                self.transport.write(b"354 End data with <CR><LF>.<CR><LF>\r\n")
            elif cmd == "QUIT":
                self.transport.write(b"221 Bye\r\n")
                self.transport.close()
            elif cmd == "RSET":
                self.mail_from = ""
                self.rcpt_to = []
                self.transport.write(b"250 OK\r\n")
            elif cmd == "NOOP":
                self.transport.write(b"250 OK\r\n")
            else:
                self.transport.write(b"250 OK\r\n")

    def _save_message(self):
        raw_msg = "\r\n".join(self.data_lines)
        parsed = email.message_from_string(raw_msg, policy=policy.default)
        
        body_text = ""
        body_html = ""
        if parsed.is_multipart():
            for part in parsed.walk():
                ctype = part.get_content_type()
                if ctype == "text/plain":
                    body_text = part.get_payload(decode=True).decode(errors="replace")
                elif ctype == "text/html":
                    body_html = part.get_payload(decode=True).decode(errors="replace")
        else:
            body_text = parsed.get_payload(decode=True).decode(errors="replace")

        record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "from": self.mail_from,
            "to": self.rcpt_to,
            "subject": parsed.get("subject", ""),
            "headers": dict(parsed.items()),
            "body_text": body_text,
            "body_html": body_html,
        }

        with open(OUT_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
        print(f"[SMTP] Captured email: {record['subject']} -> {record['to']}")


async def main():
    loop = asyncio.get_running_loop()
    server = await loop.create_server(SmtpProtocol, "127.0.0.1", 1025)
    print("Kavach Test SMTP server listening on 127.0.0.1:1025...")
    async with server:
        await server.serve_forever()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("SMTP server stopped.")
