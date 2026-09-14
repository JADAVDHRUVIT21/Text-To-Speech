from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime

from app.core.database import Base


class TTSHistory(Base):
    __tablename__ = "tts_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    text = Column(Text, nullable=False)
    language = Column(String(50), nullable=False)
    voice = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)