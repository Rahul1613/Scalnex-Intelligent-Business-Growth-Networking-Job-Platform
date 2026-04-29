#!/usr/bin/env python3
"""
Test the complete authentication flow
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_auth_flow():
    """Test the complete authentication flow"""
    
    print("Testing complete authentication flow...")
    
    # Test 1: Test company registration
    print("\n1. Testing company registration...")
    try:
        response = requests.post(f"{BASE_URL}/api/company/register", json={
            "email": "testcompany@example.com",
            "password": "testpassword123",
            "companyName": "Test Company"
        })
        print(f"   Registration (status: {response.status_code})")
        if response.status_code == 201:
            print("   ✓ Company registration successful")
        else:
            print(f"   ✗ Registration failed: {response.text}")
    except Exception as e:
        print(f"   ✗ Registration error: {e}")
    
    # Test 2: Test company login
    print("\n2. Testing company login...")
    try:
        response = requests.post(f"{BASE_URL}/api/company/login", json={
            "email": "testcompany@example.com",
            "password": "testpassword123"
        })
        print(f"   Login (status: {response.status_code})")
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            print(f"   ✓ Company login successful")
            print(f"   Token: {token[:50]}..." if len(token) > 50 else f"   Token: {token}")
            
            # Test 3: Test company/me endpoint with token
            print("\n3. Testing /api/company/me with token...")
            headers = {"Authorization": f"Bearer {token}"}
            me_response = requests.get(f"{BASE_URL}/api/company/me", headers=headers)
            print(f"   Company me (status: {me_response.status_code})")
            print(f"   Response: {me_response.text}")
            if me_response.status_code == 200:
                company_data = me_response.json()
                print(f"   ✓ Company data retrieved: {company_data.get('company', {}).get('companyName', 'Unknown')}")
            else:
                print(f"   ✗ Company me failed: {me_response.text}")
        else:
            print(f"   ✗ Login failed: {response.text}")
    except Exception as e:
        print(f"   ✗ Login error: {e}")
    
    # Test 4: Test company jobs endpoint
    print("\n4. Testing /api/jobs/company endpoint...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        jobs_response = requests.get(f"{BASE_URL}/api/jobs/company", headers=headers)
        print(f"   Company jobs (status: {jobs_response.status_code})")
        if jobs_response.status_code == 200:
            data = jobs_response.json()
            print(f"   ✓ Jobs retrieved: {len(data.get('data', []))} jobs")
        else:
            print(f"   ✗ Jobs failed: {jobs_response.text}")
    except Exception as e:
        print(f"   ✗ Jobs error: {e}")
    
    print("\nAuthentication flow test completed!")

if __name__ == '__main__':
    test_auth_flow()
