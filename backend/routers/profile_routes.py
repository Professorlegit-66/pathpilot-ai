from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from dependencies import get_current_user
import models

router = APIRouter(prefix="/api/profile", tags=["Profile"])

# Pydantic schema for validating profile data from the React frontend
class ProfileData(BaseModel):
    country: str = "Pakistan"
    region: Optional[str] = ""
    city: Optional[str] = ""
    current_education_level: Optional[str] = ""
    ssc_percentage: Optional[float] = 0.0
    hssc_percentage: Optional[float] = 0.0
    hssc_group: Optional[str] = ""
    mathematics_background: bool = True
    preferred_field: Optional[str] = ""
    financial_need_status: bool = True

@router.get("/")
def get_user_profile(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.DBStudentProfile).filter(models.DBStudentProfile.user_id == current_user.id).first()
    if not profile:
        return {}
    return profile

@router.post("/")
def save_user_profile(profile_data: ProfileData, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.DBStudentProfile).filter(models.DBStudentProfile.user_id == current_user.id).first()
    
    if profile:
        # Update existing profile
        for key, value in profile_data.dict().items():
            setattr(profile, key, value)
    else:
        # Create new profile
        profile = models.DBStudentProfile(**profile_data.dict(), user_id=current_user.id)
        db.add(profile)
        
    db.commit()
    db.refresh(profile)
    return profile