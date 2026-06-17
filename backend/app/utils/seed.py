from app.db.session import SessionLocal
from app.models.role import Role
from app.models.user import User
from app.core.security import hash_password


def seed_roles_and_admin():
    db = SessionLocal()
    try:
        # Roles
        for name in ("admin", "user"):
            if not db.query(Role).filter(Role.name == name).first():
                db.add(Role(name=name))
        db.commit()

        # Default admin account
        if not db.query(User).filter(User.username == "admin").first():
            admin_role = db.query(Role).filter(Role.name == "admin").first()
            db.add(User(
                username="admin",
                email="admin@example.com",
                hashed_password=hash_password("Admin@123"),
                role_id=admin_role.id,
            ))
            db.commit()
            print("✅  Default admin created  →  username: admin | password: Admin@123")
    finally:
        db.close()
