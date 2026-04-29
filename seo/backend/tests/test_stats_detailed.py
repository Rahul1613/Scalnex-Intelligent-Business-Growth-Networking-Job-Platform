import requests

try:
    response = requests.get('http://127.0.0.1:5000/api/platform-stats')
    data = response.json()
    print(f"Status: {response.status_code}")
    for k, v in data.items():
        print(f"{k}: {v}")
except Exception as e:
    print(f"Error: {e}")
