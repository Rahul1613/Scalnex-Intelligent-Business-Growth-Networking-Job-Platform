from app import app, db
from models import User, Company, AuditLog

with app.app_context():
    print(f"Total Users: {User.query.count()}")
    print(f"Users with role='user': {User.query.filter_by(role='user').count()}")
    print(f"Total Companies: {Company.query.count()}")
    print(f"Total Audit Logs: {AuditLog.query.count()}")
