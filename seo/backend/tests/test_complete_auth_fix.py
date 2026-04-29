#!/usr/bin/env python3
"""
Complete authentication fix test
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_complete_auth_fix():
    """Test complete authentication fix"""
    
    print("Testing complete authentication fix...")
    
    # Test 1: User Login
    print("\n1. Testing User Login...")
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "testuser@example.com",
        "password": "testpassword123"
    })
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('token')
        print(f"✓ User login successful")
        print(f"✓ User data: {data.get('user', {}).get('firstName')} {data.get('user', {}).get('lastName')}")
        
        # Test 2: User Auth/Me
        print("\n2. Testing User Auth/Me...")
        headers = {"Authorization": f"Bearer {token}"}
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        
        if me_response.status_code == 200:
            print("✓ User auth/me successful")
            user_data = me_response.json().get('user', {})
            print(f"✓ User: {user_data.get('firstName')} {user_data.get('lastName')}")
        else:
            print(f"✗ User auth/me failed: {me_response.status_code}")
            print(f"✗ Response: {me_response.text}")
        
        # Test 3: User Applications
        print("\n3. Testing User Applications...")
        apps_response = requests.get(f"{BASE_URL}/api/applications/user", headers=headers)
        
        if apps_response.status_code == 200:
            print("✓ User applications successful")
            apps_data = apps_response.json().get('data', [])
            print(f"✓ Applications count: {len(apps_data)}")
        else:
            print(f"✗ User applications failed: {apps_response.status_code}")
            print(f"✗ Response: {apps_response.text}")
            
    else:
        print(f"✗ User login failed: {response.status_code}")
        print(f"✗ Response: {response.text}")
    
    # Test 4: Company Login
    print("\n4. Testing Company Login...")
    response = requests.post(f"{BASE_URL}/api/company/login", json={
        "email": "testcompany@example.com",
        "password": "testpassword123"
    })
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('token')
        print(f"✓ Company login successful")
        print(f"✓ Company: {data.get('company', {}).get('companyName')}")
        
        # Test 5: Company Me
        print("\n5. Testing Company Me...")
        headers = {"Authorization": f"Bearer {token}"}
        me_response = requests.get(f"{BASE_URL}/api/company/me", headers=headers)
        
        if me_response.status_code == 200:
            print("✓ Company me successful")
        else:
            print(f"✗ Company me failed: {me_response.status_code}")
            
    else:
        print(f"✗ Company login failed: {response.status_code}")

if __name__ == '__main__':
    test_complete_auth_fix()
