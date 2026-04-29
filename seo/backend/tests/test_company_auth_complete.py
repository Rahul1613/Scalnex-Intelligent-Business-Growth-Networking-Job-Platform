#!/usr/bin/env python3
"""
Complete company authentication test
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_company_auth_complete():
    """Test complete company authentication"""
    
    print("Testing complete company authentication...")
    
    # Test 1: Company Login
    print("\n1. Testing Company Login...")
    response = requests.post(f"{BASE_URL}/api/company/login", json={
        "email": "testcompany@example.com",
        "password": "testpassword123"
    })
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('token')
        company = data.get('company')
        print(f"✓ Company login successful")
        print(f"✓ Company: {company.get('companyName')}")
        print(f"✓ Token: {token[:50]}...")
        
        # Test 2: Company Me
        print("\n2. Testing Company Me...")
        headers = {"Authorization": f"Bearer {token}"}
        me_response = requests.get(f"{BASE_URL}/api/company/me", headers=headers)
        
        if me_response.status_code == 200:
            print("✓ Company me successful")
        else:
            print(f"✗ Company me failed: {me_response.status_code}")
            
        # Test 3: Company Jobs
        print("\n3. Testing Company Jobs...")
        jobs_response = requests.get(f"{BASE_URL}/api/jobs/company", headers=headers)
        
        if jobs_response.status_code == 200:
            print("✓ Company jobs successful")
            jobs_data = jobs_response.json().get('data', [])
            print(f"✓ Jobs count: {len(jobs_data)}")
        else:
            print(f"✗ Company jobs failed: {jobs_response.status_code}")
            
        # Test 4: Company Applications
        print("\n4. Testing Company Applications...")
        apps_response = requests.get(f"{BASE_URL}/api/applications/company", headers=headers)
        
        if apps_response.status_code == 200:
            print("✓ Company applications successful")
            apps_data = apps_response.json().get('data', [])
            print(f"✓ Applications count: {len(apps_data)}")
        else:
            print(f"✗ Company applications failed: {apps_response.status_code}")
            
    else:
        print(f"✗ Company login failed: {response.status_code}")
        print(f"✗ Response: {response.text}")
    
    # Test 5: Company Signup
    print("\n5. Testing Company Signup...")
    test_company_email = f"testcompany{int(time.time())}@example.com"
    response = requests.post(f"{BASE_URL}/api/company/register", json={
        "email": test_company_email,
        "password": "testpassword123",
        "companyName": "Test Company New",
        "industry": "Technology",
        "location": "Test Location"
    })
    
    if response.status_code in [200, 201]:
        data = response.json()
        token = data.get('token')
        company = data.get('company')
        print(f"✓ Company signup successful")
        print(f"✓ Company: {company.get('companyName')}")
        print(f"✓ Token: {token[:50]}...")
    else:
        print(f"✗ Company signup failed: {response.status_code}")
        print(f"✗ Response: {response.text}")

if __name__ == '__main__':
    import time
    test_company_auth_complete()
