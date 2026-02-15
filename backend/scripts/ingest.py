# scripts/ingest.py
import sys
import requests
import os
from pathlib import Path

BASE_URL = "http://localhost:8000"
TOKEN = "your-token-here"  # Get from login

def upload_file_cli(file_path, user="cli_user"):
    """Upload file via CLI"""
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' not found")
        return
    
    with open(file_path, 'rb') as f:
        files = {'file': f}
        headers = {'Authorization': f'Bearer {TOKEN}'}
        
        try:
            response = requests.post(
                f"{BASE_URL}/upload",
                files=files,
                headers=headers
            )
            response.raise_for_status()
            print(f"Success: {response.json()}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ingest.py <file_path>")
        sys.exit(1)
    
    upload_file_cli(sys.argv[1])