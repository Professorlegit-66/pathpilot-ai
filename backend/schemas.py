from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

class StudentProfile(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Talha Ahmad"})
    country: Optional[str] = Field(default="")
    region: Optional[str] = Field(default="")
    city: Optional[str] = Field(default="")
    current_education_level: str = Field(..., json_schema_extra={"example": "HSSC"})
    ssc_percentage: Optional[float] = Field(None, json_schema_extra={"example": 75.0})
    hssc_percentage: Optional[float] = Field(None, json_schema_extra={"example": 85.0})
    hssc_group: Optional[str] = Field(None, json_schema_extra={"example": "Pre-Engineering"})
    mathematics_background: Optional[bool] = Field(False, json_schema_extra={"example": False})
    preferred_field: Optional[str] = Field(None, json_schema_extra={"example": "Computer Science"})
    financial_need_status: Optional[bool] = Field(default=None)

    @field_validator('preferred_field')
    @classmethod
    def normalize_preferred_field(cls, v: str) -> str:
        if v and v.lower().replace(" ", "") == "cybersecurity":
            return "Cybersecurity"
        return v

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str
    country: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class EligibilityResult(BaseModel):
    program_id: str
    program_name: str
    university_id: str
    eligibility_status: str
    reasoning: List[str]

class RoadmapRequest(BaseModel):
    profile: StudentProfile
    results: List[EligibilityResult]

class CounselorRequest(BaseModel):
    profile: StudentProfile
    query: str