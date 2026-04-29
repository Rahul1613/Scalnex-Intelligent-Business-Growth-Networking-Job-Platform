#!/usr/bin/env python3
"""
Test company login from frontend perspective
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_company_login_frontend():
    """Test company login as it would be called from frontend"""
    
    print("Testing company login from frontend perspective...")
    
    # Simulate the exact API call that companyLogin makes
    try:
        response = requests.post(f"{BASE_URL}/api/company/login", json={
            "email": "testcompany@example.com",
            "password": "testpassword123"
        }, headers={
            "Content-Type": "application/json"
        })
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('token') and data.get('company'):
                print("✓ Company login successful")
                print(f"✓ Company: {data['company']['companyName']}")
                print(f"✓ Token: {data['token'][:50]}...")
                
                # Test the token with company/me endpoint
                headers = {"Authorization": f"Bearer {data['token']}"}
                me_response = requests.get(f"{BASE_URL}/api/company/me", headers=headers)
                
                if me_response.status_code == 200:
                    print("✓ Company/me endpoint works with token")
                else:
                    print(f"✗ Company/me failed: {me_response.status_code}")
                    
            else:
                print("✗ Invalid response format")
        else:
            print(f"✗ Login failed with status: {response.status_code}")
            
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == '__main__':
    test_company_login_frontend()
