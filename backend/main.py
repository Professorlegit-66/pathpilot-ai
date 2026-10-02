from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import json
import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Groq Client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI(
    title="PathPilot AI API",
    description="Backend MVP for education and career guidance using verified datasets.",
    version="1.0.0"
)

# Enable CORS for React frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# 1. DATA LAYER (Loading structured JSON files)
# -----------------------------------------------------------------------------
DATA_DIR = "data"

def load_json_data(filename: str) -> List[Dict[Any, Any]]:
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return []
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

# Load data into memory 
universities_db = load_json_data("universities.json")
programs_db = load_json_data("programs.json")
scholarships_db = load_json_data("scholarships.json")
careers_db = load_json_data("careers.json")


# -----------------------------------------------------------------------------
# 2. PYDANTIC MODELS (Data Validation)
# -----------------------------------------------------------------------------
class StudentProfile(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Ali Khan"})
    country: str = Field(default="Pakistan")
    city: str = Field(default="Islamabad")
    current_education_level: str = Field(..., json_schema_extra={"example": "HSSC"})
    ssc_percentage: Optional[float] = Field(None, json_schema_extra={"example": 75.5})
    hssc_percentage: Optional[float] = Field(None, json_schema_extra={"example": 68.0})
    hssc_group: Optional[str] = Field(None, json_schema_extra={"example": "Pre-Engineering"})
    mathematics_background: Optional[bool] = Field(None, json_schema_extra={"example": True})
    preferred_field: str = Field(..., json_schema_extra={"example": "Computer Science"})
    financial_need_status: bool = Field(default=False)

class EligibilityResult(BaseModel):
    program_id: str
    program_name: str
    university_id: str
    eligibility_status: str  # "Eligible", "Not eligible", or "Cannot determine"
    reasoning: List[str]

class RoadmapRequest(BaseModel):
    profile: StudentProfile
    results: List[EligibilityResult]


# -----------------------------------------------------------------------------
# 3. GET ENDPOINTS (Serving the Raw Datasets)
# -----------------------------------------------------------------------------
@app.get("/api/universities", tags=["Dataset"])
def get_universities():
    return {"status": "success", "data": universities_db}

@app.get("/api/programs", tags=["Dataset"])
def get_programs():
    return {"status": "success", "data": programs_db}

@app.get("/api/careers", tags=["Dataset"])
def get_careers():
    return {"status": "success", "data": careers_db}

@app.get("/api/scholarships", tags=["Dataset"])
def get_scholarships():
    return {"status": "success", "data": scholarships_db}


# -----------------------------------------------------------------------------
# 4. RULE ENGINE & AI ENDPOINTS (POST Endpoints)
# -----------------------------------------------------------------------------
@app.post("/api/eligibility", response_model=List[EligibilityResult], tags=["Rule Engine"])
def check_eligibility(profile: StudentProfile):
    """
    Evaluates student profile against program rules dynamically, 
    supporting both legacy and expanded seed dataset schemas.
    """
    results = []
    
    # Filter programs matching the preferred field
    target_programs = [p for p in programs_db if p.get("field") == profile.preferred_field]
    
    if not target_programs:
        return []

    for program in target_programs:
        program_name = program.get("name", "Unknown Program")
        program_id = program.get("id") or program.get("program_id", "Unknown ID")
        university_id = program.get("university_id", "Unknown Uni")
        
        # Support both 'eligibility' and 'eligibility_rules' keys
        rules = program.get("eligibility") or program.get("eligibility_rules") or {}
        
        if not rules:
            results.append(EligibilityResult(
                program_id=program_id,
                program_name=program_name,
                university_id=university_id,
                eligibility_status="Cannot determine from current dataset",
                reasoning=["Eligibility rules are not populated in the current dataset."]
            ))
            continue
            
        is_eligible = True
        reasons = []

        # 1. Check Mathematics Requirement
        req_math = rules.get("mathematics_required")
        if req_math is not None:
            if req_math and not profile.mathematics_background:
                is_eligible = False
                reasons.append("Mathematics requirement not satisfied.")
            else:
                reasons.append("Meets mathematics requirement.")

        # 2. Check HSSC Minimum Percentage
        min_hssc = rules.get("minimum_hssc_percent") if "minimum_hssc_percent" in rules else rules.get("min_hssc_percentage")
        if min_hssc is not None:
            if profile.hssc_percentage is None:
                is_eligible = False
                reasons.append("Student HSSC percentage not provided.")
            elif profile.hssc_percentage < min_hssc:
                is_eligible = False
                reasons.append(f"HSSC percentage ({profile.hssc_percentage}%) is below the required minimum ({min_hssc}%).")
            else:
                reasons.append(f"Meets stated HSSC percentage requirement ({min_hssc}%).")

        # 3. Check SSC Minimum Percentage
        min_ssc = rules.get("minimum_ssc_percent") if "minimum_ssc_percent" in rules else rules.get("min_ssc_percentage")
        if min_ssc is not None:
            if profile.ssc_percentage is None:
                is_eligible = False
                reasons.append("Student SSC percentage not provided.")
            elif profile.ssc_percentage < min_ssc:
                is_eligible = False
                reasons.append(f"SSC percentage ({profile.ssc_percentage}%) is below the required minimum ({min_ssc}%).")
            else:
                reasons.append(f"Meets stated SSC percentage requirement ({min_ssc}%).")

        # 4. Check HSSC Accepted Groups
        req_groups = rules.get("hssc_groups") or rules.get("required_hssc_groups")
        if req_groups:
            # Match directly or map common equivalents (e.g., ICS -> Computer Science)
            group_match = (
                profile.hssc_group in req_groups or
                (profile.hssc_group == "ICS" and "Computer Science" in req_groups)
            )
            if not group_match:
                is_eligible = False
                reasons.append(f"HSSC group '{profile.hssc_group}' is not listed in accepted groups: {', '.join(req_groups)}.")
            else:
                reasons.append("Meets HSSC group requirement.")

        # 5. Include dataset notes if present
        dataset_note = rules.get("notes") or rules.get("note")
        if dataset_note:
            reasons.append(f"Dataset Note: {dataset_note}")

        status_string = "Eligible based on available data" if is_eligible else "Not eligible based on available data"

        results.append(EligibilityResult(
            program_id=program_id,
            program_name=program_name,
            university_id=university_id,
            eligibility_status=status_string,
            reasoning=reasons
        ))

    return results

@app.post("/api/roadmap", tags=["AI"])
def generate_roadmap(req: RoadmapRequest):
    """
    Passes deterministic rule output to Groq API (Llama 3.1) to construct grounded explanation & roadmap.
    """
    target_careers = [c for c in careers_db if req.profile.preferred_field in c.get("related_fields", [])]
    
    system_instruction = """
    You are the AI assistant for PathPilot AI.
    You must use ONLY the structured data supplied to you below. The supplied dataset is the source of truth.
    Never invent or assume: universities, programs, scholarships, admission requirements, fees, accreditation, rankings, or salaries.
    If information is not present, explicitly say: "That information is not available in the current dataset."
    Distinguish between factual information directly contained in the dataset and reasoning based on the user's profile.
    
    CRITICAL FORMATTING RULES:
    1. STRICTLY PROHIBITED: You must NEVER generate a markdown table (e.g., no `|---|---|`). 
    2. ALWAYS use standard bullet points (`- `) to list data.
    3. Keep paragraphs short and punchy.
    """
    
    user_context = f"""
    STUDENT PROFILE:
    Name: {req.profile.name}
    Field: {req.profile.preferred_field}
    
    ELIGIBLE PROGRAMS (Determined by rule engine):
    {json.dumps([r.model_dump() for r in req.results if "Eligible" in r.eligibility_status], indent=2)}
    
    CAREER MATCHES FROM DATASET:
    {json.dumps(target_careers, indent=2)}
    
    Based on this data, provide:
    1. A brief explanation of their best career matches from the dataset. (Format as bullet points).
    2. A summary of the programs they are eligible for. (Format strictly as a bulleted list, for example: "- **Program Name (University)**: Reasoning". DO NOT USE A TABLE).
    3. A short, personalized learning roadmap focusing ONLY on the 'relevant_skills' listed in the career dataset. (Format using headings and bullet points).
    """
    
    user_context = f"""
    STUDENT PROFILE:
    Name: {req.profile.name}
    Field: {req.profile.preferred_field}
    
    ELIGIBLE PROGRAMS (Determined by rule engine):
    {json.dumps([r.model_dump() for r in req.results if "Eligible" in r.eligibility_status], indent=2)}
    
    CAREER MATCHES FROM DATASET:
    {json.dumps(target_careers, indent=2)}
    
    Based on this data, provide:
    1. A brief explanation of their best career matches from the dataset.
    2. A summary of the programs they are eligible for.
    3. A short, personalized learning roadmap focusing ONLY on the 'relevant_skills' listed in the career dataset.
    """
    
    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_context}
            ],
            # Updated to the current active Groq model
            model="openai/gpt-oss-120b",
            temperature=0.3, # Keeps the AI grounded and less creative
        )
        return {"roadmap": response.choices[0].message.content}
    except Exception as e:
        import traceback
        print("\n" + "="*50)
        print("❌ GROQ API ERROR ❌")
        traceback.print_exc()
        print("="*50 + "\n")
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------------------------------------------------
# Application Execution Setup
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        
    uvicorn.run(app, host="127.0.0.1", port=8000)