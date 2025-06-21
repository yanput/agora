import sys, os
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
import sqlite3
import pandas as pd
from pathlib import Path

from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Table, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

#tworzenie bazy danych z relacjami

Base = declarative_base()

class Researcher(Base):
    __tablename__ = 'Researchers'
    id = Column(String, primary_key=True)
    orcid_id = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    full_name = Column(String)
    country = Column(String)
    current_affiliation = Column(String)
    degree = Column(String)
    field = Column(String)
    created_at = Column(String)
    updated_at = Column(String)
    bio = Column(String)


    keywords = relationship('Keyword', back_populates='researcher', cascade="all, delete-orphan")
    emails = relationship('Email', back_populates='researcher', cascade="all, delete-orphan")
    affiliations = relationship('Affiliation', back_populates='researcher', cascade="all, delete-orphan")
    publication_authors= relationship('PublicationAuthor', back_populates='researcher',cascade="all, delete-orphan")


class Affiliation(Base):
    __tablename__ = 'Affiliations'
    id = Column(String, primary_key=True)
    researcher_id = Column(String, ForeignKey('Researchers.id'))
    institution = Column(String, ForeignKey('Institutions.id'))
    department = Column(String)
    role = Column(String)
    country = Column(String)
    start_date = Column(String)
    end_date = Column(String)


    researcher = relationship('Researcher', back_populates='affiliations')
    institutions = relationship('Institution', back_populates='affiliations')


class Keyword(Base):
    __tablename__ = 'Keywords'
    id = Column(String, primary_key=True)
    researcher_id = Column(String, ForeignKey('Researchers.id'))
    keyword = Column(String)

    researcher = relationship('Researcher', back_populates='keywords')
    

class Email(Base):
    __tablename__ = 'Emails'
    id = Column(String, primary_key=True)
    researcher_id = Column(String, ForeignKey('Researchers.id'))
    email = Column(String, unique=True)

    researcher = relationship('Researcher', back_populates='emails')


class Publication(Base):
    __tablename__ = 'Publications'
    id = Column(String, primary_key=True)
    title = Column(String)
    journal = Column(String)
    doi = Column(String)
    year = Column(String)
    source = Column(String)
    project_id = Column(String)  
    #created_at = Column(String)
    #updated_at = Column(String)
    abstract = Column(String)

    publication_authors= relationship('PublicationAuthor', back_populates='publication',cascade="all, delete-orphan")
    


class PublicationAuthor(Base):
    __tablename__ = 'PublicationAuthors'
    id = Column(String, primary_key=True)
    publication_id = Column(String, ForeignKey('Publications.id'))
    researcher_id = Column(String, ForeignKey('Researchers.id'))
    author_order = Column(String) #INT
    is_corresponding = Column(String)
    evidence_score = Column(String) #INT

    researcher = relationship('Researcher', back_populates='publication_authors')
    publication = relationship('Publication', back_populates='publication_authors')




class Institution(Base):
    __tablename__= 'Institutions'
    id = Column(String, primary_key=True)
    ror_id = Column(String)
    grid_id = Column(String)
    name = Column(String)
    aliases = Column(String)
    country = Column(String)
    city = Column(String)
    organization_type = Column(String)
    url = Column(String)
    parent_ror = Column(String)

    affiliations = relationship('Affiliation', back_populates='institutions', cascade="all, delete-orphan")



base_dir = Path(__file__).parent.resolve()
db_path = (base_dir.parent /"app"/ "database"/ "scientists.db").resolve()
print(f"Using DB path: {db_path}")
if db_path.exists():
    print("Old database found. Deleting...")
    os.remove(db_path)
    sys.stdout.flush()
else:
    print("No existing database found.")
    sys.stdout.flush()
print(f"Resolved DB path in container: {db_path}")
engine = create_engine(f"sqlite:///{db_path}")

Base.metadata.create_all(engine)
print("Database schema created.")

# Create connection
#conn = sqlite3.connect("scientists.db")

