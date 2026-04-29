#!/usr/bin/env python3
"""
Create a test user for testing
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models import User
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def create_test_user():
    """Create a test user"""
    
    with app.app_context():
        try:
            # Check if test user already exists
            existing_user = User.query.filter_by(email='testuser@example.com').first()
            if existing_user:
                print("✓ Test user already exists")
                return
            
            # Create test user
            test_user = User(
                first_name='Test',
                last_name='User',
                email='testuser@example.com',
                password_hash=bcrypt.generate_password_hash('testpassword123'),
                email_verified=True
            )
            
            db.session.add(test_user)
            db.session.commit()
            
            print("✓ Test user created successfully")
            print("  Email: testuser@example.com")
            print("  Password: testpassword123")
            
        except Exception as e:
            print(f"✗ Error creating test user: {e}")

if __name__ == '__main__':
    create_test_user()
