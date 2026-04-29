#!/usr/bin/env python3
"""
Database migration script to add new fields to Application model
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models import Application

def migrate_application_fields():
    """Add new fields to Application model"""
    
    with app.app_context():
        try:
            # Check if the new columns already exist
            inspector = db.inspect(db.engine)
            columns = [column['name'] for column in inspector.get_columns('application')]
            
            # Add rejection_reason column if it doesn't exist
            if 'rejection_reason' not in columns:
                print("Adding rejection_reason column...")
                db.session.execute(db.text('ALTER TABLE application ADD COLUMN rejection_reason TEXT'))
                db.session.commit()
                print("✓ rejection_reason column added")
            else:
                print("✓ rejection_reason column already exists")
            
            # Add offer_letter column if it doesn't exist
            if 'offer_letter' not in columns:
                print("Adding offer_letter column...")
                db.session.execute(db.text('ALTER TABLE application ADD COLUMN offer_letter TEXT'))
                db.session.commit()
                print("✓ offer_letter column added")
            else:
                print("✓ offer_letter column already exists")
            
            print("Database migration completed successfully!")
            
        except Exception as e:
            print(f"Migration failed: {e}")
            return False
        
        return True

if __name__ == '__main__':
    migrate_application_fields()