# Researchers
df_researcher = pd.DataFrame(columns=[
    "id", "orcid_id", "first_name", "last_name", "full_name", "email",
    "country", "primary_affiliation", "created_at", "updated_at"
])

df_sources = pd.DataFrame(columns=[
    "id", "researcher_id", "platform", "source_id",
    "endpoint", "last_fetched", "last_status", "active"
])

df_keywords = pd.DataFrame(columns=["id", "researcher_id", "keyword"])

df_affiliations = pd.DataFrame(columns=[
    "id", "researcher_id", "institution", "department",
    "role", "country", "start_date", "end_date"
])
df_education = pd.DataFrame(columns=[
    "id", "researcher_id", "degree", "field", "institution",
    "country", "start_date", "end_date"
])

# Publications
df_publication = pd.DataFrame(columns=[
    "id", "title", "journal", "doi", "year", "source",
    "project_id", "created_at", "updated_at"
])

df_publication_author = pd.DataFrame(columns=[
    "id", "publication_id", "researcher_id",
    "author_order", "is_corresponding"
])
'''
Database = {
    "Researcher": df_researcher,
    "Sources": df_sources,
    "Education": df_education,
    "Affilations": df_affiliations,
    "Keywords": df_keywords,
    "Publiations": df_publication,
    "Publications_authors": df_publication_author
}'''




#parser osób

import uuid
from datetime import datetime

def safe_date_component(value, default="01"):
    return value.get("value") if isinstance(value, dict) and value.get("value") else default

def safe_get(d, *keys):
    for key in keys:
        d = d.get(key) if isinstance(d, dict) else {}
    return d or None

def parse_orcid_json(orcid_id: str, orcid_json: dict, employment_json: dict, education_json: dict) -> dict:
    now = datetime.utcnow().isoformat()
    researcher_id = str(uuid.uuid4())

    first = safe_get(orcid_json, "name", "given-names", "value")
    last = safe_get(orcid_json, "name", "family-name", "value")
    address_list = safe_get(orcid_json, "addresses", "address") or []
    country = safe_get(address_list[0], "country", "value") if address_list else None

    researcher = {
        "id": researcher_id,
        "orcid_id": orcid_id,
        "first_name": first,
        "last_name": last,
        "full_name": f"{first} {last}".strip() if first or last else "",
        "email": None,
        "country": country,
        "primary_affiliation": None,
        "created_at": now,
        "updated_at": now
    }

    for email in safe_get(orcid_json, "emails", "email") or []:
        if safe_get(email, "primary"):
            researcher["email"] = safe_get(email, "email")
            break

    sources = [{
        "id": str(uuid.uuid4()),
        "researcher_id": researcher_id,
        "platform": "ORCID",
        "source_id": orcid_id,
        "endpoint": f"https://pub.orcid.org/v3.0/{orcid_id}/person",
        "last_fetched": now,
        "last_status": "200",
        "active": True
    }]

    keywords = []
    for kw in safe_get(orcid_json, "keywords", "keyword") or []:
        content = safe_get(kw, "content")
        if content:
            keywords.append({
                "id": str(uuid.uuid4()),
                "researcher_id": researcher_id,
                "keyword": content
            })

    affiliations = []
    most_recent_affiliation = None
    most_recent_start = None

    for group in safe_get(employment_json, "affiliation-group") or []:
        for summary in safe_get(group, "summaries") or []:
            emp = safe_get(summary, "employment-summary")
            org = safe_get(emp, "organization")
            address = safe_get(org, "address")

            start = safe_get(emp, "start-date")
            end = safe_get(emp, "end-date")

            start_date = None
            if start:
                start_date = f"{safe_date_component(safe_get(start, 'year'), '1900')}-" \
                             f"{safe_date_component(safe_get(start, 'month'))}-" \
                             f"{safe_date_component(safe_get(start, 'day'))}"

            end_date = None
            if safe_get(end, "year"):
                end_date = f"{safe_date_component(safe_get(end, 'year'))}-" \
                           f"{safe_date_component(safe_get(end, 'month'))}-" \
                           f"{safe_date_component(safe_get(end, 'day'))}"

            affiliations.append({
                "id": str(uuid.uuid4()),
                "researcher_id": researcher_id,
                "institution": safe_get(org, "name"),
                "department": safe_get(emp, "department-name"),
                "role": safe_get(emp, "role-title"),
                "country": safe_get(address, "country"),
                "start_date": start_date,
                "end_date": end_date
            })

            if not end_date and start_date:
                parsed_start = pd.to_datetime(start_date, errors="coerce")
                if parsed_start and (most_recent_start is None or parsed_start > most_recent_start):
                    most_recent_affiliation = safe_get(org, "name")
                    most_recent_start = parsed_start

    researcher["primary_affiliation"] = most_recent_affiliation

    education = []
    for group in safe_get(education_json, "affiliation-group") or []:
        for summary in safe_get(group, "summaries") or []:
            edu = safe_get(summary, "education-summary")
            org = safe_get(edu, "organization")
            address = safe_get(org, "address")

            start = safe_get(edu, "start-date")
            end = safe_get(edu, "end-date")

            start_date = None
            if start:
                start_date = f"{safe_date_component(safe_get(start, 'year'), '1900')}-" \
                             f"{safe_date_component(safe_get(start, 'month'))}-" \
                             f"{safe_date_component(safe_get(start, 'day'))}"

            end_date = None
            if safe_get(end, "year"):
                end_date = f"{safe_date_component(safe_get(end, 'year'))}-" \
                           f"{safe_date_component(safe_get(end, 'month'))}-" \
                           f"{safe_date_component(safe_get(end, 'day'))}"

            education.append({
                "id": str(uuid.uuid4()),
                "researcher_id": researcher_id,
                "degree": safe_get(edu, "role-title"),
                "field": safe_get(edu, "department-name"),
                "institution": safe_get(org, "name"),
                "country": safe_get(address, "country"),
                "start_date": start_date,
                "end_date": end_date
            })

    return {
        "researcher": researcher,
        "sources": sources,
        "keywords": keywords,
        "affiliations": affiliations,
        "education": education
    }


