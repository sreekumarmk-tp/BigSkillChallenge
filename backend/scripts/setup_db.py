#!/usr/bin/env python3
import sys
import os

# Add the backend directory to sys.path so we can import 'app'
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.core.db_setup import ensure_db_running
    print("Starting PostgreSQL setup...")
    ensure_db_running()
    print("Setup complete.")
except ImportError as e:
    print(f"Error: Could not import db_setup logic. Make sure you are running this from the backend directory or have the virtual environment activated. Details: {e}")
    sys.exit(1)
except Exception as e:
    print(f"An error occurred during setup: {e}")
    sys.exit(1)
