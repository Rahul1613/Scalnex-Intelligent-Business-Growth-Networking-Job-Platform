from models import User, Company, db
from app import app

with app.app_context():
    print("=== USERS ===")
    users = User.query.all()
    for user in users:
        print(f'User ID: {user.id}, Email: {user.email}, Role: {getattr(user, "role", "No role field")}')
    
    print("\n=== COMPANIES ===")
    companies = Company.query.all()
    for company in companies:
        print(f'Company ID: {company.id}, Email: {company.email}')
    
    print("\n=== CHECKING USER 'Your Business Admin' ===")
    # Look for the user that might be "Your Business Admin"
    admin_user = User.query.filter(User.email.like('%admin%')).first()
    if admin_user:
        print(f'Found admin user: ID {admin_user.id}, Email: {admin_user.email}')
    else:
        print("No admin user found")