#parser publikacji


def parse_orcid_works(works_json: dict, researcher_id: str):
    now = datetime.utcnow().isoformat()
    publications = []
    publication_authors = []

    for group in safe_get(works_json, "group") or []:
        summaries = safe_get(group, "work-summary") or []
        if not summaries:
            continue

        summary = summaries[0]
        pub_id = str(uuid.uuid4())

        title = safe_get(summary, "title", "title", "value")
        journal = safe_get(summary, "journal-title", "value")
        year = safe_get(summary, "publication-date", "year", "value")

        doi = None
        for ext in safe_get(summary, "external-ids", "external-id") or []:
            ext_type = safe_get(ext, "external-id-type")
            ext_val = safe_get(ext, "external-id-value")
            if ext_type and ext_type.lower() == "doi" and ext_val:
                doi = f"https://doi.org/{ext_val}"
                break

        publications.append({
            "id": pub_id,
            "title": title,
            "journal": journal,
            "doi": doi,
            "year": year,
            "source": "ORCID",
            "project_id": None,
            "created_at": now,
            "updated_at": now
        })

        publication_authors.append({
            "id": str(uuid.uuid4()),
            "publication_id": pub_id,
            "researcher_id": researcher_id,
            "author_order": None,
            "is_corresponding": None
        })

    return {
        "publications": publications,
        "publications_authors": publication_authors
    }


#funkcje pomocnicze dla wyciągania danych z ORCID

import requests
HEADERS = {
    "Accept": "application/json"
}

def fetch_orcid_person(orcid_id: str) -> dict:
    """
    Pobiera dane osobowe naukowca z publicznego ORCID API (/person).
    """
    url = f"https://pub.orcid.org/v3.0/{orcid_id}/person"
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Błąd pobierania danych z ORCID dla {orcid_id}: {e}")
        return {}
    
