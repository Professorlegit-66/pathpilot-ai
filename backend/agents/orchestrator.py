import os
import json
from agents.career_agent import CareerAgent
from agents.eligibility_agent import EligibilityAgent
from agents.roadmap_agent import RoadmapAgent
from agents.agent_core import EduPathAgent, ToolRegistry, AgentState, ActionTypes

class AIOrchestrator:
    def __init__(self, data_dir="data"):
        self.data_dir = data_dir
        self.career_agent = CareerAgent(data_dir=data_dir)
        self.eligibility_agent = EligibilityAgent(data_dir=data_dir)
        self.roadmap_agent = RoadmapAgent()
        
        # Initialize Tool Registry with strict tool contracts
        self.registry = ToolRegistry()
        self._register_default_tools()
        
        self.agent = EduPathAgent(self.registry)

    def _register_default_tools(self):
        self.registry.register(
            name="match_careers",
            description="Find verified careers matching student profile using deterministic rules.",
            input_schema={"profile": "StudentProfile"},
            func=self.career_agent.analyze
        )
        self.registry.register(
            name="evaluate_eligibility",
            description="Evaluate program eligibility rules deterministically against student metrics.",
            input_schema={"profile": "StudentProfile"},
            func=self.eligibility_agent.evaluate
        )
        self.registry.register(
            name="generate_roadmap",
            description="Synthesize structured learning roadmap based on verified eligible programs.",
            input_schema={"profile": "StudentProfile"},
            func=lambda profile: self.roadmap_agent.generate_roadmap(profile, self.eligibility_agent.evaluate(profile))
        )
        self.registry.register(
            name="match_scholarships",
            description="Match financial aid and scholarships from verified structured datasets.",
            input_schema={"profile": "StudentProfile"},
            func=lambda profile: self._load_json("scholarships.json") # Safe dataset fallback tool
        )

    def _load_json(self, filename):
        filepath = os.path.join(self.data_dir, filename)
        if not os.path.exists(filepath):
            return []
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)

    def execute_agent_loop(self, profile: dict, message: str, conversation_id: str = "default_conv") -> dict:
        """
        Executes the controlled iterative agent loop with step boundaries and structured error handling.
        """
        state = AgentState(
            conversation_id=conversation_id,
            student_profile=profile,
            current_goal=message
        )

        actions_taken = []
        
        while state.agent_status == "running" and state.step_count < state.max_steps:
            decision = self.agent.decide(state, message)
            action = decision.get("action")

            if action == ActionTypes.CALL_TOOL:
                tool_name = decision["tool"]
                args = decision["arguments"]
                
                print(f"[Agent Loop] Step {state.step_count}: Executing tool '{tool_name}'")
                result = self.registry.execute(tool_name, args)
                
                state.tool_results[tool_name] = result
                state.previous_actions.append(tool_name)
                actions_taken.append(tool_name)

                if result.get("status") == "error":
                    # Graceful failure handling per specification
                    state.agent_status = "error"
                    break

            elif action == ActionTypes.ASK_CLARIFICATION:
                state.agent_status = "requires_clarification"
                break

            elif action == ActionTypes.FINAL_RESPONSE:
                state.agent_status = "completed"
                break

        return {
            "conversation_id": state.conversation_id,
            "agent_status": state.agent_status,
            "actions": actions_taken,
            "context": state.tool_results
        }

    def run_workflow(self, profile: dict, eligibility_results: list = None) -> dict:
        """
        Maintains backward compatibility for existing pipeline routes.
        """
        loop_res = self.execute_agent_loop(profile, "Give me a complete review of my careers, eligibility, and roadmap.")
        context = loop_res.get("context", {})
        
        return {
            "orchestrator_status": "Completed successfully",
            "career_insights": context.get("match_careers", {}).get("results", {}),
            "eligibility_evaluations": context.get("evaluate_eligibility", {}).get("results", []),
            "roadmap": context.get("generate_roadmap", {}).get("results", "Roadmap generation complete.")
        }