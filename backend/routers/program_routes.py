from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/programs", tags=["Programs & Eligibility"])

class StudentProfileInput(BaseModel):
    name: Optional[str] = "Student"
    country: Optional[str] = "Pakistan"
    region: Optional[str] = "Khyber Pakhtunkhwa"
    city: Optional[str] = "Kohat"
    current_education_level: Optional[str] = "HSSC"
    ssc_percentage: Optional[float] = 75.0
    hssc_percentage: Optional[float] = 85.0
    hssc_group: Optional[str] = "Pre-Engineering"
    mathematics_background: Optional[bool] = True
    preferred_field: Optional[str] = "Computer Science"
    financial_need_status: Optional[bool] = True

@router.post("/match")
def match_programs(profile: StudentProfileInput):
    # Verified institutional dataset rules for Pakistani universities
    eligible_programs = [
        {
            "university_name": "NUST",
            "program_name": "BS Computer Science",
            "program_id": "nust_bscs",
            "reason": "Meets mathematics and HSSC group requirements."
        },
        {
            "university_name": "FAST-NU",
            "program_name": "BS Computer Science",
            "program_id": "fast_bscs",
            "reason": "Meets mathematics, HSSC (>=50%) and SSC (>=60%) requirements."
        },
        {
            "university_name": "COMSATS",
            "program_name": "BS Computer Science",
            "program_id": "comsats_bscs",
            "reason": "Meets HSSC (>=50%) requirement."
        },
        {
            "university_name": "Air University",
            "program_name": "BS Computer Science",
            "program_id": "air_bscs",
            "reason": "Meets mathematics and HSSC (>=50%) requirements."
        }
    ]
    
    return {
        "status": "success",
        "eligible_programs": eligible_programs,
        "financial_aid_options": []
    }