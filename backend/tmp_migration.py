from sqlalchemy import create_engine, text
from app.core.config import settings

def migrate():
    # Use psycopg2 temporarily as psycopg (v3) is hitting _ctypes issues in this environment
    url = settings.DATABASE_URL.replace("postgresql+psycopg://", "postgresql+psycopg2://")
    engine = create_engine(url)
    with engine.connect() as conn:
        print("Migrating database...")
        
        # Add is_admin to users if it doesn't exist
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE"))
            conn.commit()
            print("Added is_admin to users.")
        except Exception as e:
            print(f"Skipping users.is_admin: {e}")
            conn.rollback()

        # Add is_winner to entries if it doesn't exist
        try:
            conn.execute(text("ALTER TABLE entries ADD COLUMN is_winner BOOLEAN DEFAULT FALSE"))
            conn.commit()
            print("Added is_winner to entries.")
        except Exception as e:
            print(f"Skipping entries.is_winner: {e}")
            conn.rollback()

        # Add is_shortlisted to entries if it doesn't exist
        try:
            conn.execute(text("ALTER TABLE entries ADD COLUMN is_shortlisted BOOLEAN DEFAULT FALSE"))
            conn.commit()
            print("Added is_shortlisted to entries.")
        except Exception as e:
            print(f"Skipping entries.is_shortlisted: {e}")
            conn.rollback()

        print("Migration complete.")

if __name__ == "__main__":
    migrate()
