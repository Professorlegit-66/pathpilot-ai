import os
import json
import traceback
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from dependencies import orchestrator

load_dotenv()

router = APIRouter(prefix="/api/counselor", tags=["AI Career Counselor"])

class ChatRequest(BaseModel):
    profile: Optional[Dict[str, Any]] = None
    query: str
    conversation_id: Optional[str] = "default_conv"

@router.post("/chat")
def counselor_chat(req: ChatRequest):
    profile_data = req.profile or {}
    query_lower = req.query.lower()
    
    # Run the formal Agentic Orchestrator loop using the tool registry
    agent_output = orchestrator.execute_agent_loop(
        profile=profile_data,
        message=req.query,
        conversation_id=req.conversation_id or "default_conv"
    )
    
    executed_actions = agent_output.get("actions", [])
    agent_context = agent_output.get("context", {})
    
    # --- DIRECT DETERMINISTIC RENDERER FOR ROADMAPS & CAREERS ---
    if any(term in query_lower for term in ["roadmap", "plan", "complete", "milestone"]):
        roadmap_data = agent_context.get("generate_roadmap", {})
        res = roadmap_data.get("results", roadmap_data) if isinstance(roadmap_data, dict) else roadmap_data
        
        if isinstance(res, dict) and "milestones" in res:
            lines = [f"## {res.get('roadmap_title', 'Personalized Career & Learning Roadmap')}"]
            lines.append(f"**Target Field**: {res.get('field', profile_data.get('preferred_field', 'Software Engineering'))}\n")
            for m in res.get("milestones", []):
                lines.append(f"### {m.get('milestone', 'Milestone')}")
                for action in m.get("actions", []):
                    lines.append(f"- {action}")
                lines.append("")
            return {"response": "\n".join(lines)}
        elif isinstance(res, str) and len(res.strip()) > 0:
            return {"response": res}

    if any(term in query_lower for term in ["career", "match"]):
        career_data = agent_context.get("match_careers", {})
        res = career_data.get("results", career_data) if isinstance(career_data, dict) else career_data
        if isinstance(res, dict) and "results" in res:
            careers = res["results"]
            lines = [f"## Recommended Careers for {profile_data.get('name', 'Student')}\n"]
            for c in careers:
                lines.append(f"- **{c.get('title')}** ({c.get('field_category')}): {c.get('description')}")
            return {"response": "\n".join(lines)}

    # Fallback to Groq for general queries
    profile_str = json.dumps(profile_data, indent=2)
    tool_summaries = []
    for tool_name, tool_data in agent_context.items():
        results = tool_data.get("results", tool_data) if isinstance(tool_data, dict) else tool_data
        if isinstance(results, str):
            tool_summaries.append(f"### Tool Execution [{tool_name}]\n{results}")
        else:
            tool_summaries.append(f"### Tool Execution [{tool_name}]\n{json.dumps(results, indent=2)}")
    
    combined_tool_text = "\n\n".join(tool_summaries) if tool_summaries else "No tools executed."

    system_prompt = """
You are the Agentic AI Career Counselor for EduPath AI.
You help the student explore careers, program eligibility, scholarships, and roadmaps using verified tool results and structured datasets.
The deterministic tool outputs and dataset are the absolute source of truth.
CRITICAL: Do NOT greet the user, do not say "Hello", and do not use introductory filler. Get straight to the requested guidance.
"""

    try:
        from groq import Groq
        api_key = os.getenv("GROQ_API_KEY")
        if api_key:
            client = Groq(api_key=api_key)
            completion = client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Student Profile:\n{profile_str}\n\nTool Results:\n{combined_tool_text}\n\nQuery: {req.query}"}
                ]
            )
            return {"response": completion.choices[0].message.content}
    except Exception as e:
        print("❌ Groq API Exception Caught:")
        traceback.print_exc()

    return {"response": "That information is not available in the current dataset."}