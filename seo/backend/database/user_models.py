from __future__ import annotations

from datetime import datetime

from .db import db


class User(db.Model):
    """
    user.db only:
    - user login & profile
    - job applications (user-side tracking)
    - notifications
    """

    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # OTP / verification (used by auth flows)
    email_verified = db.Column(db.Boolean, default=False, nullable=False)
    email_otp = db.Column(db.String(6))
    otp_expires_at = db.Column(db.DateTime)
    otp_attempts = db.Column(db.Integer, default=0, nullable=False)

    # Relationships (user.db only)
    applications = db.relationship(
        "UserJobApplication", backref="user", cascade="all, delete-orphan"
    )
    notifications = db.relationship(
        "Notification", backref="user", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "firstName": self.first_name,
            "lastName": self.last_name,
        }


class UserProfile(db.Model):
    __tablename__ = "user_profile"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), unique=True, nullable=False)

    headline = db.Column(db.String(120))
    phone = db.Column(db.String(40))
    location = db.Column(db.String(120))

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = db.relationship("User", backref=db.backref("profile", uselist=False, cascade="all, delete-orphan"))

    def to_dict(self):
        return {
            "headline": self.headline,
            "phone": self.phone,
            "location": self.location,
        }


class UserJobApplication(db.Model):
    """
    User-side application tracking (user.db).
    No cross-db foreign keys. We link to business/job via IDs + a shared UUID.
    """

    __tablename__ = "user_job_application"

    id = db.Column(db.Integer, primary_key=True)
    application_uuid = db.Column(db.String(36), unique=True, nullable=False, index=True)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)

    business_id = db.Column(db.Integer, nullable=False, index=True)
    job_id = db.Column(db.Integer, nullable=False, index=True)

    cover_letter = db.Column(db.Text)
    resume_path = db.Column(db.String(500))

    status = db.Column(db.String(20), default="pending", nullable=False)  # pending/accepted/rejected

    applied_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "applicationUuid": self.application_uuid,
            "userId": self.user_id,
            "businessId": self.business_id,
            "jobId": self.job_id,
            "coverLetter": self.cover_letter,
            "resumePath": self.resume_path,
            "status": self.status,
            "appliedAt": self.applied_at.isoformat() if self.applied_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class Notification(db.Model):
    __tablename__ = "notification"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)

    title = db.Column(db.String(120), nullable=False)
    body = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(40), default="system", nullable=False)
    read_at = db.Column(db.DateTime)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "body": self.body,
            "type": self.type,
            "readAt": self.read_at.isoformat() if self.read_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class UserSettings(db.Model):
    __tablename__ = "user_settings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), unique=True, nullable=False)

    theme = db.Column(db.String(20), default="light", nullable=False)  # light/dark
    email_notifications = db.Column(db.Boolean, default=True, nullable=False)
    seo_alerts = db.Column(db.Boolean, default=True, nullable=False)
    weekly_reports = db.Column(db.Boolean, default=True, nullable=False)
    marketing_emails = db.Column(db.Boolean, default=False, nullable=False)
    profile_visibility = db.Column(db.String(20), default="private", nullable=False)  # public/private
    data_sharing = db.Column(db.Boolean, default=False, nullable=False)
    analytics_tracking = db.Column(db.Boolean, default=True, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "theme": self.theme,
            "emailNotifications": self.email_notifications,
            "seoAlerts": self.seo_alerts,
            "weeklyReports": self.weekly_reports,
            "marketingEmails": self.marketing_emails,
            "profileVisibility": self.profile_visibility,
            "dataSharing": self.data_sharing,
            "analyticsTracking": self.analytics_tracking,
        }

