#!/usr/bin/env python3
"""
Debug the current authentication token issue
"""
import requests
import json
import jwt

BASE_URL = "http://127.0.0.1:5000"

def debug_current_token():
    """Debug the current token issue"""
    
    print("Debugging current authentication token...")
    
    # Check what's in localStorage by simulating
    print("1. Testing company login to get fresh token...")
    
    try:
        response = requests.post(f"{BASE_URL}/api/company/login", json={
            "email": "testcompany@example.com",
            "password": "testpassword123"
        })
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            print(f"✓ Got fresh token: {token[:50]}...")
            
            # Decode the token to see what's inside
            try:
                decoded = jwt.decode(token, options={"verify_signature": False})
                print(f"✓ Token decoded: {json.dumps(decoded, indent=2)}")
            except Exception as e:
                print(f"✗ Failed to decode token: {e}")
            
            # Test company/me endpoint
            print("\n2. Testing /api/company/me with fresh token...")
            headers = {"Authorization": f"Bearer {token}"}
            me_response = requests.get(f"{BASE_URL}/api/company/me", headers=headers)
            print(f"Status: {me_response.status_code}")
            print(f"Response: {me_response.text}")
            
            # Test auth/me endpoint
            print("\n3. Testing /api/auth/me with fresh token...")
            auth_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
            print(f"Status: {auth_response.status_code}")
            print(f"Response: {auth_response.text}")
            
        else:
            print(f"✗ Login failed: {response.text}")
            
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == '__main__':
    debug_current_token()
