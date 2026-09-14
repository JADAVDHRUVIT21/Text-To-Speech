from datetime import datetime

from pydantic import BaseModel, Field


SUPPORTED_LANGUAGES = {
    "en": "English",
    "ja": "Japanese",
    "zh": "Chinese",
    "de": "German",
    "hi": "Hindi",
    "gu": "Gujarati",
    "fr": "French",
    "ko": "Korean",
    "pt": "Portuguese",
    "it": "Italian",
    "es": "Spanish",
    "id": "Indonesian",
    "nl": "Dutch",
    "tr": "Turkish",
    "fil": "Filipino",
    "pl": "Polish",
    "sv": "Swedish",
    "bg": "Bulgarian",
    "ro": "Romanian",
    "ar": "Arabic",
    "cs": "Czech",
    "el": "Greek",
    "fi": "Finnish",
    "hr": "Croatian",
    "ms": "Malay",
    "sk": "Slovak",
    "da": "Danish",
    "ta": "Tamil",
    "uk": "Ukrainian",  
    "ru": "Russian",
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