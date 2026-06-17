from __future__ import annotations
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models.task import TaskStatus


# ── Auth ──────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    username: str


# ── Role ──────────────────────────────────────────────
class RoleOut(BaseModel):
    id: int
    name: str
    model_config = {"from_attributes": True}


# ── User ──────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role_id: int = 2  # default: user


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: RoleOut
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Task ──────────────────────────────────────────────
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[int] = None


class TaskUpdate(BaseModel):
    status: TaskStatus


class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    assigned_to: Optional[int]
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime]
    assignee: Optional[UserOut]
    creator: UserOut
    model_config = {"from_attributes": True}


# ── Document ──────────────────────────────────────────
class DocumentOut(BaseModel):
    id: int
    title: str
    filename: str
    uploaded_by: int
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Search ────────────────────────────────────────────
class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


class SearchResult(BaseModel):
    document_id: int
    title: str
    snippet: str
    score: float


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]


# ── Analytics ─────────────────────────────────────────
class AnalyticsOut(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    total_documents: int
    total_users: int
    top_searches: List[dict]


# ── Activity Log ──────────────────────────────────────
class ActivityLogOut(BaseModel):
    id: int
    user_id: int
    action: str
    detail: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}
