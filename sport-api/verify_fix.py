import requests

login = requests.post('http://127.0.0.1:8002/api/v1/auth/login', json={'username': 'admin', 'password': 'admin123'})
token = login.json()['access_token']
resp = requests.get('http://127.0.0.1:8002/api/v1/physical-tests/history?limit=5', headers={'Authorization': f'Bearer {token}'})
data = resp.json()
print(f'Total records: {len(data)}')
print('Sample records with new fields:')
for r in data[:3]:
    print(f"  {r['real_name']}: skip_rope={r.get('skip_rope')}, sit_ups={r.get('sit_ups')}, run_50m_8={r.get('run_50m_8')}")
