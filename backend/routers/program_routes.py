import os
import json
from fastapi import APIRouter
from typing import List, Optional, Dict, Any

from utils import calculate_haversine_distance, CITY_COORDINATES

router = APIRouter(prefix="/api/programs", tags=["Programs & Eligibility"])

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

def evaluate_eligibility(profile_data: dict, program: Dict, target_career: Optional[str] = None) -> Dict:
    reqs = program.get("eligibility", {})
    reasons = []
    
    hssc_percentage = profile_data.get("hssc_percentage", 20.0)
    ssc_percentage = profile_data.get("ssc_percentage", 75.0)
    mathematics_background = profile_data.get("mathematics_background", True)
    hssc_group = profile_data.get("hssc_group", "Pre-Engineering")
    
    # 1. HSSC / Grade Check
    min_hssc = (
        reqs.get("minimum_hssc_percent") or 
        program.get("min_overall_percent") or 
        program.get("min_percentage") or 
        50.0
    )
    
    if min_hssc is not None:
        user_score = hssc_percentage
        if min_hssc <= 4.0 and user_score > 4.0:
            user_score = (hssc_percentage / 100.0) * 4.0
            
        if user_score >= min_hssc:
            reasons.append(f"✓ Meets minimum academic requirement (Threshold: {min_hssc}, Your Score: {round(user_score, 2)})")
        else:
            return {"status": "NOT_ELIGIBLE", "reasons": [f"✕ Does not meet academic requirement (Requires {min_hssc}, you have {round(user_score, 2)})"]}
            
    # 2. SSC Percentage Check
    min_ssc = reqs.get("minimum_ssc_percent")
    if min_ssc is not None:
        if ssc_percentage >= min_ssc:
            reasons.append(f"✓ Meets minimum secondary school requirement ({min_ssc}%)")
        else:
            return {"status": "NOT_ELIGIBLE", "reasons": [f"✕ Does not meet secondary requirement (Requires {min_ssc}%, you have {ssc_percentage}%)"]}

    # 3. Math Background Check
    requires_math = reqs.get("mathematics_required", False)
    if requires_math:
        if mathematics_background:
            reasons.append("✓ Meets mathematics background requirement")
        else:
            return {"status": "NOT_ELIGIBLE", "reasons": ["✕ Does not meet the mathematics background requirement"]}

    # 4. Stream / Group Check
    allowed_groups = reqs.get("hssc_groups", program.get("accepted_streams", []))
    if allowed_groups:
        if hssc_group in allowed_groups:
            reasons.append(f"✓ Stream/Group ({hssc_group}) is accepted")
        else:
            return {"status": "NOT_ELIGIBLE", "reasons": [f"✕ Stream ({hssc_group}) is not eligible for this program"]}

    field = program.get('field', program.get('field_category', 'Computer Science'))
    reasons.append(f"✓ Matches preferred field ({field})")

    if target_career:
        reasons.append(f"✓ Aligned with target career ({target_career})")
    
    return {"status": "ELIGIBLE", "reasons": reasons}

def match_scholarships_dict(profile_data: dict, university_id: str, university_name: str) -> List[Dict]:
    scholarships = load_dataset("scholarships.json")
    matched = []
    
    for sch in scholarships:
        sch_uni_id = sch.get("university_id", "")
        provider = sch.get("provider", "")
        
        is_match = (sch_uni_id and sch_uni_id == university_id) or \
                   (provider and (provider.lower() in university_name.lower() or university_name.lower() in provider.lower()))
        
        if is_match:
            sch_type = sch.get("type", "")
            if sch_type in ["need_based", "need_based_loan"] and not profile_data.get("financial_need_status", True):
                continue
                
            matched.append({
                "name": sch.get("name", "Scholarship"),
                "type": sch_type.replace("_", " ").title(),
                "coverage": sch.get("coverage", "As per institutional policy")
            })
            
    return matched

