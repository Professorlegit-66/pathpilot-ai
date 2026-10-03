from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from dependencies import get_current_user
import models

router = APIRouter(prefix="/api/profile", tags=["Profile"])

class ProfileData(BaseModel):
    name: Optional[str] = ""
    country: Optional[str] = "Pakistan"
    region: Optional[str] = ""
    city: Optional[str] = ""
    desired_degree: Optional[str] = "Bachelor"
    current_education_level: Optional[str] = "HSSC"
    ssc_percentage: Optional[float] = 75.0
    hssc_percentage: Optional[float] = 85.0
    hssc_group: Optional[str] = "Pre-Engineering"
    mathematics_background: Optional[bool] = True
    preferred_field: Optional[str] = "Computer Science"
    budget: Optional[str] = "Rs. 300,000 / year"
    financial_need_status: Optional[bool] = True
    gpa_score: Optional[str] = ""
    standardized_test: Optional[str] = ""

@router.get("/")
def get_user_profile(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.DBStudentProfile).filter(models.DBStudentProfile.user_id == current_user.id).first()
    
    # If no profile has been saved yet for this user, return an empty dictionary
    if not profile:
        return {}
        
    return {
        "name": current_user.full_name or "",
        "country": profile.country,
        "region": profile.region,
        "city": profile.city,
        "desired_degree": profile.desired_degree,
        "current_education_level": profile.current_education_level,
        "ssc_percentage": profile.ssc_percentage,
        "hssc_percentage": profile.hssc_percentage,
        "hssc_group": profile.hssc_group,
        "mathematics_background": profile.mathematics_background,
        "preferred_field": profile.preferred_field,
        "budget": profile.budget,
        "financial_need_status": profile.financial_need_status,
        "gpa_score": profile.gpa_score,
        "standardized_test": profile.standardized_test
    }
    
    if profile:
        for key in profile_dict.keys():
            if key != "name" and hasattr(profile, key):
                val = getattr(profile, key)
                if val is not None:
                    profile_dict[key] = val
                    
    return profile_dict

@router.post("/")
def save_user_profile(profile_data: ProfileData, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if profile_data.name:
        current_user.full_name = profile_data.name
        db.add(current_user)

    profile = db.query(models.DBStudentProfile).filter(models.DBStudentProfile.user_id == current_user.id).first()
    data_dict = profile_data.dict(exclude={"name"})
    
    if profile:
        for key, value in data_dict.items():
            setattr(profile, key, value)
    else:
        profile = models.DBStudentProfile(**data_dict, user_id=current_user.id)
        db.add(profile)
        
    db.commit()
    db.refresh(profile)
    
    return {
        "name": current_user.full_name,
        **{k: getattr(profile, k) for k in data_dict.keys()}
    }

@router.delete("/")
def delete_user_account(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Delete associated student profile if it exists
    profile = db.query(models.DBStudentProfile).filter(models.DBStudentProfile.user_id == current_user.id).first()
    if profile:
        db.delete(profile)
    
    # Delete the user account permanently
    db.delete(current_user)
    db.commit()
    return {"status": "success", "message": "Account deleted permanently"}