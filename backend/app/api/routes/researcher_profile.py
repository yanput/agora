from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.database.session import get_db
from app.database.models import Researcher
from app.database.models import Email
from app.database.models import Affiliation
from app.database.models import Publication
from app.database.models import PublicationAuthor

router = APIRouter()

@router.get("/{id}")
def get_profile(id: UUID, db: Session = Depends(get_db)):
    researcher = db.query(Researcher).filter(Researcher.id == str(id)).first()
    if not researcher:
        raise HTTPException(status_code=404, detail="Researcher not found")
    return {
        "full_name": researcher.full_name,
        "degree": researcher.degree,
        #"photo_url": researcher.photo_url,
        "current_affiliation": researcher.current_affiliation,
        "field": researcher.field,
        "country": researcher.country,
        "orcid": f"https://orcid.org/{researcher.orcid_id}"
    }

@router.get("/contact/{id}")
def get_contact(id: UUID, db: Session = Depends(get_db)):
    email = db.query(Email).filter(Email.researcher_id == str(id)).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return {"email": email.email}

@router.get("/research-interests/{id}")
def get_research_interests(id: UUID, db: Session = Depends(get_db)):
    researcher = db.query(Researcher).filter(Researcher.id == str(id)).first()
    if not researcher:
        raise HTTPException(status_code=404, detail="Researcher not found")
    return {"description": researcher.bio or ""}

@router.get("/degrees/{id}")
def get_degrees(id: UUID, db: Session = Depends(get_db)):
    researcher = db.query(Researcher).filter(Researcher.id == str(id)).first()
    if not researcher:
        raise HTTPException(status_code=404, detail="Researcher not found")
    return [{
        "title": researcher.degree,
        "field": researcher.field
    }]

@router.get("/publications/{id}")
def get_publications(id: UUID, page: int = 1, limit: int = 5, db: Session = Depends(get_db)):
    researcher = db.query(Researcher).filter(Researcher.id == str(id)).first()
    if not researcher:
        raise HTTPException(status_code=404, detail="Researcher not found")
    query = (
        db.query(Publication)
        .join(Publication.authors)
        .filter(PublicationAuthor.researcher_id == str(id))
        .order_by(Publication.year.desc())
    )
    total = query.count()
    publications = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "results": [{
            "title": pub.title,
            "doi": pub.doi,
            "year": pub.year
        } for pub in publications],
        "total": total,
        "page": page,
        "limit": limit
    }

@router.get("/research-graph/{id}")
def get_research_graph(id: UUID):
    return {
        "nodes": [
            {"id": str(id), "type": "researcher", "image_url": "https://example.com/avatar_main.jpg"},
            {"id": "1", "type": "researcher", "image_url": "https://example.com/avatar1.jpg"},
            {"id": "2", "type": "researcher", "image_url": "https://example.com/avatar2.jpg"},
            {"id": "3", "type": "researcher", "image_url": "https://example.com/avatar3.jpg"},
            {"id": "4", "type": "researcher", "image_url": "https://example.com/avatar4.jpg"},
            {"id": "5", "type": "researcher", "image_url": "https://example.com/avatar5.jpg"}
        ],
        "edges": [
            {"from": str(id), "to": "1", "weight": 5},
            {"from": str(id), "to": "2", "weight": 4},
            {"from": str(id), "to": "3", "weight": 3},
            {"from": str(id), "to": "4", "weight": 2},
            {"from": str(id), "to": "5", "weight": 1}
        ]
    }