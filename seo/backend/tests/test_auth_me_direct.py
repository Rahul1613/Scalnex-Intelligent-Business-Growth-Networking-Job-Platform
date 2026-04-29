#!/usr/bin/env python3
"""
Test /api/auth/me endpoint directly
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_auth_me_direct():
    """Test /api/auth/me endpoint directly"""
    
    print("Testing /api/auth/me endpoint directly...")
    
    # Get user login token
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "testuser@example.com",
        "password": "testpassword123"
    })
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('token')
        print(f"Got token: {token[:50]}...")
        
        # Test auth/me endpoint
        headers = {"Authorization": f"Bearer {token}"}
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        
        print(f"Auth/me status: {me_response.status_code}")
        print(f"Auth/me headers: {dict(me_response.headers)}")
        print(f"Auth/me response: {me_response.text}")
        
        # Test with different header format
        headers2 = {"Authorization": token}
        me_response2 = requests.get(f"{BASE_URL}/api/auth/me", headers=headers2)
        print(f"Auth/me status (no Bearer): {me_response2.status_code}")
        print(f"Auth/me response (no Bearer): {me_response2.text}")
        
    else:
        print(f"Login failed: {response.text}")

if __name__ == '__main__':
    test_auth_me_direct()
