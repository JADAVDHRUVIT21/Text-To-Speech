from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Text-to-Speech Application"
    DEBUG: bool = True
    DATABASE_URL: str
    SECRET_KEY: str
    TTS_API_KEY: str
    TTS_REGION: str = ""
    TTS_ENDPOINT: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()