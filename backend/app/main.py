from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.database import Base, engine
from app.core.rate_limit import limiter

from app.routers.auth import router as auth_router
from app.routers.tts import router as tts_router
from app.routers.document import router as document_router

from app.models.user import User
from app.models.tts_history import TTSHistory


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    debug=settings.DEBUG,
)


app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://dhruvit-text-to-speech.vercel.app",
        "https://text-to-speech.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(tts_router)
app.include_router(document_router)


@app.get("/")
def root():
    return {
        "message": "Text-to-Speech Application API is running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "database": "connected",
        "tts": "puter.js",
    }