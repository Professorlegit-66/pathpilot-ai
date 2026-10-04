from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from dependencies import orchestrator

router = APIRouter(prefix="/api/agent", tags=["Agentic AI Layer"])

class AgentChatRequest(BaseModel):
    message: str
    profile: Optional[Dict[str, Any]] = Field(default_factory=dict)
    conversation_id: str = "default_conv"

@router.post("/chat")
def agent_chat(payload: AgentChatRequest):
    try:
        # Run the formal agent execution loop
        agent_output = orchestrator.execute_agent_loop(
            profile=payload.profile or {},
            message=payload.message,
            conversation_id=payload.conversation_id
        )
        
        # Synthesize a clean response summary for the user
        actions = agent_output.get("actions", [])
        context = agent_output.get("context", {})
        
        response_text = f"Analyzed your request successfully using deterministic tools: ({', '.join(actions) or 'Direct Verification'})."
        
        if "generate_roadmap" in context:
            roadmap_res = context["generate_roadmap"].get("results")
            if isinstance(roadmap_res, str):
                response_text = roadmap_res

        return {
            "response": response_text,
            "conversation_id": agent_output.get("conversation_id"),
            "agent_status": agent_output.get("agent_status"),
            "actions": actions,
            "context": context
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent execution failed: {str(e)}")