#!/usr/bin/env python3
"""
Test the new /api/applications/user endpoint
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_user_applications():
    """Test the user applications endpoint"""
    
    print("Testing user applications endpoint...")
    
    # Test 1: Test without authentication
    try:
        response = requests.get(f"{BASE_URL}/api/applications/user")
        print(f"✓ No auth (status: {response.status_code})")
        if response.status_code == 401:
            print("  - Expected authentication error (good)")
    except Exception as e:
        print(f"✗ No auth error: {e}")
    
    # Test 2: Test with company token (should fail)
    try:
        response = requests.post(f"{BASE_URL}/api/company/login", json={
            "email": "testcompany@example.com",
            "password": "testpassword123"
        })
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            
            response = requests.get(f"{BASE_URL}/api/applications/user", 
                                  headers={"Authorization": f"Bearer {token}"})
            print(f"✓ Company token (status: {response.status_code})")
            if response.status_code == 403:
                print("  - Expected forbidden error for company token (good)")
        else:
            print(f"✗ Company login failed: {response.text}")
    except Exception as e:
        print(f"✗ Company token error: {e}")
    
    # Test 3: Test with invalid token
    try:
        response = requests.get(f"{BASE_URL}/api/applications/user", 
                              headers={"Authorization": "Bearer invalid-token"})
        print(f"✓ Invalid token (status: {response.status_code})")
        if response.status_code == 401:
            print("  - Expected authentication error (good)")
    except Exception as e:
        print(f"✗ Invalid token error: {e}")
    
    print("User applications endpoint test completed!")

if __name__ == '__main__':
    test_user_applications()
