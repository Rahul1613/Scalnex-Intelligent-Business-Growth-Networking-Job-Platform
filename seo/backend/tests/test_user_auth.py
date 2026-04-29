#!/usr/bin/env python3
"""
Test user authentication endpoints
"""
import requests
import json
import time

BASE_URL = "http://127.0.0.1:5000"

def test_user_auth():
    """Test user authentication endpoints"""
    
    print("Testing user authentication endpoints...")
    
    # Test 1: User Registration
    print("\n1. Testing User Registration...")
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
            print("✓ User registration successful")
        else:
            print("✗ User registration failed")
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
                print(f"  User: {data['user']['firstName']} {data['user']['lastName']}")
            else:
                print("✗ Invalid response format")
        else:
            print("✗ User login failed")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 3: CORS Preflight for user endpoints
    print("\n3. Testing CORS Preflight for user endpoints...")
    try:
        response = requests.options(f"{BASE_URL}/api/auth/register", 
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
    test_user_auth()
