import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def init_database():
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_NAME = os.getenv("DB_NAME", "AIML")

    try:
        # Connect without database to create it
        conn = mysql.connector.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST
        )
        cursor = conn.cursor()
        
        # Create database
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        print(f"Database '{DB_NAME}' verified/created successfully.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error initializing database: {e}")
        print("Please ensure MySQL (XAMPP/MySQL Service) is running.")

if __name__ == "__main__":
    init_database()