def fetch_orcid_employment(orcid_id: str) -> str:
    url = f"https://pub.orcid.org/v3.0/{orcid_id}/employments"
    headers = {"Accept": "application/json"}

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching employment for {orcid_id}: {e}")
        return None
    
def fetch_orcid_education(orcid_id: str) -> str:
    url = f"https://pub.orcid.org/v3.0/{orcid_id}/educations"
    headers = {"Accept": "application/json"}

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching employment for {orcid_id}: {e}")
        return None

def fetch_orcid_works(orcid_id: str) -> dict:
    url = f"https://pub.orcid.org/v3.0/{orcid_id}/works"
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Błąd pobierania publikacji ORCID dla {orcid_id}: {e}")
        return {}
    
def insert_data(data, data_publication: dict) -> None:
    global df_researcher, df_sources, df_keywords, df_affiliations, df_education, df_publication, df_publication_author

    # Researchers
    df_researcher = pd.concat([df_researcher, pd.DataFrame([data["researcher"]])], ignore_index=True)
    df_sources = pd.concat([df_sources, pd.DataFrame(data["sources"])], ignore_index=True)
    df_keywords = pd.concat([df_keywords, pd.DataFrame(data["keywords"])], ignore_index=True)
    df_affiliations = pd.concat([df_affiliations, pd.DataFrame(data["affiliations"])], ignore_index=True)
    df_education = pd.concat([df_education, pd.DataFrame(data["education"])], ignore_index=True)

    # Publications
    df_publication = pd.concat([df_publication, pd.DataFrame(data_publication["publications"])], ignore_index=True)
    df_publication_author = pd.concat([df_publication_author, pd.DataFrame(data_publication["publications_authors"])], ignore_index=True)


dyczkowski = "0000-0002-2897-3176"  # Krzysztof Dyczkowski
zywica = "0000-0003-3542-8982"  # Patryk Żywica

def collect_data(orcid_id: str) -> None:
    person = fetch_orcid_person(orcid_id)
    employment = fetch_orcid_employment(orcid_id)
    education = fetch_orcid_education(orcid_id)
    publications = fetch_orcid_works(orcid_id)
    
    parsed = parse_orcid_json(orcid_id, person, employment, education)
    
    if not parsed or not parsed.get("researcher"):
        return  # Нет данных, ничего не делаем
    
    country = parsed["researcher"].get("country")
    if country is None:
        return  # Нет страны — пропускаем
    
    country_lower = country.lower()
    if country_lower not in ["pl", "poland"]:
        return  # Не Польша — пропускаем

    parsed_publications = parse_orcid_works(publications, parsed["researcher"]["id"])
    insert_data(parsed, parsed_publications)



def get_orcid_ids_by_query(query: str, count: int = 100):
    headers = {"Accept": "application/json"}
    rows = []
    start = 0
    while len(rows) < count:
        url = f"https://pub.orcid.org/v3.0/expanded-search/?q={query}&start={start}&rows=100"
        r = requests.get(url, headers=headers)
        data = r.json()
        results = data.get("expanded-result", [])
        if not results:
            break
        rows.extend([res["orcid-id"] for res in results])
        start += 100
    return rows[:count]

def get_orcid_ids_poland(count=100):
    # Формируем запрос с фильтром по тексту "Poland"
    query = "text:Poland"
    return get_orcid_ids_by_query(query, count=count)


topics = [                                                              
    "artificial intelligence",
    "machine learning"
    "climate change",
    "bioinformatics"
    "neuroscience",
    "robotics",
    "mathematics",
    "economics",
    "social sciences",
    "history",
    "cultural studies",
    "energy systems",
    "quantum computing",
    "materials science",
    "public health"
]

def collect_diverse_orcid_ids(topics, per_topic=10): #per_topic=70_res
    all_ids = set()
    for topic in topics:
        ids = get_orcid_ids_by_query(topic.replace(" ", "+"), count=per_topic)
        all_ids.update(ids)
    return list(all_ids)

#my_list = collect_diverse_orcid_ids(topics)
my_list = get_orcid_ids_poland(count=50)



