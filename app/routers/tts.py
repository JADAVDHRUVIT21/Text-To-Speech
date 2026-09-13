from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.schemas.tts_schema import (
    TTSRequest,
    TTSHistoryResponse,
    SUPPORTED_LANGUAGES
)
from app.services.tts_service import (
    generate_speech,
    get_voices as get_voices_from_service,
    get_voice_ids
)
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.tts_history import TTSHistory


router = APIRouter(
    prefix="/api",
    tags=["TTS"]
)


@router.post("/tts")
def generate_tts(
    request: TTSRequest,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    if request.language not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported language"
        )

    try:
        voice_ids = get_voice_ids()

        if request.voice not in voice_ids:
            raise HTTPException(
                status_code=400,
                detail="Invalid voice"
            )

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

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()

        raise HTTPException(
        status_code=500,
        detail="TTS generation failed. Please try again later."
        )


@router.get("/voices")
def get_voices():
    try:
        voices = get_voices_from_service()

        return {
            "voices": voices
        }

    except Exception:
        raise HTTPException(
        status_code=500,
        detail="Failed to fetch voices. Please try again later."
    )


@router.get(
    "/history",
    response_model=list[TTSHistoryResponse]
)
def get_history(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    history = (
        db.query(TTSHistory)
        .filter(
            TTSHistory.user_id == int(current_user_id)
        )
        .order_by(
            TTSHistory.created_at.desc()
        )
        .all()
    )

    return history

@router.delete("/history/{history_id}")
def delete_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    history = (
        db.query(TTSHistory)
        .filter(
            TTSHistory.id == history_id,
            TTSHistory.user_id == int(current_user_id)
        )
        .first()
    )

    if not history:
        raise HTTPException(
            status_code=404,
            detail="History item not found"
        )

    db.delete(history)
    db.commit()

    return {
        "message": "History item deleted successfully"
    }


@router.delete("/history")
def clear_history(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    deleted_count = (
        db.query(TTSHistory)
        .filter(
            TTSHistory.user_id == int(current_user_id)
        )
        .delete(synchronize_session=False)
    )

    db.commit()

    return {
        "message": "All history deleted successfully",
        "deleted_count": deleted_count
    }
