#!/usr/bin/env python3
"""
Test CORS and authentication
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_cors_and_auth():
    """Test CORS and authentication endpoints"""
    
    print("Testing CORS and authentication...")
    
    # Test 1: Test CORS preflight
    try:
        response = requests.options(f"{BASE_URL}/api/jobs/company", 
                                 headers={
                                     "Origin": "http://localhost:5173",
                                     "Access-Control-Request-Method": "GET",
                                     "Access-Control-Request-Headers": "Authorization"
                                 })
        print(f"✓ CORS preflight (status: {response.status_code})")
        print(f"  - Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'Not set')}")
    except Exception as e:
        print(f"✗ CORS preflight error: {e}")
    
    # Test 2: Test without authentication
    try:
        response = requests.get(f"{BASE_URL}/api/jobs/company", 
                              headers={"Origin": "http://localhost:5173"})
        print(f"✓ No auth (status: {response.status_code})")
        if response.status_code == 401:
            print("  - Expected authentication error (good)")
    except Exception as e:
        print(f"✗ No auth error: {e}")
    
    # Test 3: Test with invalid token
    try:
        response = requests.get(f"{BASE_URL}/api/jobs/company", 
                              headers={
                                  "Origin": "http://localhost:5173",
                                  "Authorization": "Bearer invalid-token"
                              })
        print(f"✓ Invalid token (status: {response.status_code})")
        if response.status_code == 401:
            print("  - Expected authentication error (good)")
    except Exception as e:
        print(f"✗ Invalid token error: {e}")
    
    # Test 4: Test public jobs (should work without auth)
    try:
        response = requests.get(f"{BASE_URL}/api/jobs", 
                              headers={"Origin": "http://localhost:5173"})
        print(f"✓ Public jobs (status: {response.status_code})")
        if response.status_code == 200:
            data = response.json()
            print(f"  - Found {len(data.get('jobs', []))} jobs")
    except Exception as e:
        print(f"✗ Public jobs error: {e}")

if __name__ == '__main__':
    test_cors_and_auth()
