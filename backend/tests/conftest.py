import os
os.environ["DATABASE_URL"]="sqlite:///./test_assignment.db"
os.environ["JWT_SECRET"]="test-secret"
os.environ["UPLOAD_DIR"]="test_storage"
os.environ["DEMO_TEACHER_PASSWORD"]="Teacher@123"
os.environ["DEMO_STUDENT_PASSWORD"]="Student@123"
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import Base, engine, SessionLocal
from backend.seed import seed

@pytest.fixture(scope="session", autouse=True)
def db_setup():
    Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine); seed()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    return TestClient(app)
