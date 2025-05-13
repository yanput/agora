# Angora of Acceleration Services (Środowisko developerskie)

Projekt **Angora** to aplikacja webowa składająca się z frontend’u w React (Vite) oraz backend’u w FastAPI.

---

## Stos technologiczny

- Backend: **FastAPI + PostgreSQL**
- Frontend: **React (Vite)**
- Konteneryzacja: **Docker + Docker Compose**
- Routing: **Traefik**

---

## Uruchomienie lokalne

> Upewnij się, że masz zainstalowane **Docker**

### 1. Sklonuj repozytorium

```bash
git clone https://github.com/twoja-nazwa-uzytkownika/angora.git
cd angora
````

### 2. Skonfiguruj plik `.env`

Upewnij się, że plik `.env` istnieje w katalogu głównym projektu. Przykładowe wartości środowiskowe są już ustawione (dostęp do bazy, frontend, backend itp.).

### 3. Dodaj wpisy do `/etc/hosts`

```txt
127.0.0.1 dashboard.localhost
127.0.0.1 api.localhost
127.0.0.1 adminer.localhost
```

### 4. Zbuduj i uruchom projekt

```bash
docker compose up --build
```

---

## Dostępne adresy usług

| Usługa       | URL                                                      |
| ------------ | -------------------------------------------------------- |
| Frontend     | [http://dashboard.localhost](http://dashboard.localhost) |
| Backend API  | [http://api.localhost/docs](http://api.localhost/docs)   |
| Adminer (DB) | [http://adminer.localhost](http://adminer.localhost)     |
| Mailcatcher  | [http://localhost:1080](http://localhost:1080)           |

---

## Dane testowe (logowanie)

```
Email:    admin@example.com
Hasło:    angoraadmin123
```

---

## Przydatne polecenia

Restart projektu:

```bash
docker compose down
docker compose up --build
```

Podgląd logów:

```bash
docker compose logs -f frontend
docker compose logs -f backend
```
