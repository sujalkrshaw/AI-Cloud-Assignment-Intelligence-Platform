from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: str = Field(pattern="^(student|teacher)$")

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class AssignmentCreate(BaseModel):
    course_id: int
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10)
    deadline: datetime
    max_marks: int = Field(gt=0, le=100)
    rubric: str = Field(min_length=10)
    allowed_extensions: str = "pdf,txt,docx"

class GradeRequest(BaseModel):
    marks: float = Field(ge=0)
    feedback: str = Field(min_length=3, max_length=5000)

class AssignmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    course_id: int
    title: str
    description: str
    deadline: datetime
    max_marks: int
    rubric: str
    allowed_extensions: str

class SubmissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    assignment_id: int
    student_id: int
    file_name: str
    submitted_at: datetime
    status: str
    marks: float | None
    feedback: str | None
