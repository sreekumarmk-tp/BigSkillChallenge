import socket
import subprocess
import time
import os
import sys
from sqlalchemy import create_engine, text
try:
    from app.core.config import settings
except ImportError:
    # Handle standalone execution when not in python path
    import sys
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
    from app.core.config import settings

def is_postgres_ready(host: str, port: int, timeout: int = 2) -> bool:
    """Check if a port is open on a host."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (socket.timeout, ConnectionRefusedError):
        return False

def create_db_if_missing():
    """Connect to 'postgres' database and create the target DB if it doesn't exist."""
    admin_url = f"postgresql+psycopg://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/postgres"
    engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname='{settings.POSTGRES_DB}'"))
            if not result.scalar():
                print(f"Database '{settings.POSTGRES_DB}' not found. Creating...")
                conn.execute(text(f"CREATE DATABASE {settings.POSTGRES_DB}"))
                print(f"Database '{settings.POSTGRES_DB}' created.")
            else:
                print(f"Database '{settings.POSTGRES_DB}' already exists.")
    except Exception as e:
        print(f"Warning: Could not check/create database '{settings.POSTGRES_DB}': {e}")
    finally:
        engine.dispose()

def ensure_db_running():
    """
    Ensure PostgreSQL is running. 
    Checks local installation first, then tries Docker.
    """
    host = settings.POSTGRES_HOST
    port = int(settings.POSTGRES_PORT)
    
    print(f"Checking if PostgreSQL is running on {host}:{port}...")
    
    ready = False
    if is_postgres_ready(host, port):
        print("PostgreSQL is already running.")
        ready = True
    elif host == "localhost" or host == "127.0.0.1":
        print("PostgreSQL not found locally. Attempting to start it via Docker...")
        try:
            backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
            compose_path = os.path.join(backend_dir, "docker-compose.yml")
            
            if os.path.exists(compose_path):
                print(f"Found docker-compose.yml at {compose_path}. Starting 'db' service...")
                # Try 'docker compose' first, then 'docker-compose'
                try:
                    subprocess.run(["docker", "compose", "up", "-d", "db"], cwd=backend_dir, check=True, capture_output=True)
                except subprocess.CalledProcessError:
                    subprocess.run(["docker-compose", "up", "-d", "db"], cwd=backend_dir, check=True, capture_output=True)
                
                # Wait for DB to be ready (up to 30 seconds)
                for i in range(15):
                    if is_postgres_ready(host, port):
                        print("PostgreSQL is now running via Docker.")
                        ready = True
                        break
                    print(f"Waiting for database to be ready... ({i+1}/15)")
                    time.sleep(2)
            else:
                print(f"Error: docker-compose.yml not found at {compose_path}. Cannot start Docker DB.")
        except Exception as e:
            print(f"Failed to start PostgreSQL via Docker: {e}")
    else:
        print(f"PostgreSQL not found on remote host {host}. Please ensure it is running.")

    if ready:
        create_db_if_missing()

if __name__ == "__main__":
    ensure_db_running()
