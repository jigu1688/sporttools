#!/usr/bin/env python3

import requests

try:
    response = requests.get('http://127.0.0.1:8002/')
    print(f"API Root Response: {response.status_code}")
    print(f"Response Body: {response.json()}")
except Exception as e:
    print(f"Error accessing API: {e}")
