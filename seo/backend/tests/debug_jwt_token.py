#!/usr/bin/env python3
"""
Debug JWT token issue
"""
import jwt
import requests

BASE_URL = "http://127.0.0.1:5000"

def debug_jwt_token():
    """Debug JWT token"""
    
    print("Debugging JWT token...")
    
    # Get user login token
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "testuser@example.com",
        "password": "testpassword123"
    })
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('token')
        print(f"Token: {token}")
        
        try:
            # Decode token without verification to see payload
            decoded = jwt.decode(token, options={"verify_signature": False})
            print(f"Decoded token: {decoded}")
            
            user_id = decoded.get('sub')
            print(f"User ID from token: {user_id}")
            print(f"User ID type: {type(user_id)}")
            
        except Exception as e:
            print(f"Error decoding token: {e}")
    else:
        print(f"Login failed: {response.text}")

if __name__ == '__main__':
    debug_jwt_token()
