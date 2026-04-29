#!/usr/bin/env python3
"""
Test login functionality
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_login():
    """Test login functionality"""
    
    print("Testing login functionality...")
    
    # Test 1: Company Login
    print("\n1. Testing Company Login...")
    try:
        response = requests.post(f"{BASE_URL}/api/company/login", json={
            "email": "testcompany@example.com",
            "password": "testpassword123"
        })
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('token') and data.get('company'):
                print("✓ Company login successful")
                print(f"  Token: {data['token'][:50]}...")
                print(f"  Company: {data['company']['companyName']}")
            else:
                print("✗ Invalid response format")
        else:
            print("✗ Company login failed")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 2: User Login
    print("\n2. Testing User Login...")
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "testuser@example.com",
            "password": "testpassword123"
        })
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('token') and data.get('user'):
                print("✓ User login successful")
                print(f"  Token: {data['token'][:50]}...")
                print(f"  User: {data['user']['first_name']} {data['user']['last_name']}")
            else:
                print("✗ Invalid response format")
        else:
            print("✗ User login failed")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 3: CORS Preflight
    print("\n3. Testing CORS Preflight...")
    try:
        response = requests.options(f"{BASE_URL}/api/company/login", 
                                 headers={
                                     "Origin": "http://localhost:5173",
                                     "Access-Control-Request-Method": "POST",
                                     "Access-Control-Request-Headers": "Content-Type"
                                 })
        print(f"CORS Preflight Status: {response.status_code}")
        print(f"CORS Headers: {dict(response.headers)}")
    except Exception as e:
        print(f"✗ CORS Error: {e}")

if __name__ == '__main__':
    test_login()
