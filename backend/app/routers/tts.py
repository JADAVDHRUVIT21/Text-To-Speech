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
    history_id: int | None = None,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    user_id = int(current_user_id)

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

        if history_id is not None:
            history = (
                db.query(TTSHistory)
                .filter(
                    TTSHistory.id == history_id,
                    TTSHistory.user_id == user_id
                )
                .first()
            )

            if not history:
                raise HTTPException(
                    status_code=404,
                    detail="History item not found"
                )

            history.text = request.text
            history.language = request.language
            history.voice = request.voice

        else:
            history = TTSHistory(
                user_id=user_id,
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

    except Exception as e:
        db.rollback()
        print("TTS ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/languages")
def get_languages():
    return {
        "languages": [
            {
                "code": code,
                "name": name
            }
            for code, name in SUPPORTED_LANGUAGES.items()
        ]
    }


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


@router.post(
    "/history",
    response_model=TTSHistoryResponse,
    status_code=201
)
def create_history(
    request: TTSRequest,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    history = TTSHistory(
        user_id=int(current_user_id),
        text=request.text,
        language=request.language,
        voice=request.voice
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    return history


@router.put(
    "/history/{history_id}",
    response_model=TTSHistoryResponse
)
def update_history(
    history_id: int,
    request: TTSRequest,
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

    history.text = request.text
    history.language = request.language
    history.voice = request.voice

    db.commit()
    db.refresh(history)

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