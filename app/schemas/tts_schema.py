from pydantic import BaseModel, Field


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    language: str
    voice: str


class TTSResponse(BaseModel):
    message: str
    language: str
    voice: str