from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

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
    bio = Column(String)
    #photo_url = Column(String)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    publications = relationship("PublicationAuthor", back_populates="researcher")

class Email(Base):
    __tablename__ = "Emails"

    id = Column(String, primary_key=True)
    researcher_id = Column(String, ForeignKey("Researchers.id"))
    email = Column(String)


class Affiliation(Base):
    __tablename__ = "Affiliations"

    id = Column(String, primary_key=True)
    researcher_id = Column(String, ForeignKey("Researchers.id"))
    institution_name = Column(String)
    department = Column(String)
    address = Column(String)
    start_date = Column(String)
    end_date = Column(String)


class Publication(Base):
    __tablename__ = "Publications"

    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    doi = Column(String)
    year = Column(Integer)
    authors = relationship("PublicationAuthor", back_populates="publication")

class PublicationAuthor(Base):
    __tablename__ = "PublicationAuthors"

    id = Column(String, primary_key=True)
    publication_id = Column(String, ForeignKey("Publications.id"))
    researcher_id = Column(String, ForeignKey("Researchers.id"))
    publication = relationship("Publication", back_populates="authors")
    researcher = relationship("Researcher", back_populates="publications")