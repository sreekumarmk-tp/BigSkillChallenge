from sqlalchemy import create_engine, text
from app.core.config import settings

def migrate():
    engine = create_engine(settings.DATABASE_URL)
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

        print("Migration complete.")

if __name__ == "__main__":
    migrate()
