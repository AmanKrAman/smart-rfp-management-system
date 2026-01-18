from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str
    
    port: int = 4200
    environment: str = "development"
    
    sendgrid_api_key: str
    sendgrid_from_email: str
    
    groq_api_key: str
    
    webhook_secret: Optional[str] = None  
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
