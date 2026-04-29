#!/usr/bin/env python3
"""
Debug user login issue
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def debug_user_login():
    """Debug user login"""
    
    print("Debugging user login...")
    
    # Test user login with detailed output
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "testuser@example.com",
        "password": "testpassword123"
    })
    
    print(f"Status: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('token')
        print(f"✓ User login successful")
        print(f"✓ Token: {token[:50]}...")
        
        # Test auth/me endpoint
        headers = {"Authorization": f"Bearer {token}"}
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        print(f"✓ Auth/me status: {me_response.status_code}")
        print(f"✓ Auth/me response: {me_response.text}")
        
    else:
        print(f"✗ User login failed")
        
    # Test company login for comparison
    print("\nTesting company login for comparison...")
    response = requests.post(f"{BASE_URL}/api/company/login", json={
        "email": "testcompany@example.com",
        "password": "testpassword123"
    })
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == '__main__':
    debug_user_login()
