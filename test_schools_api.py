#!/usr/bin/env python3

import requests
from requests.auth import HTTPBasicAuth

try:
    print("Testing /api/v1/schools endpoint...")
    response = requests.get('http://127.0.0.1:8002/api/v1/schools')
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
