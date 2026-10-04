import os
import json
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from dependencies import orchestrator

router = APIRouter(prefix="/api/counselor", tags=["AI Career Counselor"])

class ChatRequest(BaseModel):
    profile: Optional[Dict[str, Any]] = None
    query: str

@router.post("/chat")
def counselor_chat(req: ChatRequest):
    profile_data = req.profile or {}
    
    # 1. Run the Agentic Orchestrator loop to gather verified tool outputs
    agent_output = orchestrator.agent_decide_and_execute(profile_data, req.query)
    executed_actions = agent_output.get("executed_actions", [])
    agent_context = agent_output.get("context", {})
    
    profile_str = json.dumps(profile_data, indent=2)
    context_str = json.dumps(agent_context, indent=2)
    
    # PRD Rule 21 & Strict Grounding System Prompt
    system_prompt = """
You are the Agentic AI Career Counselor for EduPath AI[cite: 21].
You help the student explore careers, program eligibility, and roadmaps using verified tool results and structured datasets[cite: 21].
The deterministic tool outputs and dataset are the absolute source of truth[cite: 21].

Never invent or assume:
- universities
- programs
- scholarships
- admission requirements
- fees
- accreditation
- recognition
- deadlines
- rankings
- salaries
- employment statistics[cite: 21]

If information is not available in the tool results or dataset, state:
"That information is not available in the current dataset."[cite: 21]
"""

    query_lower = req.query.lower()
    if any(term in query_lower for term in ["salary", "earn", "pay", "ranking", "best university", "job guarantee"]):
        return {"response": "That information is not available in the current dataset."}

    try:
        from google import genai
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            client = genai.Client(api_key=api_key)
            prompt = f"""
{system_prompt}

Student Profile:
{profile_str}

Agent Executed Actions: {executed_actions}
Deterministic Tool Results (Source of Truth):
{context_str}

Student Query: {req.query}
"""
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            return {"response": response.text}
    except Exception as e:
        print(f"LLM integration warning: {e}")

    # Grounded fallback response incorporating agent context
    user_name = profile_data.get("name", "Student")
    field = profile_data.get("preferred_field", "Computer Science")
    roadmap_summary = agent_context.get("roadmap", "Review your personalized options above.")
    
    fallback_text = f"""
Hello **{user_name}**! Based on your profile in **{field}**, I executed our deterministic tools (**Actions: {', '.join(executed_actions)}**)[cite: 22, 24, 25].

{roadmap_summary}
"""
    return {"response": fallback_text.strip()}