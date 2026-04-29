#!/usr/bin/env python3
"""
Test new token creation
"""
import app
from app import app, db
from models import User
from flask_jwt_extended import create_access_token
import jwt

def test_new_token():
    """Test new token creation"""
    
    with app.app_context():
        user = User.query.filter_by(email='testuser@example.com').first()
        if user:
            # Test the new token creation
            token = create_access_token(identity=str(user.id), additional_claims={'role': 'user'})
            print(f'New token: {token}')
            
            # Decode to check
            decoded = jwt.decode(token, options={'verify_signature': False})
            print(f'New decoded token: {decoded}')
            print(f'New sub type: {type(decoded.get("sub"))}')
        else:
            print('User not found')

if __name__ == '__main__':
    test_new_token()
