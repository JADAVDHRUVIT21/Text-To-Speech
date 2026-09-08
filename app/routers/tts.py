from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.schemas.tts_schema import TTSRequest
from app.services.tts_service import (
    generate_speech,
    get_voices as get_voices_from_service
)
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.tts_history import TTSHistory

router = APIRouter(prefix="/api", tags=["TTS"])


@router.post("/tts")
def generate_tts(
    request: TTSRequest,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    try:
        audio = generate_speech(
            text=request.text,
            voice_id=request.voice
        )

        history = TTSHistory(
            user_id=int(current_user_id),
            text=request.text,
            language=request.language,
            voice=request.voice
        )

        db.add(history)
        db.commit()

        return StreamingResponse(
            audio,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=speech.mp3"
            }
        )

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"TTS generation failed: {str(e)}"
        )


@router.get("/voices")
def get_voices():
    try:
        voices = get_voices_from_service()

        return {
            "voices": voices
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch voices: {str(e)}"
        )
        
@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    history = (
        db.query(TTSHistory)
        .filter(TTSHistory.user_id == int(current_user_id))
        .order_by(TTSHistory.created_at.desc())
        .all()
    )

    return {
        "history": history
    }