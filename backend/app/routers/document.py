from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.core.security import get_current_user
from app.services.content_moderation_service import (
    contains_abusive_content,
)
from app.services.document_service import (
    SUPPORTED_DOCUMENT_TYPES,
    extract_document_text,
)


router = APIRouter(
    prefix="/api",
    tags=["Documents"],
)


MAX_DOCUMENT_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/documents/extract")
async def extract_document(
    file: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user),
):
    """
    Upload a PDF, TXT, DOCX, or EPUB file and extract its text.

    The uploaded document is processed in memory
    and is not permanently stored.
    """

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Please select a document.",
        )

    filename = file.filename

    extension = (
        "." + filename.rsplit(".", 1)[-1].lower()
        if "." in filename
        else ""
    )

    if extension not in SUPPORTED_DOCUMENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported document type. "
                "Only PDF, TXT, DOCX, and EPUB files are supported."
            ),
        )

    try:
        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="The uploaded document is empty.",
            )

        if len(file_bytes) > MAX_DOCUMENT_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Document size cannot exceed 10 MB.",
            )

        extracted_text = extract_document_text(
            filename=filename,
            file_bytes=file_bytes,
        )

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No readable text was found in the uploaded document.",
            )

        # ---------------------------------------------------------
        # Abusive content protection
        # ---------------------------------------------------------
        try:
            has_abusive_content = await contains_abusive_content(
                extracted_text
            )

        except RuntimeError:
            raise HTTPException(
                status_code=503,
                detail=(
                    "Unable to verify the document for abusive content. "
                    "Please try again later."
                ),
            )

        if has_abusive_content:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Inappropriate or abusive language was detected "
                    "in the document. Please upload a document without "
                    "abusive or offensive language."
                ),
            )

        return {
            "filename": filename,
            "file_type": extension.replace(".", "").upper(),
            "text": extracted_text,
            "character_count": len(extracted_text),
            "word_count": len(extracted_text.split()),
        }

    except HTTPException:
        raise

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:
        print(
            "DOCUMENT EXTRACTION ERROR:",
            repr(exc),
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to extract text from the document.",
        )

    finally:
        await file.close()