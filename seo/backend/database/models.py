"""
Split-database model exports.

This project uses two SQLite databases via SQLAlchemy binds:
- user.db (default bind): user login & profile, notifications, user-side job applications
- business.db (bind key: "business"): business login & profile, products, content studio,
  recruitment (jobs + applications), employees, growth tips, AI Bot metadata

To avoid large refactors, `database.models` re-exports the split models.
"""

from .db import db  # noqa: F401

# user.db models
from .user_models import (  # noqa: F401
    Notification,
    User,
    UserJobApplication,
    UserProfile,
    UserSettings,
)

# business.db models
from .business_models import (  # noqa: F401
    AIKnowledgeFile,
    ApplicationMessage,
    Business,
    BusinessProfile,
    ContentPost,
    Employee,
    GrowthTip,
    Product,
    RecruitmentApplication,
    RecruitmentJob,
)
