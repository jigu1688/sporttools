#!/usr/bin/env python3

"""
Test script to check if the backend API is working correctly.
"""

import requests

BASE_URL = "http://127.0.0.1:8002"

# Test the root endpoint
try:
    response = requests.get(f"{BASE_URL}/")
    print(f"Root endpoint response: {response.status_code} - {response.json()}")
except Exception as e:
    print(f"Error accessing root endpoint: {e}")

# Test the schools endpoint
try:
    response = requests.get(f"{BASE_URL}/api/v1/schools")
    print(f"Schools endpoint response: {response.status_code}")
    if response.status_code == 200:
        print(f"Schools data: {response.json()}")
except Exception as e:
    print(f"Error accessing schools endpoint: {e}")

# Test the schools/1 endpoint
try:
    response = requests.get(f"{BASE_URL}/api/v1/schools/1")
    print(f"School 1 endpoint response: {response.status_code}")
    if response.status_code == 200:
        print(f"School 1 data: {response.json()}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error accessing school 1 endpoint: {e}")
