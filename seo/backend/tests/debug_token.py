#!/usr/bin/env python3
"""
Debug JWT token issues
"""
import requests
import json
import jwt

BASE_URL = "http://127.0.0.1:5000"

def debug_token():
    """Debug JWT token issues"""
    
    print("Debugging JWT token...")
    
    # Test login to get a fresh token
    try:
        response = requests.post(f"{BASE_URL}/api/company/login", json={
            "email": "testcompany@example.com",
            "password": "testpassword123"
        })
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            print(f"✓ Got token: {token[:50]}...")
            
            # Try to decode the token (without verification)
            try:
                decoded = jwt.decode(token, options={"verify_signature": False})
                print(f"✓ Token decoded: {json.dumps(decoded, indent=2)}")
            except Exception as e:
                print(f"✗ Failed to decode token: {e}")
            
            # Test the company/me endpoint
            print("\nTesting /api/company/me endpoint...")
            headers = {"Authorization": f"Bearer {token}"}
            me_response = requests.get(f"{BASE_URL}/api/company/me", headers=headers)
            print(f"Status: {me_response.status_code}")
            print(f"Response: {me_response.text}")
            
        else:
            print(f"✗ Login failed: {response.text}")
            
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == '__main__':
    debug_token()
