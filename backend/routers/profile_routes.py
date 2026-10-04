import json
import jwt
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from database import get_db
import models
from config import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/api/profile", tags=["Student Profile"])

def get_current_user_id(authorization: Optional[str] = Header(None)) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization token")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except Exception:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

@router.get("/")
def get_user_profile(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    profile = db.query(models.DBStudentProfile).filter(models.DBStudentProfile.user_id == user_id).first()
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not profile:
        return {
            "name": user.full_name if user else "",
            "country": "Pakistan",
            "region": "Khyber Pakhtunkhwa",
            "city": "Kohat",
            "current_education_level": "HSSC",
            "ssc_percentage": 75.0,
            "hssc_percentage": 85.0,
            "hssc_group": "Pre-Engineering",
            "mathematics_background": True,
            "preferred_field": "Computer Science",
            "target_career": None,
            "selected_program": None,
            "financial_need_status": True
        }

    parsed_program = None
    if profile.selected_program:
        try:
            parsed_program = json.loads(profile.selected_program) if isinstance(profile.selected_program, str) else profile.selected_program
        except Exception:
            parsed_program = None

    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "name": (user.full_name if user else None) or getattr(profile, "name", "") or "",
        "country": profile.country or "Pakistan",
        "region": profile.region or "Khyber Pakhtunkhwa",
        "city": profile.city or "Kohat",
        "current_education_level": profile.current_education_level or "HSSC",
        "ssc_percentage": profile.ssc_percentage if profile.ssc_percentage is not None else 75.0,
        "hssc_percentage": profile.hssc_percentage if profile.hssc_percentage is not None else 85.0,
        "hssc_group": profile.hssc_group or "Pre-Engineering",
        "mathematics_background": profile.mathematics_background if profile.mathematics_background is not None else True,
        "preferred_field": profile.preferred_field or "Computer Science",
        "target_career": profile.target_career,
        "selected_program": parsed_program,
        "financial_need_status": profile.financial_need_status if profile.financial_need_status is not None else True
    }

@router.post("/")
def update_user_profile(payload: Dict[str, Any], user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    profile = db.query(models.DBStudentProfile).filter(models.DBStudentProfile.user_id == user_id).first()
    if not profile:
        profile = models.DBStudentProfile(user_id=user_id)
        db.add(profile)

    if "selected_program" in payload:
        prog = payload["selected_program"]
        if prog is None:
            profile.selected_program = None
        else:
            profile.selected_program = json.dumps(prog) if isinstance(prog, dict) else str(prog)

    if "target_career" in payload:
        profile.target_career = payload["target_career"]

    for field in ["country", "region", "city", "current_education_level", "ssc_percentage", 
                  "hssc_percentage", "hssc_group", "mathematics_background", "preferred_field", "financial_need_status"]:
        if field in payload and hasattr(profile, field):
            setattr(profile, field, payload[field])

    db.commit()
    db.refresh(profile)
    return get_user_profile(user_id=user_id, db=db)