for id, scientist in enumerate(my_list):
    print(f"{id} / {len(my_list)}: ", scientist)
    #if id % 3 == 0:
        #time.sleep(12)
    collect_data(scientist)

new_researcher_df = df_researcher[["id","orcid_id","first_name","last_name","full_name","country","primary_affiliation","created_at","updated_at"]].merge(
    df_education[["researcher_id","degree","field"]],
    left_on="id",
    right_on="researcher_id",
    how='outer')
new_researcher_df = new_researcher_df.drop(columns=['researcher_id'])

new_researcher_df = new_researcher_df.drop_duplicates(subset='id',keep='first') ##
# usuwanie duplikatów UNIQUE research id -> zrobić new table education z degree i field

new_publication_df = df_publication[["id","title","journal","doi","year","source","project_id"]]
new_publication_author_df= df_publication_author[["id","publication_id","researcher_id","author_order","is_corresponding"]]
new_affiliations_df= df_affiliations
new_keywords_df = df_keywords
new_emails_df = [] 

for i in range(len(df_researcher["id"])):
    p_uuid = str(uuid.uuid4())
    new_emails_df.append({
        'id': p_uuid,
        'researcher_id': df_researcher["id"][i],
        'email': df_researcher["email"][i]})
                    

new_emails_df = pd.DataFrame(new_emails_df)


#print(new_researcher_df2)

#wypełnianie bazy danych

Session = sessionmaker(bind=engine)
session = Session()


for _, row in new_researcher_df.iterrows():
    researcher = Researcher(
        id=row["id"],
        orcid_id=row["orcid_id"],
        first_name=row["first_name"],
        last_name=row["last_name"],
        full_name=row["full_name"],
        country=row["country"],
        current_affiliation=row["primary_affiliation"],
        degree=row["degree"],
        field=row["field"],
        created_at=row["created_at"],
        updated_at=row["updated_at"]
    )

    session.add(researcher)


for _, row in new_publication_df.iterrows():
    publication = Publication(
        id=row["id"],
        title=row["title"],
        journal=row["journal"],
        doi=row["doi"],
        year=row["year"],
        source=row["source"],
        project_id=row["project_id"]

    )

    session.add(publication)

for _, row in new_publication_author_df.iterrows():
    publication_author = PublicationAuthor(
        id=row["id"],
        publication_id=row["publication_id"],
        researcher_id=row["researcher_id"],
        author_order=row["author_order"],
        is_corresponding=row["is_corresponding"]

    )

    session.add(publication_author)


for _, row in new_affiliations_df.iterrows():
    affiliation = Affiliation(
        id=row["id"],
        researcher_id=row["researcher_id"],
        institution=row["institution"],
        department = row["department"],
        role=row["role"],
        country=row["country"],
        start_date=row["start_date"],
        end_date= row["end_date"]

    )

    session.add(affiliation)

for _, row in new_keywords_df.iterrows():
    keywords = Keyword(
        id=row["id"],
        researcher_id=row["researcher_id"],
        keyword = row["keyword"]

    )

    session.add(keywords)

for _, row in new_emails_df.iterrows():
    emails = Email(
        id=row["id"],
        researcher_id=row["researcher_id"],
        email = row["email"]

    )

    session.add(emails)



# Zapisz zmiany
try:
    session.commit()
    print("Dane dodane do bazy")
except Exception as e:
    session.rollback()
    print("Błąd podczas dodawania danych:", e)



'''
for name, table in Database.items():
    print(table)
    table.to_sql(name, conn, if_exists="replace", index=False)
    print(f"Zapisano tabelę {name} do bazy danych.")
    print("---------------\n")

print("KEYWORDS")
print(df_keywords)
#wrzucania danych

cursor = conn.cursor()

# List all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
print(cursor.fetchall())

cursor.execute("SELECT * FROM Researcher LIMIT 5;")
for row in cursor.fetchall():
    print(row)

cursor.execute("SELECT COUNT(*) FROM Researcher;")
print("Rows in Researcher:", cursor.fetchone()[0])
conn.commit()
'''
