from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.task import Task, TaskStatus
from app.models.document import Document
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.schemas.schemas import AnalyticsOut
from app.core.security import require_admin

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("", response_model=AnalyticsOut)
def get_analytics(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_tasks = db.query(Task).count()
    completed = db.query(Task).filter(Task.status == TaskStatus.completed).count()
    pending = db.query(Task).filter(Task.status == TaskStatus.pending).count()
    in_progress = db.query(Task).filter(Task.status == TaskStatus.in_progress).count()
    total_docs = db.query(Document).count()
    total_users = db.query(User).count()

    # Most searched queries (last 50 search logs)
    search_logs = (
        db.query(ActivityLog.detail, func.count(ActivityLog.id).label("cnt"))
        .filter(ActivityLog.action == "search")
        .group_by(ActivityLog.detail)
        .order_by(func.count(ActivityLog.id).desc())
        .limit(10)
        .all()
    )
    top_searches = [{"query": row.detail, "count": row.cnt} for row in search_logs]

    return AnalyticsOut(
        total_tasks=total_tasks,
        completed_tasks=completed,
        pending_tasks=pending,
        in_progress_tasks=in_progress,
        total_documents=total_docs,
        total_users=total_users,
        top_searches=top_searches,
    )
