from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.db.init_db import init_db
from app.utils.seed import seed_roles_and_admin

app = FastAPI(title="Task & Knowledge Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.on_event("startup")
def on_startup():
    init_db()
    seed_roles_and_admin()


@app.get("/health")
def health():
    return {"status": "ok"}
