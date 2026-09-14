def get_voices():
    return [
        {
            "id": "default",
            "name": "Default Voice",
            "language": "en"
        }
    ]


def get_voice_ids():
    return {"default"}


def generate_speech(text: str, voice_id: str):
    raise RuntimeError(
        "Backend TTS generation has been disabled. TTS is now handled by Puter.js."
    )