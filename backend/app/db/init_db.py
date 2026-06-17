from app.db.session import Base, engine
from app.models import user, role, task, document, activity_log  # noqa: F401


def init_db():
    Base.metadata.create_all(bind=engine)
