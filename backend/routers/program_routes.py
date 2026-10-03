import os
import json
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

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
    target_career: Optional[str] = None
    financial_need_status: Optional[bool] = True

# --- Data Loaders ---
def load_dataset(filename: str) -> List[Dict[str, Any]]:
    filepath = os.path.join(os.path.dirname(__file__), "..", "data", filename)
    if not os.path.exists(filepath):
        return []
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def load_verification_notes() -> Dict[str, Any]:
    filepath = os.path.join(os.path.dirname(__file__), "..", "data", "verification_notes.json")
    if not os.path.exists(filepath):
        return {}
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

# --- Core Deterministic Functions ---

def evaluate_eligibility(profile: StudentProfileInput, program: Dict) -> Dict:
    reqs = program.get("eligibility", {})
    reasons = []
    status = "ELIGIBLE"
    
    # 1. HSSC Percentage Check
    min_hssc = reqs.get("minimum_hssc_percent")
    if min_hssc is not None:
        if profile.hssc_percentage is None:
            return {"status": "UNKNOWN", "reasons": ["⚠ More information required: HSSC percentage not provided."]}
        elif profile.hssc_percentage >= min_hssc:
            reasons.append(f"✓ Meets minimum HSSC requirement ({min_hssc}%)")
        else:
            return {"status": "NOT_ELIGIBLE", "reasons": [f"✕ Does not meet HSSC requirement (Requires {min_hssc}%, you have {profile.hssc_percentage}%)"]}
            
    # 2. SSC Percentage Check
    min_ssc = reqs.get("minimum_ssc_percent")
    if min_ssc is not None:
        if profile.ssc_percentage is None:
            return {"status": "UNKNOWN", "reasons": ["⚠ More information required: SSC percentage not provided."]}
        elif profile.ssc_percentage >= min_ssc:
            reasons.append(f"✓ Meets minimum SSC requirement ({min_ssc}%)")
        else:
            return {"status": "NOT_ELIGIBLE", "reasons": [f"✕ Does not meet SSC requirement (Requires {min_ssc}%, you have {profile.ssc_percentage}%)"]}

    # 3. Math Background Check
    requires_math = reqs.get("mathematics_required", False)
    if requires_math:
        if profile.mathematics_background is None:
            return {"status": "UNKNOWN", "reasons": ["⚠ More information required: Mathematics background not verified."]}
        elif profile.mathematics_background:
            reasons.append("✓ Meets mathematics background requirement")
        else:
            return {"status": "NOT_ELIGIBLE", "reasons": ["✕ Does not meet the mathematics background requirement"]}

    # 4. HSSC Group Check
    allowed_groups = reqs.get("hssc_groups", [])
    if allowed_groups:
        if not profile.hssc_group:
            return {"status": "UNKNOWN", "reasons": ["⚠ More information required: HSSC group not provided."]}
        elif profile.hssc_group in allowed_groups:
            reasons.append(f"✓ HSSC Group ({profile.hssc_group}) is accepted")
        else:
            return {"status": "NOT_ELIGIBLE", "reasons": [f"✕ HSSC Group ({profile.hssc_group}) is not eligible for this program"]}

    reasons.append(f"✓ Matches your preferred field ({program.get('field', 'Computer Science')})")
    
    if profile.target_career:
        reasons.append(f"✓ Relevant to target career: {profile.target_career}")

    return {"status": status, "reasons": reasons}

def match_scholarships(profile: StudentProfileInput, university_name: str) -> List[Dict]:
    scholarships = load_dataset("scholarships.json")
    matched = []
    
    for sch in scholarships:
        provider = sch.get("provider", "")
        # Link scholarship to university if names overlap
        if provider in university_name or university_name in provider:
            sch_type = sch.get("type", "")
            
            # Need-based filter: Skip if scholarship is need-based but profile indicates no need
            if sch_type in ["need_based", "need_based_loan"] and not profile.financial_need_status:
                continue
                
            matched.append({
                "name": sch.get("name"),
                "type": sch_type.replace("_", " ").title(),
                "coverage": sch.get("coverage")
            })
            
    return matched

# --- API Endpoint ---

@router.post("/match")
def match_programs(profile: StudentProfileInput):
    programs_data = load_dataset("programs.json")
    universities_data = load_dataset("universities.json")
    
    # Create lookup map for universities
    univ_map = {u["id"]: u for u in universities_data}
    
    results = []
    for prog in programs_data:
        # Field filter
        if profile.preferred_field and profile.preferred_field.lower() not in prog.get("field", "").lower():
            continue
            
        # Get related university details
        univ_details = univ_map.get(prog.get("university_id"), {})
        full_univ_name = univ_details.get("name", "Unknown University")
            
        # Evaluate eligibility deterministically
        eligibility = evaluate_eligibility(profile, prog)
        
        # Match financial aid
        financial_aid = match_scholarships(profile, full_univ_name)
        if financial_aid:
            eligibility["reasons"].append("✓ Financial-aid information is available")
            
        # Format HEC Recognition strictly
        hec_recognized = univ_details.get("hec_recognized")
        hec_status = "Recognized" if hec_recognized else "Information not available in current dataset."
        
        # Extract accreditation exactly from dataset
        acc_info = prog.get("accreditation", {})
        acc_status = f"{acc_info.get('body', 'Unknown')}: {acc_info.get('status', 'Information not available in current dataset.')}"
            
        results.append({
            "program_id": prog.get("id"),
            "university_name": full_univ_name,
            "program_name": prog.get("name"),
            "city": prog.get("campus", univ_details.get("city", "Unknown City")),
            "hec_recognition": hec_status,
            "accreditation": acc_status,
            "eligibility_status": eligibility["status"],
            "why_this_appears": eligibility["reasons"],
            "available_scholarships": financial_aid
        })
        
    return results