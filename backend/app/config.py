from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+asyncpg://localhost/neondb"
    auth_secret: str = "dev-secret-change-me"
    # Matches the frontend's SESSION_MAX_AGE_SECONDS (7 days).
    token_expire_minutes: int = 60 * 24 * 7
    access_token_algorithm: str = "HS256"
    cors_origins: str = "http://localhost:3000"
    low_stock_threshold: int = 5

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
