from sqlalchemy import Column, String, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Researcher(Base):
    __tablename__ = "Researchers"

    id = Column(String, primary_key=True)
    orcid_id = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    full_name = Column(String)
    country = Column(String)
    current_affiliation = Column(String)
    degree = Column(String)
    field = Column(String)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)