"""Database engine and session management (SQLite locally, PostgreSQL in prod)."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.base import Base

# SQLite needs check_same_thread=False for FastAPI's threaded request handling.
connect_args = {"check_same_thread": False} if settings.is_sqlite else {}

if settings.is_sqlite:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True,
        future=True,
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        pool_recycle=300,
        future=True,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create tables from the ORM metadata (used for tests and quick local dev)."""
    import app.models  # noqa: F401  ensure models are registered on Base.metadata

    Base.metadata.create_all(bind=engine)


def run_migrations() -> None:
    """
    Apply Alembic migrations to head (production-grade schema management).

    If the database already has the app's tables but was never stamped by
    Alembic (legacy schema created via create_all), it is stamped at head
    instead of re-creating tables.
    """
    try:
        from alembic import command
        from alembic.config import Config
        from sqlalchemy import inspect

        from app.core.config import BASE_DIR

        cfg = Config(str(BASE_DIR / "alembic.ini"))
        cfg.set_main_option("script_location", str(BASE_DIR / "alembic"))

        tables = inspect(engine).get_table_names()
        if "users" in tables and "alembic_version" not in tables:
            command.stamp(cfg, "head")
        else:
            command.upgrade(cfg, "head")
    except Exception:
        pass

    import app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    seed_initial_academic_data()


def seed_initial_academic_data():
    from app.models import Subject
    db = SessionLocal()
    try:
        if db.query(Subject).count() == 0:
            initial_subjects = [
                {"code": "BCS701", "name": "Advanced Computer Architecture", "branch": "CSE", "year": 3, "semester": 6},
                {"code": "BCS702", "name": "Cloud Computing & Virtualization", "branch": "CSE", "year": 3, "semester": 6},
                {"code": "BCS703", "name": "Cryptography & Network Security", "branch": "CSE", "year": 3, "semester": 6},
                {"code": "BCS704", "name": "Data Mining & Machine Learning", "branch": "CSE", "year": 3, "semester": 6},
                {"code": "BCS705", "name": "Web Technologies & Frameworks", "branch": "CSE", "year": 3, "semester": 6},
                {"code": "BCS706", "name": "Embedded Systems & IoT", "branch": "CSE", "year": 3, "semester": 6},
                {"code": "BCS707", "name": "Cryptography & Network Security Lab", "branch": "CSE", "year": 3, "semester": 6},
            ]
            for s in initial_subjects:
                db.add(Subject(**s))
            db.commit()
    except Exception:
        pass
    finally:
        db.close()



