import json
import logging
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("EduPathAgent")

# --- 1. Explicit Action Types ---
class ActionTypes:
    CALL_TOOL = "CALL_TOOL"
    ASK_CLARIFICATION = "ASK_CLARIFICATION"
    ANALYZE_RESULT = "ANALYZE_RESULT"
    FINAL_RESPONSE = "FINAL_RESPONSE"

# --- 2. Explicit Agent State ---
class AgentState(BaseModel):
    conversation_id: str
    student_profile: Dict[str, Any] = Field(default_factory=dict)
    current_goal: Optional[str] = None
    selected_career: Optional[Dict[str, Any]] = None
    selected_program: Optional[Dict[str, Any]] = None
    tool_results: Dict[str, Any] = Field(default_factory=dict)
    previous_actions: List[str] = Field(default_factory=list)
    agent_status: str = "running" # running, completed, requires_clarification, error
    requires_clarification: bool = False
    step_count: int = 0
    max_steps: int = 6

# --- 3. Tool Contract & Registry ---
class ToolRegistry:
    def __init__(self):
        self.tools = {}

    def register(self, name: str, description: str, input_schema: dict, func: callable):
        self.tools[name] = {
            "name": name,
            "description": description,
            "input_schema": input_schema,
            "func": func,
            "source": "deterministic_backend"
        }

    def execute(self, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        if name not in self.tools:
            return {
                "status": "error",
                "error_code": "TOOL_NOT_FOUND",
                "message": f"Tool '{name}' is not registered."
            }
        try:
            result = self.tools[name]["func"](**arguments)
            return {
                "status": "success",
                "results": result,
                "source": self.tools[name]["source"]
            }
        except Exception as e:
            logger.error(f"Tool execution failed for {name}: {str(e)}")
            return {
                "status": "error",
                "error_code": "TOOL_EXECUTION_FAILED",
                "message": f"The {name} tool encountered an error and is temporarily unavailable."
            }

# --- 4. The Agent Decision Loop ---
class EduPathAgent:
    def __init__(self, registry: ToolRegistry):
        self.registry = registry

    def decide(self, state: AgentState, user_message: str) -> Dict[str, Any]:
        """
        Determines the next action based on current state, user goal, and previous tool history.
        Enforces safeguards against infinite loops and missing data.
        """
        state.step_count += 1
        
        # Safeguard: Max steps reached
        if state.step_count > state.max_steps:
            return {
                "action": ActionTypes.FINAL_RESPONSE,
                "reason": "Maximum execution steps reached."
            }

        msg_lower = user_message.lower()

        # Goal Analysis & Tool Selection Logic
        if "career" in msg_lower and "match_careers" not in state.previous_actions:
            return {
                "action": ActionTypes.CALL_TOOL,
                "tool": "match_careers",
                "arguments": {"profile": state.student_profile}
            }

        if ("program" in msg_lower or "study" in msg_lower or "eligible" in msg_lower) and "evaluate_eligibility" not in state.previous_actions:
            return {
                "action": ActionTypes.CALL_TOOL,
                "tool": "evaluate_eligibility",
                "arguments": {"profile": state.student_profile}
            }

        if "scholarship" in msg_lower or "aid" in msg_lower:
            return {
                "action": ActionTypes.CALL_TOOL,
                "tool": "match_scholarships",
                "arguments": {"profile": state.student_profile}
            }

        if "roadmap" in msg_lower or "plan" in msg_lower or "complete" in msg_lower:
            # Multi-step requirement check
            if "match_careers" not in state.previous_actions:
                return {"action": ActionTypes.CALL_TOOL, "tool": "match_careers", "arguments": {"profile": state.student_profile}}
            if "evaluate_eligibility" not in state.previous_actions:
                return {"action": ActionTypes.CALL_TOOL, "tool": "evaluate_eligibility", "arguments": {"profile": state.student_profile}}
            if "generate_roadmap" not in state.previous_actions:
                return {"action": ActionTypes.CALL_TOOL, "tool": "generate_roadmap", "arguments": {"profile": state.student_profile}}

        return {
            "action": ActionTypes.FINAL_RESPONSE,
            "reason": "All required tool data collected and analyzed."
        }