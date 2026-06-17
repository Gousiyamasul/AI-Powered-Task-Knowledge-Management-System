# TaskFlow — AI-Powered Task & Knowledge Management System

A full-stack MVP with JWT auth, RBAC, semantic search (FAISS + sentence-transformers), and activity logging.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11+, FastAPI, SQLAlchemy 2.x |
| Database | MySQL 8+ (relational schema with FK constraints) |
| AI / Search | sentence-transformers (`all-MiniLM-L6-v2`), FAISS |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Frontend | React 18, Vite, React Router v6, Axios |

---

## Project Structure

```
project/
├── backend/
│   ├── app/
│   │   ├── api/routes/        # auth, tasks, documents, search, analytics, users
│   │   ├── core/              # config, security (JWT + RBAC)
│   │   ├── db/                # session, init_db
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic schemas (request/response)
│   │   ├── services/          # vector_service (FAISS), activity_service
│   │   ├── utils/             # seed (roles + admin user)
│   │   └── main.py            # FastAPI app entry point
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/               # Axios client
    │   ├── components/Common/ # Layout, Sidebar
    │   ├── context/           # AuthContext (JWT state)
    │   └── pages/             # Login, Register, Dashboard, Tasks, Documents, Search, Analytics
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8+
- React.js

### 1 — Database

```sql
CREATE DATABASE taskdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2 — Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env → set DATABASE_URL with your MySQL credentials

uvicorn app.main:app --reload --port 8000
```

On first run, the app:
- Creates all tables via SQLAlchemy
- Seeds `admin` and `user` roles
- Creates a default admin account: **username:** `admin` | **password:** `Admin@123`

### 3 — Frontend

```bash
cd frontend
npm install
npm run dev        # runs on http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Login → JWT |
| POST | `/auth/register` | Public | Create account |
| GET | `/auth/me` | Any | Current user |
| GET | `/tasks` | Any | List tasks (filterable) |
| POST | `/tasks` | Admin | Create & assign task |
| PATCH | `/tasks/{id}` | Any | Update task status |
| DELETE | `/tasks/{id}` | Admin | Delete task |
| GET | `/documents` | Any | List documents |
| POST | `/documents` | Admin | Upload + index document |
| DELETE | `/documents/{id}` | Admin | Delete document |
| POST | `/search` | Any | Semantic search |
| GET | `/analytics` | Admin | Dashboard stats |
| GET | `/users` | Admin | List all users |

### Dynamic Filtering Examples

```
GET /tasks?status=completed
GET /tasks?status=pending
GET /tasks?assigned_to=2
GET /tasks?status=in_progress&assigned_to=3
```

---

## AI / Semantic Search

The search pipeline:
1. On document upload → text is chunked (400 words, 50-word overlap)
2. Each chunk → embedding via `sentence-transformers/all-MiniLM-L6-v2` (384-dim)
3. Embeddings stored in a **FAISS** `IndexFlatL2` index, persisted to disk
4. On search → query is embedded, nearest neighbors retrieved, deduplicated by document
5. L2 distance converted to a 0–1 similarity score

No external LLM API is used for the core search logic.

---

## Default Credentials

| Username | Password | Role |
|---|---|---|
| admin | Admin@123 | Admin |

Create additional users via `/auth/register` or the Register page.
