import os
import json
from agents.career_agent import CareerAgent
from agents.eligibility_agent import EligibilityAgent
from agents.roadmap_agent import RoadmapAgent

class AIOrchestrator:
    def __init__(self, data_dir="data"):
        self.data_dir = data_dir
        self.career_agent = CareerAgent(data_dir=data_dir)
        self.eligibility_agent = EligibilityAgent(data_dir=data_dir)
        self.roadmap_agent = RoadmapAgent()
        
        # Tool registry mapping deterministic capabilities
        self.tool_registry = {
            "match_careers": {
                "description": "Find careers matching student preferred field and profile.",
                "func": self.career_agent.analyze
            },
            "evaluate_eligibility": {
                "description": "Evaluate deterministic program eligibility rules against student academic metrics.",
                "func": self.eligibility_agent.evaluate
            },
            "generate_roadmap": {
                "description": "Synthesize a structured learning roadmap using verified eligible programs.",
                "func": lambda profile: self.roadmap_agent.generate_roadmap(profile, self.eligibility_agent.evaluate(profile))
            }
        }

    def _load_json(self, filename):
        filepath = os.path.join(self.data_dir, filename)
        if not os.path.exists(filepath):
            return []
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)

    def get_universities(self):
        return self._load_json("universities.json")

    def agent_decide_and_execute(self, profile: dict, user_goal: str) -> dict:
        """
        Agentic Loop: Analyzes student goal/query, dynamically selects required tools, 
        executes them, and returns structured grounded context.
        """
        goal_lower = user_goal.lower()
        executed_actions = []
        tool_results = {}

        print(f"[Agentic Orchestrator] Analyzing goal for: {profile.get('name')} | Query: '{user_goal}'")

        # Dynamic Tool Selection based on intent
        needs_career = any(k in goal_lower for k in ["career", "job", "field", "work", "role"])
        needs_eligibility = any(k in goal_lower for k in ["eligib", "admission", "qualify", "program", "score", "percentage"])
        needs_roadmap = any(k in goal_lower for k in ["roadmap", "plan", "study", "complete", "step", "future"])

        # If intent is general or multifaceted, execute comprehensive tool workflow
        if not (needs_career or needs_eligibility or needs_roadmap):
            needs_career = needs_eligibility = needs_roadmap = True

        # Execute selected tools dynamically
        if needs_career:
            tool_results["career_analysis"] = self.tool_registry["match_careers"]["func"](profile)
            executed_actions.append("match_careers")

        if needs_eligibility:
            tool_results["eligibility_evaluations"] = self.tool_registry["evaluate_eligibility"]["func"](profile)
            executed_actions.append("evaluate_eligibility")

        if needs_roadmap:
            tool_results["roadmap"] = self.tool_registry["generate_roadmap"]["func"](profile)
            executed_actions.append("generate_roadmap")

        return {
            "orchestrator_status": "Completed successfully via dynamic agent loop",
            "executed_actions": executed_actions,
            "context": tool_results
        }

    def run_workflow(self, profile: dict, eligibility_results: list = None) -> dict:
        """
        Backward-compatible wrapper maintaining your existing pipeline signature.
        """
        return self.agent_decide_and_execute(profile, "Give me a complete review of my careers, eligibility, and roadmap.")