from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.schemas.tts_schema import (
    TTSRequest,
    TTSHistoryResponse,
    SUPPORTED_LANGUAGES,
)
from app.services.tts_service import (
    generate_speech,
    get_voices as get_voices_from_service,
    get_voice_ids,
)
from app.services.content_moderation_service import (
    contains_abusive_content,
)
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.rate_limit import limiter
from app.models.tts_history import TTSHistory


router = APIRouter(
    prefix="/api",
    tags=["TTS"],
)


# ---------------------------------------------------------
# Generate Speech
# ---------------------------------------------------------

@router.post("/tts")
@limiter.limit("10/minute")
async def generate_tts(
    request: Request,
    tts_request: TTSRequest,
    history_id: int | None = None,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    user_id = int(current_user_id)

    # -----------------------------------------------------
    # Language validation
    # -----------------------------------------------------

    if tts_request.language not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported language",
        )

    # -----------------------------------------------------
    # Abusive content protection
    # -----------------------------------------------------

    try:
        has_abusive_content = await contains_abusive_content(
            tts_request.text
        )

    except RuntimeError:
        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to verify the text for abusive content. "
                "Please try again later."
            ),
        )

    if has_abusive_content:
        raise HTTPException(
            status_code=400,
            detail=(
                "Inappropriate or abusive language was detected. "
                "Please remove it before generating speech."
            ),
        )

    # -----------------------------------------------------
    # Voice validation
    # -----------------------------------------------------

    try:
        voice_ids = get_voice_ids()

        if tts_request.voice not in voice_ids:
            raise HTTPException(
                status_code=400,
                detail="Invalid voice",
            )

        audio = generate_speech(
            text=tts_request.text,
            voice_id=tts_request.voice,
        )

        # -------------------------------------------------
        # Update existing history
        # -------------------------------------------------

        if history_id is not None:
            history = (
                db.query(TTSHistory)
                .filter(
                    TTSHistory.id == history_id,
                    TTSHistory.user_id == user_id,
                )
                .first()
            )

            if not history:
                raise HTTPException(
                    status_code=404,
                    detail="History item not found",
                )

            history.text = tts_request.text
            history.language = tts_request.language
            history.voice = tts_request.voice

        # -------------------------------------------------
        # Create new history
        # -------------------------------------------------

        else:
            history = TTSHistory(
                user_id=user_id,
                text=tts_request.text,
                language=tts_request.language,
                voice=tts_request.voice,
            )

            db.add(history)

        db.commit()

        return StreamingResponse(
            audio,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": (
                    "attachment; filename=speech.mp3"
                )
            },
        )

    except HTTPException:
        db.rollback()
        raise

    except Exception as exc:
        db.rollback()

        print(
            "TTS ERROR:",
            repr(exc),
        )

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# ---------------------------------------------------------
# Languages
# ---------------------------------------------------------

@router.get("/languages")
def get_languages():
    return {
        "languages": [
            {
                "code": code,
                "name": name,
            }
            for code, name in SUPPORTED_LANGUAGES.items()
        ]
    }


# ---------------------------------------------------------
# Voices
# ---------------------------------------------------------

@router.get("/voices")
def get_voices():
    try:
        voices = get_voices_from_service()

        return {
            "voices": voices,
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to fetch voices. "
                "Please try again later."
            ),
        )


# ---------------------------------------------------------
# Get History
# ---------------------------------------------------------

@router.get(
    "/history",
    response_model=list[TTSHistoryResponse],
)
def get_history(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
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


# ---------------------------------------------------------
# Create History
# ---------------------------------------------------------

@router.post(
    "/history",
    response_model=TTSHistoryResponse,
    status_code=201,
)
def create_history(
    request: TTSRequest,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    history = TTSHistory(
        user_id=int(current_user_id),
        text=request.text,
        language=request.language,
        voice=request.voice,
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    return history


# ---------------------------------------------------------
# Delete One History Item
# ---------------------------------------------------------

@router.delete("/history/{history_id}")
def delete_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    history = (
        db.query(TTSHistory)
        .filter(
            TTSHistory.id == history_id,
            TTSHistory.user_id == int(current_user_id),
        )
        .first()
    )

    if not history:
        raise HTTPException(
            status_code=404,
            detail="History item not found",
        )

    db.delete(history)
    db.commit()

    return {
        "message": "History item deleted successfully",
    }


# ---------------------------------------------------------
# Clear All History
# ---------------------------------------------------------

@router.delete("/history")
def clear_history(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    deleted_count = (
        db.query(TTSHistory)
        .filter(
            TTSHistory.user_id == int(current_user_id)
        )
        .delete(
            synchronize_session=False
        )
    )

    db.commit()

    return {
        "message": "All history deleted successfully",
        "deleted_count": deleted_count,
    }