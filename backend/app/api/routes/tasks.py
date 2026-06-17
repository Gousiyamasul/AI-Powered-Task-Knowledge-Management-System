from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.task import Task, TaskStatus
from app.models.user import User
from app.schemas.schemas import TaskCreate, TaskUpdate, TaskOut
from app.core.security import get_current_user, require_admin
from app.services.activity_service import log_action

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=List[TaskOut])
def list_tasks(
    status: Optional[TaskStatus] = Query(None),
    assigned_to: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Dynamic filtering:
      /tasks                        → all tasks visible to caller
      /tasks?status=completed       → filter by status
      /tasks?assigned_to=1          → filter by assignee
    Regular users only see tasks assigned to them.
    Admins see everything.
    """
    q = db.query(Task)
    if current_user.role.name != "admin":
        q = q.filter(Task.assigned_to == current_user.id)
    if status:
        q = q.filter(Task.status == status)
    if assigned_to:
        q = q.filter(Task.assigned_to == assigned_to)
    return q.order_by(Task.created_at.desc()).all()


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    task = Task(**payload.model_dump(), created_by=admin.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    log_action(db, admin.id, "task_create", f"Created task '{task.title}' (id={task.id})")
    return task


@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role.name != "admin" and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return task


@router.patch("/{task_id}", response_model=TaskOut)
def update_task_status(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role.name != "admin" and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    old_status = task.status
    task.status = payload.status
    db.commit()
    db.refresh(task)
    log_action(db, current_user.id, "task_update", f"Task {task_id}: {old_status} → {payload.status}")
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
