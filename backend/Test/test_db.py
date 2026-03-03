import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

host = os.getenv("SUPABASE_HOST")
db = os.getenv("SUPABASE_DB")
user = os.getenv("SUPABASE_USER")
password = os.getenv("SUPABASE_PASSWORD")

print("Host:", host)
print("Database:", db)
print("User:", user)
print("Password:", password)

if None in [host, db, user, password]:
    print("\n❌ Environment variables are NOT loading.")
else:
    print("\n✅ Environment variables loaded successfully.")

try:
    conn = psycopg2.connect(
        host=host,
        database=db,
        user=user,
        password=password,
        port=5432,
        sslmode="require"
    )

    print("\n✅ Successfully connected to the database!")
    conn.close()
    

except Exception as e:
    print("\n❌ Database connection failed:")
    print(e)

