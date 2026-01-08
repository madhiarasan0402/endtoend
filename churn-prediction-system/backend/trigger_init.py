import requests

try:
    response = requests.post("http://localhost:8000/init-demo-user")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
    print("Is the backend running?")
