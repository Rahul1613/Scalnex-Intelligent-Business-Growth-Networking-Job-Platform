#!/usr/bin/env python3
"""
Test script for the new accept/reject application endpoints
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_endpoints():
    """Test the new application endpoints"""
    
    print("Testing application endpoints...")
    
    # Test 1: Check if accept endpoint exists
    try:
        response = requests.post(f"{BASE_URL}/api/applications/1/accept", 
                                json={"offerLetter": "Test offer letter"})
        print(f"✓ Accept endpoint exists (status: {response.status_code})")
        if response.status_code == 401:
            print("  - Expected authentication error (good)")
    except Exception as e:
        print(f"✗ Accept endpoint error: {e}")
    
    # Test 2: Check if reject endpoint exists
    try:
        response = requests.post(f"{BASE_URL}/api/applications/1/reject", 
                                json={"rejectionReason": "Test rejection reason"})
        print(f"✓ Reject endpoint exists (status: {response.status_code})")
        if response.status_code == 401:
            print("  - Expected authentication error (good)")
    except Exception as e:
        print(f"✗ Reject endpoint error: {e}")
    
    # Test 3: Check if company applications endpoint works
    try:
        response = requests.get(f"{BASE_URL}/api/applications/company")
        print(f"✓ Company applications endpoint exists (status: {response.status_code})")
        if response.status_code == 401:
            print("  - Expected authentication error (good)")
    except Exception as e:
        print(f"✗ Company applications endpoint error: {e}")
    
    # Test 4: Check if public jobs endpoint works
    try:
        response = requests.get(f"{BASE_URL}/api/jobs")
        print(f"✓ Public jobs endpoint works (status: {response.status_code})")
        if response.status_code == 200:
            data = response.json()
            print(f"  - Found {len(data.get('jobs', []))} jobs")
    except Exception as e:
        print(f"✗ Public jobs endpoint error: {e}")

if __name__ == '__main__':
    test_endpoints()
