from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root:mysql@localhost:3306/AI_task"
    SECRET_KEY: str = "change-me-in-production-use-32-char-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    UPLOAD_DIR: str = "uploads"
    VECTOR_INDEX_PATH: str = "vector_store/faiss.index"
    VECTOR_META_PATH: str = "vector_store/meta.json"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
