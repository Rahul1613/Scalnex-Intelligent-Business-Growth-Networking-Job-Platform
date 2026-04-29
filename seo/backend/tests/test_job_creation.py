#!/usr/bin/env python3
"""
Test job creation with correct field names
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_job_creation():
    """Test job creation with correct field mapping"""
    
    print("Testing job creation with correct field names...")
    
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
            
            # Test job posting with correct field names
            print("\nTesting job posting with correct field names...")
            job_data = {
                "title": "Frontend Developer",
                "description": "We are looking for a skilled frontend developer with React experience...",
                "requirements": "3+ years of React experience, TypeScript proficiency",
                "location": "Remote",
                "job_type": "Full-time",  # Correct field name
                "salary_range": "$90,000 - $130,000"  # Correct field name
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
            headers = {"Authorization": f"Bearer {token}"}
            jobs_response = requests.get(f"{BASE_URL}/api/jobs/company", headers=headers)
            print(f"Status: {jobs_response.status_code}")
            print(f"Response: {jobs_response.text}")
            
        else:
            print(f"✗ Login failed: {response.text}")
            
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == '__main__':
    test_job_creation()
