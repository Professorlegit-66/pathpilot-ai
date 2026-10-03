import os
import json
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# Import distance utilities from utils.py
from utils import calculate_haversine_distance, CITY_COORDINATES

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
    radius_mode: Optional[str] = "ALL"  # "100KM" or "ALL"

# --- Robust Absolute Path Dataset Loader ---
def load_dataset(filename: str) -> List[Dict[str, Any]]:
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    filepath = os.path.join(base_dir, "data", filename)
    
    if not os.path.exists(filepath):
        print(f"[Warning] Dataset file not found at: {filepath}")
        return []
    
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[Error] Failed to load {filename}: {e}")
        return []

# --- Core Deterministic Functions ---

def evaluate_eligibility(profile: StudentProfileInput, program: Dict) -> Dict:
    reqs = program.get("eligibility", {})
    reasons = []
    
    # 1. HSSC / Grade Check
    min_hssc = reqs.get("minimum_hssc_percent", program.get("min_overall_percent"))
    if min_hssc is not None:
        if profile.hssc_percentage is None:
            return {"status": "UNKNOWN", "reasons": ["⚠ More information required: Grade percentage not provided."]}
        elif profile.hssc_percentage >= min_hssc:
            reasons.append(f"✓ Meets minimum academic requirement ({min_hssc}%)")
        else:
            return {"status": "NOT_ELIGIBLE", "reasons": [f"✕ Does not meet academic requirement (Requires {min_hssc}%, you have {profile.hssc_percentage}%)"]}
            
    # 2. SSC Percentage Check
    min_ssc = reqs.get("minimum_ssc_percent")
    if min_ssc is not None:
        if profile.ssc_percentage is None:
            return {"status": "UNKNOWN", "reasons": ["⚠ More information required: Secondary percentage not provided."]}
        elif profile.ssc_percentage >= min_ssc:
            reasons.append(f"✓ Meets minimum secondary school requirement ({min_ssc}%)")
        else:
            return {"status": "NOT_ELIGIBLE", "reasons": [f"✕ Does not meet secondary requirement (Requires {min_ssc}%, you have {profile.ssc_percentage}%)"]}

    # 3. Math Background Check
    requires_math = reqs.get("mathematics_required", False)
    if requires_math:
        is_math_user = profile.mathematics_background if profile.mathematics_background is not None else True
        if is_math_user:
            reasons.append("✓ Meets mathematics background requirement")
        else:
            return {"status": "NOT_ELIGIBLE", "reasons": ["✕ Does not meet the mathematics background requirement"]}

    # 4. Stream / Group Check
    allowed_groups = reqs.get("hssc_groups", program.get("accepted_streams", []))
    if allowed_groups:
        user_group = profile.hssc_group if profile.hssc_group else "Pre-Engineering"
        if user_group in allowed_groups:
            reasons.append(f"✓ Stream/Group ({user_group}) is accepted")
        else:
            return {"status": "NOT_ELIGIBLE", "reasons": [f"✕ Stream ({user_group}) is not eligible for this program"]}

    field = program.get('field', program.get('field_category', 'Computer Science'))
    reasons.append(f"✓ Matches your preferred field ({field})")
    
    return {"status": "ELIGIBLE", "reasons": reasons}

def match_scholarships(profile: StudentProfileInput, university_id: str, university_name: str) -> List[Dict]:
    scholarships = load_dataset("scholarships.json")
    matched = []
    
    for sch in scholarships:
        sch_uni_id = sch.get("university_id", "")
        provider = sch.get("provider", "")
        
        # Match by relational university_id or provider name fallback
        is_match = (sch_uni_id and sch_uni_id == university_id) or \
                   (provider and (provider.lower() in university_name.lower() or university_name.lower() in provider.lower()))
        
        if is_match:
            sch_type = sch.get("type", "")
            if sch_type in ["need_based", "need_based_loan"] and not profile.financial_need_status:
                continue
                
            matched.append({
                "name": sch.get("name", "Scholarship"),
                "type": sch_type.replace("_", " ").title(),
                "coverage": sch.get("coverage", "As per institutional policy")
            })
            
    return matched

# --- API Endpoint ---

@router.post("/match")
def match_programs(profile: StudentProfileInput):
    programs_data = load_dataset("programs.json")
    universities_data = load_dataset("universities.json")
    
    univ_map = {u.get("university_id", u.get("id")): u for u in universities_data}
    
    # Coordinates for user location
    user_city = (profile.city or "Kohat").lower().strip()
    user_lat, user_lon = CITY_COORDINATES.get(user_city, (33.5822, 71.4492))
    
    user_country = (profile.country or "Pakistan").lower().strip()
    radius_mode = (profile.radius_mode or "ALL").upper()
    
    results = []
    for prog in programs_data:
        # Field filter
        pref_field = profile.preferred_field or "Computer Science"
        prog_field = prog.get("field", prog.get("field_category", "Computer Science"))
        if pref_field.lower() not in prog_field.lower():
            continue
            
        # Get university details
        uni_id = prog.get("university_id")
        univ_details = univ_map.get(uni_id, {})
        
        # 1. Multi-Country Filter
        uni_country = (univ_details.get("country") or "Pakistan").lower().strip()
        if uni_country != user_country:
            continue
            
        # 2. Haversine 100km Distance Calculation
        uni_lat = float(univ_details.get("latitude", 0.0))
        uni_lon = float(univ_details.get("longitude", 0.0))
        
        dist_km = calculate_haversine_distance(user_lat, user_lon, uni_lat, uni_lon) if (uni_lat and uni_lon) else 0.0
        
        # 3. Apply 100km Radius Filter
        if radius_mode == "100KM" and dist_km > 100.0:
            continue
            
        full_univ_name = univ_details.get("name", univ_details.get("university_name", "Verified Institution"))
        city_name = univ_details.get("city", prog.get("campus", "Islamabad"))
            
        # Evaluate eligibility
        eligibility = evaluate_eligibility(profile, prog)
        
        # Match financial aid
        financial_aid = match_scholarships(profile, uni_id, full_univ_name)
        if financial_aid:
            eligibility["reasons"].append("✓ Financial-aid information is available")
            
        # Distance tag reason
        if dist_km > 0:
            eligibility["reasons"].append(f"📍 Distance: ~{round(dist_km, 1)} km from {profile.city}")

        # HEC Recognition status
        hec_status = univ_details.get("hec_recognition", univ_details.get("hec_recognition_status", "Recognized"))
        if isinstance(hec_status, bool):
            hec_status = "Recognized" if hec_status else "Not Listed"

        # Accreditation
        acc_info = prog.get("accreditation", univ_details.get("accreditation", "Verified"))
        if isinstance(acc_info, dict):
            acc_status = f"{acc_info.get('body', 'NCEAC')}: {acc_info.get('status', 'Verified')}"
        else:
            acc_status = str(acc_info)
            
        results.append({
            "program_id": prog.get("program_id", prog.get("id", "prog_01")),
            "university_name": full_univ_name,
            "program_name": prog.get("program_name", prog.get("name", "BS Computer Science")),
            "city": city_name,
            "country": univ_details.get("country", "Pakistan"),
            "distance_km": round(dist_km, 1),
            "hec_recognition": hec_status,
            "accreditation": acc_status,
            "eligibility_status": eligibility["status"],
            "why_this_appears": eligibility["reasons"],
            "available_scholarships": financial_aid
        })
        
    return results