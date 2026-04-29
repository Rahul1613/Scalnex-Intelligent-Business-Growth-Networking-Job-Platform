#!/usr/bin/env python3
"""
Test job listing functionality
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_job_listing():
    """Test job listing functionality"""
    
    print("Testing job listing...")
    
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
            
            # Test company jobs endpoint
            print("\nTesting /api/jobs/company endpoint...")
            headers = {"Authorization": f"Bearer {token}"}
            jobs_response = requests.get(f"{BASE_URL}/api/jobs/company", headers=headers)
            print(f"Status: {jobs_response.status_code}")
            print(f"Response: {jobs_response.text}")
            
            # Test posting a job
            print("\nTesting job posting...")
            job_data = {
                "title": "Software Developer",
                "description": "We are looking for a skilled software developer...",
                "location": "Remote",
                "jobType": "Full-time",
                "salaryRange": "$80,000 - $120,000"
            }
            
            post_response = requests.post(f"{BASE_URL}/api/jobs", 
                                         json=job_data, 
                                         headers={
                                             "Authorization": f"Bearer {token}",
                                             "Content-Type": "application/json"
                                         })
            print(f"Post job status: {post_response.status_code}")
            print(f"Post job response: {post_response.text}")
            
            # Test jobs again after posting
            print("\nTesting jobs after posting...")
            jobs_response2 = requests.get(f"{BASE_URL}/api/jobs/company", headers=headers)
            print(f"Status: {jobs_response2.status_code}")
            print(f"Response: {jobs_response2.text}")
            
        else:
            print(f"✗ Login failed: {response.text}")
            
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == '__main__':
    test_job_listing()
