import sys, os, time
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
import sqlite3
import pandas as pd
from pathlib import Path

from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Table, DateTime, Boolean, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.exc import  IntegrityError

import uuid
from datetime import datetime

import requests,json
# plik tworzy jsona "orcid_IDs.json" z 47k rekordów naukowców którzy mają w profilu text: Poland i są związani z jakimś tematem z topics2.


topics2 = [
    "artificial intelligence", "machine learning", "deep learning", "natural language processing",
    "computer vision", "neural networks", "data science", "big data", "data mining", "pattern recognition",
    "bioinformatics", "computational biology", "genomics", "proteomics", "metabolomics", "systems biology",
    "climate change", "environmental science", "ecology", "biodiversity", "sustainability", "carbon capture",
    "renewable energy", "solar energy", "wind energy", "geothermal energy", "nuclear energy",
    "battery technology", "energy storage", "materials science", "nanotechnology", "quantum computing",
    "quantum physics", "theoretical physics", "astrophysics", "cosmology", "particle physics", "string theory",
    "mathematics", "algebra", "geometry", "topology", "number theory", "statistics", "probability theory",
    "applied mathematics", "computational mathematics", "optimization", "operations research",
    "robotics", "autonomous systems", "control theory", "cybernetics", "electronics", "embedded systems",
    "mechanical engineering", "civil engineering", "electrical engineering", "chemical engineering",
    "aerospace engineering", "biomedical engineering", "structural engineering", "industrial engineering",
    "machine design", "fluid dynamics", "thermodynamics", "combustion", "materials engineering",
    "chemistry", "organic chemistry", "inorganic chemistry", "analytical chemistry", "physical chemistry",
    "theoretical chemistry", "computational chemistry", "chemical physics",
    "biology", "cell biology", "molecular biology", "developmental biology", "evolutionary biology",
    "marine biology", "plant biology", "zoology", "botany", "microbiology", "immunology", "virology",
    "epidemiology", "public health", "infectious diseases", "vaccinology", "pharmacology", "toxicology",
    "medical science", "clinical trials", "oncology", "neurology", "neuroscience", "psychiatry",
    "psychology", "cognitive science", "behavioral science", "social psychology", "developmental psychology",
    "sociology", "anthropology", "criminology", "social sciences", "demography", "political science",
    "international relations", "law", "jurisprudence", "constitutional law", "human rights", "public administration",
    "economics", "microeconomics", "macroeconomics", "development economics", "behavioral economics",
    "finance", "accounting", "marketing", "management", "business administration", "entrepreneurship",
    "education", "pedagogy", "educational psychology", "curriculum studies", "language education",
    "linguistics", "syntax", "phonetics", "morphology", "sociolinguistics", "computational linguistics",
    "philosophy", "ethics", "aesthetics", "epistemology", "logic", "metaphysics", "history of philosophy",
    "history", "modern history", "ancient history", "medieval history", "cultural history", "military history",
    "art history", "visual arts", "music", "literature", "comparative literature", "cultural studies",
    "gender studies", "media studies", "communication", "journalism", "film studies", "theatre studies",
    "architecture", "urban planning", "landscape architecture", "design", "graphic design", "fashion design",
    "transportation", "logistics", "supply chain", "information systems", "information science",
    "library science", "archival science", "digital humanities", "computational social science",
    "geography", "geology", "geophysics", "hydrology", "oceanography", "meteorology", "remote sensing",
    "GIS", "cartography", "space science", "astronomy", "planetary science", "exoplanets",
    "agriculture", "agronomy", "horticulture", "forestry", "food science", "nutrition", "veterinary science",
    "sports science", "kinematics", "biomechanics", "ergonomics", "occupational health", "nursing"]


def get_orcid_ids_by_query(query: str, count: int = 100):
    headers = {"Accept": "application/json"}
    rows = []
    start = 0
    while len(rows) < count:
        url = f"https://pub.orcid.org/v3.0/expanded-search/?q={query}&start={start}&rows=100"
        r = requests.get(url, headers=headers)
        if r.status_code !=200:
            print(f"Request failed, query: '{query}' status: {r.status_code} ")
            break
        data = r.json()
        results = data.get("expanded-result", [])
        if not results:
            break
        rows.extend([res["orcid-id"] for res in results])
        start += 100
        time.sleep(1)
    return rows[:count]
    
def collect_orcid_ids_poland_text_filter(topics, per_topic=1000):
    all_ids = set()
    for i, topic in enumerate(topics):
        query = f'text:"{topic}" AND text:Poland'
        print(f"[{i+1}/{len(topics)}] Temat: {topic}")
        ids = get_orcid_ids_by_query(query, count=per_topic)
        all_ids.update(ids)
        print(f" → razem zebrano: {len(all_ids)} ORCID ID")
        time.sleep(2)
        if len(all_ids) >= 100000:
            break
    return list(all_ids)[:100000]

def add_to_file(data):
    with open("orcid_IDs.json","w")as f:
      json.dump(data,f)

my_list = collect_orcid_ids_poland_text_filter(topics2, per_topic=1000)#per_topic=100

for i,x in enumerate(my_list):
    print(f"{i} / {len(my_list)}: ", x)

add_to_file(my_list)
  