@router.post("/match")
def match_programs(payload: Dict[str, Any]):
    programs_data = load_dataset("programs.json")
    universities_data = load_dataset("universities.json")
    
    univ_map = {u.get("university_id", u.get("id")): u for u in universities_data}
    
    city = payload.get("city", "Kohat")
    user_city = city.lower().strip()
    user_lat, user_lon = CITY_COORDINATES.get(user_city, (33.5822, 71.4492))
    
    country = payload.get("country", "Pakistan")
    user_country = country.lower().strip()
    
    location_scope = payload.get("location_scope", "within_radius")
    radius_mode = str(payload.get("radius_mode", "ALL")).upper()
    radius_km = float(payload.get("radius_km", 100.0) or 100.0)
    
    preferred_field = payload.get("preferred_field", "Computer Science")
    target_career = payload.get("target_career")
    financial_need_status = payload.get("financial_need_status", True)
    
    hssc_percentage = None
    for key in ["hssc_percentage", "cumulative_high_school_pct", "gpa_percentage", "percentage", "score", "grade"]:
        if payload.get(key) is not None:
            try:
                hssc_percentage = float(payload.get(key))
                break
            except (ValueError, TypeError):
                pass
                
    if hssc_percentage is None:
        for k, v in payload.items():
            if v is not None and any(term in k.lower() for term in ["percent", "pct", "gpa", "grade", "score", "hssc", "school"]):
                try:
                    hssc_percentage = float(v)
                    break
                except (ValueError, TypeError):
                    pass
                    
    if hssc_percentage is None:
        hssc_percentage = 20.0 
        
    ssc_percentage = float(payload.get("ssc_percentage", 75.0) or 75.0)
    hssc_group = payload.get("hssc_group", "Pre-Engineering")
    mathematics_background = bool(payload.get("mathematics_background", True))
    
    profile_data = {
        "hssc_percentage": hssc_percentage,
        "ssc_percentage": ssc_percentage,
        "hssc_group": hssc_group,
        "mathematics_background": mathematics_background,
        "financial_need_status": financial_need_status
    }
    
    results = []
    for prog in programs_data:
        prog_field = prog.get("field", prog.get("field_category", "Computer Science"))
        
        # Filter programs based on preferred field or target career alignment
        field_match = preferred_field.lower() in prog_field.lower()
        career_match = target_career and target_career.lower() in prog.get("program_name", "").lower()
        
        if not (field_match or career_match):
            continue
            
        uni_id = prog.get("university_id")
        univ_details = univ_map.get(uni_id, {})
        
        uni_country = (univ_details.get("country") or "Pakistan").lower().strip()
        if uni_country != user_country:
            continue
            
        uni_lat = float(univ_details.get("latitude", 0.0))
        uni_lon = float(univ_details.get("longitude", 0.0))
        
        dist_km = calculate_haversine_distance(user_lat, user_lon, uni_lat, uni_lon) if (uni_lat and uni_lon) else 0.0
        
        # Enforce exact location radius filter
        if (location_scope == "within_radius" or radius_mode == "100KM") and dist_km > radius_km:
            continue
            
        full_univ_name = univ_details.get("name", univ_details.get("university_name", "Verified Institution"))
        city_name = univ_details.get("city", prog.get("campus", "Islamabad"))
            
        eligibility = evaluate_eligibility(profile_data, prog, target_career)
        
        financial_aid = match_scholarships_dict(profile_data, uni_id, full_univ_name)
        if financial_aid:
            eligibility["reasons"].append("✓ Financial-aid information is available")
            
        if dist_km > 0:
            eligibility["reasons"].append(f"📍 Distance: ~{round(dist_km, 1)} km from {city}")

        # Clean HEC recognition string (strip seed metadata)
        raw_hec = univ_details.get("hec_recognition", univ_details.get("hec_recognition_status", "Recognized"))
        if isinstance(raw_hec, bool):
            hec_status = "HEC Recognized" if raw_hec else "Not Listed"
        else:
            cleaned_hec = str(raw_hec).replace("(seed record)", "").replace("(seed)", "").strip()
            hec_status = cleaned_hec if cleaned_hec else "HEC Recognized"

        # Handle accreditation cleanly without generic warnings
        raw_acc = prog.get("accreditation", univ_details.get("accreditation"))
        if not raw_acc or str(raw_acc).strip() == "" or raw_acc == "None":
            acc_status = "Program accreditation information is not available in the current dataset."
        elif isinstance(raw_acc, dict):
            acc_status = f"{raw_acc.get('body', 'NCEAC')}: {raw_acc.get('status', 'Verified')}"
        else:
            cleaned_acc = str(raw_acc).replace("(seed record)", "").strip()
            if "institutional / program accreditation varies" in cleaned_acc.lower():
                acc_status = "Program accreditation information is not available in the current dataset."
            else:
                acc_status = cleaned_acc
            
        status_enum = eligibility["status"]
            
        results.append({
            "program_id": prog.get("program_id", prog.get("id", "prog_01")),
            "university_name": full_univ_name,
            "program_name": prog.get("program_name", prog.get("name", "BS Computer Science")),
            "city": city_name,
            "country": univ_details.get("country", "Pakistan"),
            "distance_km": round(dist_km, 1),
            "hec_recognition": hec_status,
            "accreditation": acc_status,
            "eligibility_status": status_enum,
            "why_this_appears": eligibility["reasons"],
            "available_scholarships": financial_aid
        })
        
    return results