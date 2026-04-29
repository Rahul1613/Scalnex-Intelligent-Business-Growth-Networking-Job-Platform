#!/usr/bin/env python3
"""
Test the exact API calls the frontend makes
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_frontend_api():
    """Test the exact API calls the frontend makes"""
    
    print("Testing frontend API calls...")
    
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
            
            # Test the exact API call frontend makes
            print("\nTesting /api/jobs/company endpoint (frontend call)...")
            headers = {"Authorization": f"Bearer {token}"}
            jobs_response = requests.get(f"{BASE_URL}/api/jobs/company", headers=headers)
            print(f"Status: {jobs_response.status_code}")
            
            if jobs_response.status_code == 200:
                result = jobs_response.json()
                print(f"✓ Success: {result.get('success')}")
                print(f"✓ Data length: {len(result.get('data', []))}")
                print(f"✓ Jobs: {[job['title'] for job in result.get('data', [])]}")
            else:
                print(f"✗ Failed: {jobs_response.text}")
            
        else:
            print(f"✗ Login failed: {response.text}")
            
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == '__main__':
    test_frontend_api()
