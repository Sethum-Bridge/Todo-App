import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """
    Application settings loaded from environment variables.
    """
    # MongoDB connection
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # JWT Configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # CORS Configuration
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    ALLOWED_ORIGINS: Optional[str] = os.getenv("ALLOWED_ORIGINS")
    
    # Cookie Configuration
    COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "False").lower() == "true"
    COOKIE_SAMESITE: str = os.getenv("COOKIE_SAMESITE", "lax")  # "lax", "strict", or "none"
    
    # App Configuration
    APP_NAME: str = os.getenv("APP_NAME", "Todo App API")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")


settings = Settings()

