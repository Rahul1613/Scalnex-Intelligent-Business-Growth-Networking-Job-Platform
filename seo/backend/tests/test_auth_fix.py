#!/usr/bin/env python3
"""
Test the authentication fixes
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_auth_fixes():
    """Test the authentication fixes"""
    
    print("Testing authentication fixes...")
    
    # Test 1: Company Login and Token Validation
    print("\n1. Testing Company Login and Token Validation...")
    try:
        response = requests.post(f"{BASE_URL}/api/company/login", json={
            "email": "testcompany@example.com",
            "password": "testpassword123"
        })
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            print(f"✓ Company login successful")
            print(f"✓ Token: {token[:50]}...")
            
            # Test company/me endpoint
            headers = {"Authorization": f"Bearer {token}"}
            me_response = requests.get(f"{BASE_URL}/api/company/me", headers=headers)
            print(f"✓ Company/me status: {me_response.status_code}")
            
            # Test jobs/company endpoint
            jobs_response = requests.get(f"{BASE_URL}/api/jobs/company", headers=headers)
            print(f"✓ Jobs/company status: {jobs_response.status_code}")
            
            # Test applications/company endpoint
            apps_response = requests.get(f"{BASE_URL}/api/applications/company", headers=headers)
            print(f"✓ Applications/company status: {apps_response.status_code}")
            
        else:
            print(f"✗ Company login failed: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 2: User Login and Token Validation
    print("\n2. Testing User Login and Token Validation...")
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "testuser@example.com",
            "password": "testpassword123"
        })
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            print(f"✓ User login successful")
            print(f"✓ Token: {token[:50]}...")
            
            # Test auth/me endpoint
            headers = {"Authorization": f"Bearer {token}"}
            me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
            print(f"✓ Auth/me status: {me_response.status_code}")
            
            # Test applications/user endpoint
            apps_response = requests.get(f"{BASE_URL}/api/applications/user", headers=headers)
            print(f"✓ Applications/user status: {apps_response.status_code}")
            
        else:
            print(f"✗ User login failed: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 3: Invalid Token Handling
    print("\n3. Testing Invalid Token Handling...")
    try:
        headers = {"Authorization": "Bearer invalid_token"}
        
        # Test company/me with invalid token
        response = requests.get(f"{BASE_URL}/api/company/me", headers=headers)
        print(f"✓ Company/me with invalid token: {response.status_code}")
        
        # Test auth/me with invalid token
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        print(f"✓ Auth/me with invalid token: {response.status_code}")
        
        # Test applications/user with invalid token
        response = requests.get(f"{BASE_URL}/api/applications/user", headers=headers)
        print(f"✓ Applications/user with invalid token: {response.status_code}")
        
    except Exception as e:
        print(f"✗ Error: {e}")
    
    print("\nAuthentication fixes test completed!")

if __name__ == '__main__':
    test_auth_fixes()
