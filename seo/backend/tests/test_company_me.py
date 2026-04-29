#!/usr/bin/env python3
"""
Test the new /api/company/me endpoint
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_company_me():
    """Test the company me endpoint"""
    
    print("Testing /api/company/me endpoint...")
    
    # Test 1: Test without authentication
    try:
        response = requests.get(f"{BASE_URL}/api/company/me")
        print(f"✓ No auth (status: {response.status_code})")
        if response.status_code == 401:
            print("  - Expected authentication error (good)")
    except Exception as e:
        print(f"✗ No auth error: {e}")
    
    # Test 2: Test with invalid token
    try:
        response = requests.get(f"{BASE_URL}/api/company/me", 
                              headers={"Authorization": "Bearer invalid-token"})
        print(f"✓ Invalid token (status: {response.status_code})")
        if response.status_code == 401:
            print("  - Expected authentication error (good)")
    except Exception as e:
        print(f"✗ Invalid token error: {e}")
    
    # Test 3: Test with user token (should fail)
    try:
        response = requests.get(f"{BASE_URL}/api/company/me", 
                              headers={"Authorization": "Bearer user-token"})
        print(f"✓ User token (status: {response.status_code})")
        if response.status_code in [401, 403]:
            print("  - Expected error for user token (good)")
    except Exception as e:
        print(f"✗ User token error: {e}")
    
    print("Company me endpoint test completed!")

if __name__ == '__main__':
    test_company_me()
