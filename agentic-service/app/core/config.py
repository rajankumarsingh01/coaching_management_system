from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    port: int = 8001
    node_backend_url: str = "http://localhost:5000"
    openrouter_api_key: str = ""
    google_api_key: str = ""
    mongo_uri: str = ""
    mongo_db_name: str = "coaching_app"   # NEW

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()