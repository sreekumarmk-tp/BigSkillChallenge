import socket
import subprocess
import time
import os
from app.core.config import settings

def is_redis_ready(host: str, port: int, timeout: int = 2) -> bool:
    """Check if Redis port is open."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (socket.timeout, ConnectionRefusedError):
        return False

def ensure_redis_running():
    """
    Ensure Redis is running. 
    Checks local installation first, then tries Docker.
    Works across Linux, Mac, and Windows if Docker is installed.
    """
    # Parse host/port from REDIS_URL
    # settings.REDIS_URL example: redis://localhost:6379/0
    try:
        from urllib.parse import urlparse
        parsed = urlparse(settings.REDIS_URL)
        host = parsed.hostname or "localhost"
        port = parsed.port or 6379
    except Exception:
        host = "localhost"
        port = 6379
    
    print(f"Checking if Redis is running on {host}:{port}...")
    
    if is_redis_ready(host, port):
        print("Redis is already running.")
        return True

    if host in ("localhost", "127.0.0.1"):
        print("Redis not found locally. Attempting to start it via Docker...")
        try:
            backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
            compose_path = os.path.join(backend_dir, "docker-compose.yml")
            
            if os.path.exists(compose_path):
                print(f"Found docker-compose.yml at {compose_path}. Starting 'redis' service...")
                # Try 'docker compose' then 'docker-compose'
                try:
                    subprocess.run(["docker", "compose", "up", "-d", "redis"], cwd=backend_dir, check=True, capture_output=True)
                except (subprocess.CalledProcessError, FileNotFoundError):
                    try:
                        subprocess.run(["docker-compose", "up", "-d", "redis"], cwd=backend_dir, check=True, capture_output=True)
                    except (subprocess.CalledProcessError, FileNotFoundError):
                        print("Docker or Docker Compose not found. Please install Redis manually.")
                        return False
                
                # Wait for Redis to be ready (up to 10 seconds)
                for i in range(5):
                    if is_redis_ready(host, port):
                        print("Redis is now running via Docker.")
                        return True
                    print(f"Waiting for Redis to be ready... ({i+1}/5)")
                    time.sleep(2)
            else:
                print(f"Error: docker-compose.yml not found at {compose_path}. Cannot start Docker Redis.")
        except Exception as e:
            print(f"Failed to start Redis via Docker: {e}")
    else:
        print(f"Redis not found on remote host {host}. Please ensure it is running.")
    
    return False

if __name__ == "__main__":
    ensure_redis_running()
