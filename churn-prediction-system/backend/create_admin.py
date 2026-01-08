from passlib.context import CryptContext
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

# Use same scheme as app.py
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def create_admin():
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_NAME = os.getenv("DB_NAME", "AIML")

    try:
        conn = mysql.connector.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            database=DB_NAME
        )
        cursor = conn.cursor()
        
        # Clear existing admin to be sure
        cursor.execute("DELETE FROM users WHERE username = 'admin'")
        
        hashed_pw = pwd_context.hash("admin123")
        cursor.execute(
            "INSERT INTO users (username, password, full_name) VALUES (%s, %s, %s)",
            ("admin", hashed_pw, "Admin User")
        )
        conn.commit()
        print("Admin user 'admin' with password 'admin123' created successfully (PBKDF2).")
        
        cursor.close()
        conn.close()
    except Exception as e:
        import traceback
        print(f"Error creating admin:\n{traceback.format_exc()}")

if __name__ == "__main__":
    create_admin()
