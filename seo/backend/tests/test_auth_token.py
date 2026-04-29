#!/usr/bin/env python3
"""
Test authentication token handling
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_auth_token():
    """Test authentication token handling"""
    
    print("Testing authentication token...")
    
    # First login to get token
    try:
        response = requests.post(f"{BASE_URL}/api/company/login", json={
            "email": "testcompany@example.com",
            "password": "testpassword123"
        })
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            print(f"✓ Login successful")
            print(f"Token: {token[:50]}...")
            
            # Test storing token like frontend does
            print("\nTesting token storage and retrieval...")
            # Simulate localStorage
            stored_token = token
            
            # Test API call with stored token
            headers = {"Authorization": f"Bearer {stored_token}"}
            jobs_response = requests.get(f"{BASE_URL}/api/jobs/company", headers=headers)
            print(f"Jobs API status: {jobs_response.status_code}")
            
            if jobs_response.status_code == 200:
                result = jobs_response.json()
                print(f"✓ Jobs loaded: {len(result.get('data', []))} jobs")
            else:
                print(f"✗ Jobs API failed: {jobs_response.text}")
            
        else:
            print(f"✗ Login failed: {response.text}")
            
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == '__main__':
    test_auth_token()
