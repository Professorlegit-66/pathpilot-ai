from agents.career_agent import CareerAgent
from agents.eligibility_agent import EligibilityAgent
from agents.roadmap_agent import RoadmapAgent
from agents.career_counselor_agent import CareerCounselorAgent # Add import

class AIOrchestrator:
    def __init__(self, data_dir="data"):
        self.data_dir = data_dir
        self.career_agent = CareerAgent(data_dir=data_dir)
        self.eligibility_agent = EligibilityAgent(data_dir=data_dir)
        self.roadmap_agent = RoadmapAgent()
        self.counselor_agent = CareerCounselorAgent(data_dir=data_dir)

    def _load_json(self, filename):
        filepath = os.path.join(self.data_dir, filename)
        if not os.path.exists(filepath):
            return []
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)

    def get_universities(self):
        return self._load_json("universities.json")

    def run_workflow(self, profile: dict, eligibility_results: list = None) -> dict:
        print(f"[AI Orchestrator] Executing multi-agent pipeline for: {profile.get('name')}")
        
        # Step 1: Career Agent analysis
        career_analysis = self.career_agent.analyze(profile)
        
        # Step 2: Ensure eligibility results are evaluated if not provided
        if not eligibility_results:
            eligibility_results = self.eligibility_agent.evaluate(profile)
        
        # Step 3: Roadmap Agent synthesis via Groq
        roadmap_text = self.roadmap_agent.generate_roadmap(profile, eligibility_results)
        
        return {
            "orchestrator_status": "Completed successfully",
            "career_insights": career_analysis,
            "eligibility_evaluations": eligibility_results,
            "roadmap": roadmap_text
        }