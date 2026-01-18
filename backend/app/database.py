from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config import settings

database_engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    echo=settings.environment == "development"
)

DatabaseSession = sessionmaker(autocommit=False, autoflush=False, bind=database_engine)

BaseModel = declarative_base()

def get_database_session():
    database_session = DatabaseSession()
    try:
        yield database_session
    finally:
        database_session.close()
