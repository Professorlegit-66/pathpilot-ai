from fastapi import APIRouter, HTTPException
from typing import List
from schemas import StudentProfile, EligibilityResult, CounselorRequest
from dependencies import orchestrator

router = APIRouter(prefix="/api", tags=["Multi-Agent Workflow"])

@router.post("/eligibility", response_model=List[EligibilityResult])
def evaluate_eligibility(profile: StudentProfile):
    try:
        results = orchestrator.eligibility_agent.evaluate(profile.dict())
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/roadmap")
def generate_ai_roadmap(data: dict):
    try:
        profile = data.get("profile", {})
        results = data.get("results", [])
        
        workflow_output = orchestrator.run_workflow(profile, results)
        return {"roadmap": workflow_output["roadmap"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/counselor/chat")
def career_counselor_chat(req: CounselorRequest):
    try:
        advice = orchestrator.counselor_agent.get_advice(req.profile.dict(), req.query)
        return {"response": advice}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))