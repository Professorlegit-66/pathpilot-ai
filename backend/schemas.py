from pydantic import BaseModel, Field
from typing import List, Optional

class StudentProfile(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Talha Ahmad"})
    country: str = Field(default="Pakistan")
    region: Optional[str] = Field(default="Khyber Pakhtunkhwa")
    city: str = Field(default="Kohat")
    current_education_level: str = Field(..., json_schema_extra={"example": "HSSC"})
    ssc_percentage: Optional[float] = Field(75.0, json_schema_extra={"example": 75.0})
    hssc_percentage: Optional[float] = Field(85.0, json_schema_extra={"example": 85.0})
    hssc_group: Optional[str] = Field("Pre-Engineering", json_schema_extra={"example": "Pre-Engineering"})
    mathematics_background: Optional[bool] = Field(True, json_schema_extra={"example": True})
    preferred_field: str = Field("Computer Science", json_schema_extra={"example": "Computer Science"})
    financial_need_status: bool = Field(default=True)

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str

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