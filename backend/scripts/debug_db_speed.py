from sqlalchemy import create_engine, text
import time
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Testing Connection to: {DATABASE_URL}")

try:
    start_time = time.time()
    print("Connecting...")
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        conn_time = time.time()
        print(f"Connected in {conn_time - start_time:.4f} seconds")
        
        result = connection.execute(text("SELECT 1"))
        query_time = time.time()
        print(f"Query 'SELECT 1' executed in {query_time - conn_time:.4f} seconds")
        print("Result:", result.fetchone())
        
except Exception as e:
    print(f"\nCRITICAL CONNECTION FAILURE: {e}")
