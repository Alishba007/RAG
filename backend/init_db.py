import sqlite3
from backend.auth import hash_password

conn = sqlite3.connect("chrome.sqlite3")
cursor = conn.cursor()

cursor.execute("SELECT username, password_hash FROM users")
users = cursor.fetchall()

for username, old_hash in users:
    # This will only rehash old raw bcrypt hashes safely
    # Replace with new passlib hash if needed
    # Example: ask user to reset password, or re-hash manually
    pass  # safest is to delete old users for dev/testing
