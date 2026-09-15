import httpx


PURGO_MALUM_URL = (
    "https://www.purgomalum.com/service/containsprofanity"
)


async def contains_abusive_content(text: str) -> bool:
    """
    Check text for profanity using the PurgoMalum API.

    Returns:
        True  -> abusive/profane content detected
        False -> no profanity detected
    """

    if not text or not text.strip():
        return False

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                PURGO_MALUM_URL,
                params={
                    "text": text,
                },
            )

            response.raise_for_status()

            result = response.text.strip().lower()

            return result == "true"

    except httpx.HTTPError as exc:
        print(
            "CONTENT MODERATION API ERROR:",
            repr(exc),
        )

        # Fail closed for the TTS safety check.
        raise RuntimeError(
            "Unable to verify the text for abusive content."
        ) from exc