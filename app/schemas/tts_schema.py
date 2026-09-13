from datetime import datetime

from pydantic import BaseModel, Field


SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "gu": "Gujarati",
    "mr": "Marathi",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
}


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    language: str = Field(..., min_length=2, max_length=10)
    voice: str = Field(..., min_length=1, max_length=100)


class TTSHistoryResponse(BaseModel):
    id: int
    user_id: int
    text: str
    language: str
    voice: str
    created_at: datetime

    class Config:
        from_attributes = True