"""
Email Service Implementation (SMTP-only).

This project sends real OTP emails via SMTP.
Dev logging / fallback is intentionally disabled to avoid silent failures.
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

class SMTPEmailService:
    def __init__(self):
        self.host = os.environ.get('SMTP_HOST')
        self.port = int(os.environ.get('SMTP_PORT', 587))
        self.user = os.environ.get('SMTP_USER')
        self.password = os.environ.get('SMTP_PASSWORD')
        self.sender = os.environ.get('SMTP_SENDER', self.user)
        self.use_ssl = str(os.environ.get("SMTP_USE_SSL", "")).strip().lower() in {"1", "true", "yes"}
    
    def _looks_like_placeholder(self, value: Optional[str]) -> bool:
        if not value:
            return True
        v = value.strip().lower()
        return v in {"your-email@gmail.com", "your-gmail-app-password", "your-app-password", "change-me-in-production"}

    def is_configured(self) -> bool:
        """Check if all required SMTP settings are present"""
        if not all([self.host, self.port, self.user, self.password, self.sender]):
            return False
        if self._looks_like_placeholder(self.user) or self._looks_like_placeholder(self.password) or self._looks_like_placeholder(self.sender):
            return False
        return True

    def send_email(self, to_email: str, subject: str, body: str) -> bool:
        """Send email via SMTP"""
        if not self.is_configured():
            raise RuntimeError(
                "SMTP is not configured. Check SMTP_HOST/PORT/USER/PASSWORD/SENDER in `seo/backend/.env` "
                "and ensure PASSWORD is a Gmail App Password."
            )

        try:
            msg = MIMEMultipart()
            msg['From'] = self.sender
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))

            if self.use_ssl or self.port == 465:
                server = smtplib.SMTP_SSL(self.host, self.port, timeout=30)
            else:
                server = smtplib.SMTP(self.host, self.port, timeout=30)
                server.ehlo()
                server.starttls()
                server.ehlo()

            server.login(self.user, self.password)
            server.send_message(msg)
            server.quit()
            
            print(f"Real Email sent successfully to {to_email}")
            return True
        except Exception as e:
            # Bubble up a clear error so the API can show the real reason.
            raise RuntimeError(f"SMTP send failed: {e}") from e

class EmailServiceProxy:
    def __init__(self):
        self.smtp_service = SMTPEmailService()

    def send_email(self, to_email: str, subject: str, body: str) -> bool:
        """SMTP-only send."""
        return self.smtp_service.send_email(to_email, subject, body)

# Global instances
email_service = EmailServiceProxy()
