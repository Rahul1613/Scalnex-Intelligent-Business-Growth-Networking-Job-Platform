from __future__ import annotations

from datetime import datetime

from .db import db


class Business(db.Model):
    """
    business.db only:
    - business login & profile
    """

    __bind_key__ = "business"
    # Keep legacy table name to minimize endpoint refactors.
    __tablename__ = "company"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    company_name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    website = db.Column(db.String(255))
    industry = db.Column(db.String(100))
    location = db.Column(db.String(120))

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    email_verified = db.Column(db.Boolean, default=False, nullable=False)
    email_otp = db.Column(db.String(6))
    otp_expires_at = db.Column(db.DateTime)
    otp_attempts = db.Column(db.Integer, default=0, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "companyName": self.company_name,
            "businessName": self.company_name,
            "description": self.description,
            "website": self.website,
            "industry": self.industry,
            "location": self.location,
        }


class BusinessProfile(db.Model):
    """
    Optional extended profile for marketplace / discovery.
    Kept in business.db to avoid mixing with user.db.
    """

    __bind_key__ = "business"
    __tablename__ = "business_profile"

    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(
        db.Integer, db.ForeignKey("company.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )

    business_category = db.Column(db.String(80))
    website_url = db.Column(db.String(255))
    linkedin = db.Column(db.String(255))
    instagram = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    company_ref = db.relationship(
        "Business",
        backref=db.backref("profile", uselist=False, cascade="all, delete-orphan"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "companyId": self.company_id,
            "businessId": self.company_id,
            "businessName": self.company_ref.company_name if self.company_ref else None,
            "businessCategory": self.business_category,
            "websiteUrl": self.website_url,
            "linkedinPage": self.linkedin,
            "instagramProfile": self.instagram,
        }


class Product(db.Model):
    __bind_key__ = "business"
    __tablename__ = "product"

    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey("company.id", ondelete="CASCADE"), nullable=False, index=True)

    name = db.Column(db.String(160), nullable=False)
    description = db.Column(db.Text)
    price_cents = db.Column(db.Integer)
    currency = db.Column(db.String(8), default="USD", nullable=False)
    status = db.Column(db.String(20), default="active", nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class ContentPost(db.Model):
    """
    Content studio: posts + schedules (single normalized row with optional schedule fields).
    """

    __bind_key__ = "business"
    # Keep legacy naming/shape used by frontend.
    __tablename__ = "content_item"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("company.id", ondelete="CASCADE"), nullable=False, index=True)

    date = db.Column(db.String(20))  # YYYY-MM-DD
    platform = db.Column(db.String(50))
    type = db.Column(db.String(50))  # Video, Carousel, Static, Story
    topic = db.Column(db.String(200))
    caption = db.Column(db.Text)
    drive_url = db.Column(db.String(500))

    status = db.Column(db.String(20), default="Draft", nullable=False)  # Draft/Scheduled/Posted
    date_posted = db.Column(db.DateTime)

    responsible_name = db.Column(db.String(100))
    responsible_photo = db.Column(db.String(200))

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    # Legacy model didn't track updated_at; keep optional for future use.
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "date": self.date,
            "platform": self.platform,
            "type": self.type,
            "topic": self.topic,
            "caption": self.caption,
            "driveUrl": self.drive_url,
            "status": self.status,
            "datePosted": self.date_posted.isoformat() if self.date_posted else None,
            "responsibleName": self.responsible_name,
            "responsiblePhoto": self.responsible_photo,
        }


class RecruitmentJob(db.Model):
    __bind_key__ = "business"
    __tablename__ = "job_listing"

    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey("company.id", ondelete="CASCADE"), nullable=False, index=True)

    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text)
    location = db.Column(db.String(120))
    job_type = db.Column(db.String(50))
    salary_range = db.Column(db.String(100))

    status = db.Column(db.String(20), default="active", nullable=False)  # active/closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "companyId": self.company_id,
            "title": self.title,
            "description": self.description,
            "requirements": self.requirements,
            "location": self.location,
            "jobType": self.job_type,
            "salaryRange": self.salary_range,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class RecruitmentApplication(db.Model):
    """
    Business-side application tracking (business.db).
    No cross-db foreign keys. Linked to user.db via applicant_user_id (optional) + shared UUID.
    """

    __bind_key__ = "business"
    __tablename__ = "application"

    id = db.Column(db.Integer, primary_key=True)
    application_uuid = db.Column(db.String(36), unique=True, nullable=False, index=True)

    company_id = db.Column(db.Integer, db.ForeignKey("company.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = db.Column(db.Integer, db.ForeignKey("job_listing.id", ondelete="CASCADE"), nullable=False, index=True)

    applicant_user_id = db.Column(db.Integer, index=True)
    applicant_name = db.Column(db.String(120))
    applicant_email = db.Column(db.String(120), index=True)

    cover_letter = db.Column(db.Text)
    resume_path = db.Column(db.String(500))

    # Stages: pending -> screening -> interview -> selected/rejected
    # Keep backward-compatible values (accepted) for older records.
    status = db.Column(db.String(20), default="pending", nullable=False)
    applied_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "job": {"id": self.job_id},
            "user": {
                "id": self.applicant_user_id,
                "name": self.applicant_name,
                "email": self.applicant_email,
            },
            "coverLetter": self.cover_letter,
            "resume": self.resume_path,
            "status": self.status,
            "createdAt": self.applied_at.isoformat() if self.applied_at else None,
            "messages": [m.to_dict() for m in getattr(self, 'messages', [])],
        }


class ApplicationMessage(db.Model):
    __bind_key__ = "business"
    __tablename__ = "application_message"

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey("application.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = db.Column(db.String(32), nullable=False)  # 'company' | 'applicant' | 'system'
    message = db.Column(db.Text, nullable=False)
    attachment_name = db.Column(db.String(255))
    attachment_data = db.Column(db.Text)  # optional base64 or storage path
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    application = db.relationship("RecruitmentApplication", backref=db.backref("messages", cascade="all, delete-orphan"))

    def to_dict(self):
        return {
            "id": self.id,
            "applicationId": self.application_id,
            "sender": self.sender,
            "message": self.message,
            "attachmentName": self.attachment_name,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Employee(db.Model):
    __bind_key__ = "business"
    __tablename__ = "employee"

    id = db.Column(db.Integer, primary_key=True)
    # Keep legacy naming: employees were keyed by `user_id` in existing endpoints.
    user_id = db.Column(db.Integer, db.ForeignKey("company.id", ondelete="CASCADE"), nullable=False, index=True)

    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    position = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100))
    hire_date = db.Column(db.DateTime, nullable=False)
    salary = db.Column(db.Float)
    status = db.Column(db.String(20), default="active", nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "position": self.position,
            "department": self.department,
            "hireDate": self.hire_date.isoformat() if self.hire_date else None,
            "salary": self.salary,
            "status": self.status,
        }


class GrowthTip(db.Model):
    __bind_key__ = "business"
    __tablename__ = "growth_tip"

    id = db.Column(db.Integer, primary_key=True)
    # Keep legacy naming: growth tips were keyed by `user_id` in existing endpoints.
    user_id = db.Column(db.Integer, db.ForeignKey("company.id", ondelete="CASCADE"), nullable=False, index=True)
    tip_id = db.Column(db.String(50), nullable=False)

    implemented = db.Column(db.Boolean, default=False, nullable=False)
    implemented_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "tipId": self.tip_id,
            "implemented": self.implemented,
            "implementedAt": self.implemented_at.isoformat() if self.implemented_at else None,
        }


class AIKnowledgeFile(db.Model):
    """
    Metadata only (NO content).
    Uploaded file stored on disk under /uploads/{business_id}/... and only the path is stored here.
    """

    __bind_key__ = "business"
    __tablename__ = "rag_files"

    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey("company.id", ondelete="CASCADE"), nullable=False, index=True)

    file_id = db.Column(db.String(36), unique=True, nullable=False, index=True)
    original_filename = db.Column(db.String(255), nullable=False)
    storage_path = db.Column(db.String(600), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "file_id": self.file_id,
            "filename": self.original_filename,
            "path": self.storage_path,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

