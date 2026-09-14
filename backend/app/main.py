from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.core.database import Base, engine
from app.models.user import User
from app.models.tts_history import TTSHistory
from app.routers.tts import router as tts_router
from app.routers.auth import router as auth_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(tts_router)
app.include_router(auth_router)


@app.get("/api/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "ok",
            "database": "connected",
            "tts": "puter.js"
        }

    except Exception:
        return {
            "status": "error",
            "database": "unavailable",
            "tts": "puter.js"
        }