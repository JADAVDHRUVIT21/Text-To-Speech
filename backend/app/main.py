from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.database import Base, engine

# Import all models so SQLAlchemy knows about every table.
from app.models.user import User
from app.models.folder import Folder
from app.models.file import File
from app.models.file_version import FileVersion
from app.models.share import Share
from app.models.link_share import LinkShare
from app.models.star import Star
from app.models.activity import Activity
from app.models.tts_history import TTSHistory

from app.core.rate_limit import limiter

from app.routes.auth import router as auth_router
from app.routers.tts import router as tts_router
from app.routers.document import router as document_router


# Create database tables.
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Text-to-Speech Application",
    version="1.0.0",
)


# ---------------------------------------------------------
# Rate limiting
# ---------------------------------------------------------

app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Routers
# ---------------------------------------------------------

app.include_router(auth_router)
app.include_router(tts_router)
app.include_router(document_router)


# ---------------------------------------------------------
# Root
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Text-to-Speech Application API is running"
    }


# ---------------------------------------------------------
# Health
# ---------------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }