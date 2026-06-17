from fastapi import APIRouter
from app.api.routes import auth, tasks, documents, search, analytics, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(tasks.router)
api_router.include_router(documents.router)
api_router.include_router(search.router)
api_router.include_router(analytics.router)
api_router.include_router(users.router)
