from fastapi import APIRouter, Query, Depends
from uuid import UUID
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from app.database.session import get_db
from app.database.models import Researcher

router = APIRouter()

@router.get("/")
def get_researchers(
    name: Optional[str] = Query(None),
    orcid: Optional[str] = Query(None),
    institution: Optional[str] = Query(None),
    discipline: Optional[str] = Query(None),
    sort: str = Query("full_name_asc"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Researcher)

    if name:
        query = query.filter(Researcher.full_name.ilike(f"%{name}%"))
    if orcid:
        query = query.filter(Researcher.orcid_id == orcid)
    if institution:
        query = query.filter(Researcher.current_affiliation.ilike(f"%{institution}%"))
    if discipline:
        query = query.filter(Researcher.field.ilike(f"%{discipline}%"))

    valid_sort_fields = {
        "full_name": Researcher.full_name,
        "orcid_id": Researcher.orcid_id,
    }
    sort_field, _, sort_order = sort.partition("_")
    sort_column = valid_sort_fields.get(sort_field, Researcher.full_name)
    order_func = asc if sort_order == "asc" else desc
    query = query.order_by(order_func(sort_column))

    total = query.count()
    results = query.offset((page - 1) * limit).limit(limit).all()

    serialized_results = []
    for r in results:
        serialized_results.append({
            "id": r.id,
            "orcid_id": r.orcid_id,
            "first_name": r.first_name,
            "last_name": r.last_name,
            "full_name": r.full_name,
            "current_affiliation": r.current_affiliation,
            "field": r.field,
            "photo_url": r.photo_url if hasattr(r, "photo_url") else None
        })

    return {
        "results": serialized_results,
        "total": total,
        "page": page,
        "limit": limit
    }

@router.get("/{researcher_id}")
def get_researcher_detail(researcher_id: UUID, db: Session = Depends(get_db)):
    researcher = db.query(Researcher).filter(Researcher.id == str(researcher_id)).first()
    if researcher:
        return researcher.__dict__
    return {"detail": "Researcher not found"}
