from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import os
from dotenv import load_dotenv
from agents.orchestrator import AIOrchestrator

# Load environment variables
load_dotenv()

app = FastAPI(
    title="PathPilot AI Multi-Agent Backend",
    description="Multi-agent MVP for education and career guidance using verified datasets.",
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

# Initialize Multi-Agent Orchestrator
orchestrator = AIOrchestrator()

# -----------------------------------------------------------------------------
# PYDANTIC MODELS (Data Validation)
# -----------------------------------------------------------------------------
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

class EligibilityResult(BaseModel):
    program_id: str
    program_name: str
    university_id: str
    eligibility_status: str
    reasoning: List[str]

class RoadmapRequest(BaseModel):
    profile: StudentProfile
    results: List[EligibilityResult]


# -----------------------------------------------------------------------------
# API ENDPOINTS (Delegating to Multi-Agent System)
# -----------------------------------------------------------------------------
@app.post("/api/eligibility", response_model=List[EligibilityResult], tags=["Multi-Agent Rule Engine"])
def evaluate_eligibility(profile: StudentProfile):
    """
    Delegates evaluation to the Eligibility Agent.
    """
    try:
        results = orchestrator.eligibility_agent.evaluate(profile.dict())
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/roadmap", tags=["Multi-Agent AI Workflow"])
def generate_ai_roadmap(data: dict):
    """
    Triggers the full multi-agent orchestrator pipeline (Career Agent -> Eligibility Agent -> Roadmap Agent -> Groq LLM).
    """
    try:
        profile = data.get("profile", {})
        results = data.get("results", [])
        
        workflow_output = orchestrator.run_workflow(profile, results)
        return {"roadmap": workflow_output["roadmap"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/careers", tags=["Dataset"])
def get_careers():
    return {"status": "success", "data": orchestrator.career_agent.get_careers()}

@app.get("/api/universities", tags=["Dataset"])
def get_universities():
    return {"status": "success", "data": orchestrator.get_universities()}


# -----------------------------------------------------------------------------
# Application Execution Setup
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)