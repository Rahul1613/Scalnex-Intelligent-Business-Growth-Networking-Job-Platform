#!/usr/bin/env python3
"""
Test signup functionality
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_signup():
    """Test signup functionality"""
    
    print("Testing signup functionality...")
    
    # Test 1: Company Signup
    print("\n1. Testing Company Signup...")
    try:
        response = requests.post(f"{BASE_URL}/api/company/register", json={
            "email": f"testcompany{int(time.time())}@example.com",
            "password": "testpassword123",
            "companyName": "Test Company Inc"
        })
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("✓ Company signup successful")
        elif response.status_code == 409:
            print("✓ Company already exists (expected)")
        else:
            print("✗ Company signup failed")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 2: User Signup
    print("\n2. Testing User Signup...")
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": f"testuser{int(time.time())}@example.com",
            "password": "testpassword123",
            "firstName": "Test",
            "lastName": "User"
        })
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("✓ User signup successful")
        elif response.status_code == 409:
            print("✓ User already exists (expected)")
        else:
            print("✗ User signup failed")
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == '__main__':
    import time
    test_signup()
