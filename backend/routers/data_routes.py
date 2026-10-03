from fastapi import APIRouter
from dependencies import orchestrator

router = APIRouter(prefix="/api", tags=["Dataset"])

@router.get("/careers")
def get_careers():
    return {"status": "success", "data": orchestrator.career_agent.get_careers()}

@router.get("/universities")
def get_universities():
    return {"status": "success", "data": orchestrator.get_universities()}