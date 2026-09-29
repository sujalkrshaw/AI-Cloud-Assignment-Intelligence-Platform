from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "sqlite:///./assignment_portal.db"
    jwt_secret: str = "change-me"
    access_token_expire_minutes: int = 120
    cors_origins: str = "http://localhost:5173"
    upload_dir: str = "storage"
    max_upload_mb: int = 10
    demo_teacher_password: str = "Teacher@123"
    demo_student_password: str = "Student@123"
    demo_admin_password: str = "Admin@123"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
