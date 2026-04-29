#!/usr/bin/env python3
"""
Test company user redirect fix
"""
import requests

# Test company login
response = requests.post('http://127.0.0.1:5000/api/company/login', json={
    'email': 'sisoderahul643@gmail.com',
    'password': 'testpassword123'
})

if response.status_code == 200:
    data = response.json()
    token = data.get('token')
    print('✓ Company login successful')
    
    # Test user applications endpoint with company token
    headers = {'Authorization': f'Bearer {token}'}
    apps_response = requests.get('http://127.0.0.1:5000/api/applications/user', headers=headers)
    print(f'✓ Applications/user with company token: {apps_response.status_code}')
    
    # Test company/me endpoint
    me_response = requests.get('http://127.0.0.1:5000/api/company/me', headers=headers)
    print(f'✓ Company/me with company token: {me_response.status_code}')
    
    if me_response.status_code == 200:
        company_data = me_response.json()
        print(f'✓ Company data: {company_data.get("company", {}).get("companyName", "N/A")}')
else:
    print('✗ Company login failed')
