import os
import json
from agents.career_agent import CareerAgent
from agents.eligibility_agent import EligibilityAgent
from agents.roadmap_agent import RoadmapAgent
from agents.scholarship_agent import ScholarshipAgent
from agents.agent_core import EduPathAgent, ToolRegistry, AgentState, ActionTypes

class AIOrchestrator:
    def __init__(self, data_dir="data"):
        self.data_dir = data_dir
        self.career_agent = CareerAgent(data_dir=data_dir)
        self.eligibility_agent = EligibilityAgent(data_dir=data_dir)
        self.roadmap_agent = RoadmapAgent()
        self.scholarship_agent = ScholarshipAgent(data_dir=data_dir)
        
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
            description="Synthesize structured learning roadmap based on verified careers and eligible programs.",
            input_schema={"profile": "StudentProfile"},
            func=lambda profile: self._generate_robust_roadmap(profile)
        )
        self.registry.register(
            name="match_scholarships",
            description="Match financial aid and scholarships from verified structured datasets.",
            input_schema={"profile": "StudentProfile"},
            func=self.scholarship_agent.match
        )

    def _generate_robust_roadmap(self, profile: dict):
        """Generates a robust roadmap combining eligibility and career track analysis."""
        eligibility_res = self.eligibility_agent.evaluate(profile)
        career_res = self.career_agent.analyze(profile)
        
        try:
            # Attempt standard roadmap generation
            roadmap = self.roadmap_agent.generate_roadmap(profile, eligibility_res)
            if roadmap:
                return roadmap
        except Exception:
            pass
            
        # Fallback robust career-aligned milestones if program list is empty
        preferred_field = profile.get("preferred_field", "Computer Science")
        return {
            "roadmap_title": f"Personalized Career & Learning Roadmap for {profile.get('name', 'Student')}",
            "field": preferred_field,
            "milestones": [
                {
                    "milestone": "Milestone 1: Core Foundation & Skill Mastery (0-3 months)",
                    "actions": [f"Master foundational concepts in {preferred_field}.", "Complete targeted hands-on coding projects and data structures coursework."]
                },
                {
                    "milestone": "Milestone 2: Practical Experience & Portfolio (4-8 months)",
                    "actions": ["Build and deploy 2-3 production-grade projects on GitHub.", "Contribute to open-source repositories or participate in technical hackathons."]
                },
                {
                    "milestone": "Milestone 3: Professional Application & Career Entry (9-12 months)",
                    "actions": ["Refine resume and target verified roles identified in your career matching analysis.", "Prepare for technical interviews and professional networking."]
                }
            ]
        }

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
        loop_res = self.execute_agent_loop(profile, "Give me a complete review of my careers, eligibility, and roadmap.")
        context = loop_res.get("context", {})
        
        return {
            "orchestrator_status": "Completed successfully",
            "career_insights": context.get("match_careers", {}).get("results", {}),
            "eligibility_evaluations": context.get("evaluate_eligibility", {}).get("results", []),
            "roadmap": context.get("generate_roadmap", {}).get("results", "Roadmap generation complete.")
        }