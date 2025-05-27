from fastapi import APIRouter, HTTPException
from uuid import UUID

router = APIRouter()

# Mock database
mock_profiles = {
    UUID("123e4567-e89b-12d3-a456-426614174000"): {
        "full_name": "prof. hab. Patryk Żywica",
        "degree": "doktor habilitowany",
        "photo_url": "https://example.com/photos/zywica.jpg",
        "current_affiliation": "Uniwersytet im. Adama Mickiewicza w Poznaniu",
        "field": "Informatyka",
        "country": "Polska",
        "orcid_id": "0000-0001-2345-6789",
        "bio": "Zainteresowania: Sztuczna inteligencja, analiza danych, systemy rekomendacyjne."
    }
}

mock_contact = {
    UUID("123e4567-e89b-12d3-a456-426614174000"): {
        "email": "patryk.zywica@uam.edu.pl",
        "phone": "+48 123 456 789",
        "address": "Wydział Informatyki, UAM, Poznań"
    }
}

mock_affiliations = {
    UUID("123e4567-e89b-12d3-a456-426614174000"): [
        {
            "institution": "UAM",
            "department": "Wydział Informatyki",
            "role": "Profesor",
            "country": "Polska",
            "start_date": "2010-09-01",
            "end_date": None
        }
    ]
}

mock_degrees = {
    UUID("123e4567-e89b-12d3-a456-426614174000"): [
        {
            "degree": "doktor habilitowany",
            "field": "Informatyka",
            "year": 2015
        }
    ]
}

mock_collaborators = {
    UUID("123e4567-e89b-12d3-a456-426614174000"): [
        {
            "collaborator_id": "00000000-0000-0000-0000-000000000001",
            "name": "Jan Kowalski",
            "shared_publications": 5
        }
    ]
}

mock_publications = {
    UUID("123e4567-e89b-12d3-a456-426614174000"): [
        {
            "title": "Deep Learning in Bioinformatics",
            "doi": "10.1000/xyz123",
            "year": 2022
        },
        {
            "title": "Recommender Systems Overview",
            "doi": "10.1000/abc456",
            "year": 2021
        }
    ]
}

@router.get("/{id}")
def get_profile(id: UUID):
    return mock_profiles.get(id) or HTTPException(status_code=404, detail="Not found")

@router.get("/{id}/contact")
def get_contact(id: UUID):
    return mock_contact.get(id) or HTTPException(status_code=404, detail="Not found")

@router.get("/{id}/affiliations")
def get_affiliations(id: UUID):
    return mock_affiliations.get(id) or HTTPException(status_code=404, detail="Not found")

@router.get("/{id}/degrees")
def get_degrees(id: UUID):
    return mock_degrees.get(id) or HTTPException(status_code=404, detail="Not found")

@router.get("/{id}/collaborators")
def get_collaborators(id: UUID):
    return mock_collaborators.get(id) or HTTPException(status_code=404, detail="Not found")

@router.get("/{id}/publications")
def get_publications(id: UUID, limit: int = 3):
    pubs = mock_publications.get(id)
    if pubs is None:
        raise HTTPException(status_code=404, detail="Not found")
    return pubs[:limit]
