from elevenlabs.client import ElevenLabs

from app.core.config import settings


client = ElevenLabs(
    api_key=settings.TTS_API_KEY
)


def get_voices():
    response = client.voices.search(page_size=100)

    return [
        {
            "id": voice.voice_id,
            "name": voice.name,
            "language": (
                voice.labels.get("language")
                if voice.labels
                else None
            )
        }
        for voice in response.voices
    ]


def generate_speech(text: str, voice_id: str):
    audio = client.text_to_speech.convert(
        voice_id=voice_id,
        text=text,
        model_id="eleven_multilingual_v2"
    )

    return audio