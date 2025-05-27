from fastapi import APIRouter, Query
from uuid import UUID
from typing import Optional

router = APIRouter()

MOCK_RESEARCHERS = [
    {
        "id": "98eebf32-6d0c-4c77-b110-56fc356fbeaf",
        "orcid_id": "0000-0002-1825-0097",
        "first_name": "Patryk",
        "last_name": "Żywica",
        "full_name": "prof. hab. Patryk Żywica",
        "photo_url": "https://angora.app/media/photos/patryk_zywica.jpg",
        "country": "Polska",
        "current_affiliation": "Uniwersytet im. Adama Mickiewicza w Poznaniu",
        "degree": "prof. hab.",
        "field": "Informatyka",
    },
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "orcid_id": "0000-0001-1234-5678",
        "first_name": "Anna",
        "last_name": "Kowalska",
        "full_name": "dr Anna Kowalska",
        "photo_url": "https://angora.app/media/photos/anna_kowalska.jpg",
        "country": "Polska",
        "current_affiliation": "Politechnika Warszawska",
        "degree": "dr",
        "field": "Biotechnologia",
    }
]

@router.get("/")
def get_researchers(
    name: Optional[str] = Query(None),
    orcid: Optional[str] = Query(None),
    institution: Optional[str] = Query(None),
    discipline: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    
    filtered = MOCK_RESEARCHERS

    if name:
        filtered = [r for r in filtered if name.lower() in r["full_name"].lower()]
    if orcid:
        filtered = [r for r in filtered if orcid in r["orcid_id"]]
    if institution:
        filtered = [r for r in filtered if institution.lower() in r["current_affiliation"].lower()]
    if discipline:
        filtered = [r for r in filtered if discipline.lower() in r["field"].lower()]

    start = (page - 1) * limit
    end = start + limit

    return {
        "results": filtered[start:end],
        "total": len(filtered),
        "page": page,
        "limit": limit
    }

@router.get("/{researcher_id}")
def get_researcher_detail(researcher_id: UUID):
    for r in MOCK_RESEARCHERS:
        if r["id"] == str(researcher_id):
            return r
    return {"detail": "Researcher not found"}
