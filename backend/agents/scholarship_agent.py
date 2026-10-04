import json
import os

class ScholarshipAgent:
    def __init__(self, data_dir="data"):
        self.data_dir = data_dir
        self.scholarships_db = self._load_json("scholarships.json")

    def _load_json(self, filename):
        filepath = os.path.join(self.data_dir, filename)
        if not os.path.exists(filepath):
            return []
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)

    def match(self, profile: dict) -> dict:
        results = []
        student_country = profile.get("country", "Unknown").strip()
        hssc_pct = profile.get("hssc_percentage", 0)
        gpa = profile.get("gpa_score", 0.0)
        
        for sch in self.scholarships_db:
            # Regional filter: Must match eligible countries
            if student_country not in sch.get("eligible_countries", []):
                continue
                
            # Logic formulation for the frontend UI
            logic_reasons = [f"Matches regional requirement ({student_country})."]
            
            sch_type = sch.get("type", "")
            if "Merit" in sch_type:
                if hssc_pct > 80 or gpa > 3.5:
                    logic_reasons.append("Strong candidate based on high academic merit.")
                else:
                    logic_reasons.append("Merit criteria applies; competitive academic evaluation required.")
                    
            if "Need-Based" in sch_type:
                logic_reasons.append("Requires submission of official financial need documentation.")
            
            # Clean university name extraction for the UI Vault
            raw_name = sch.get("name", "")
            uni_name = raw_name.split(" Need-Based")[0].split(" Institutional")[0].split(" Undergraduate")[0]
                
            results.append({
                "scholarship_id": sch.get("scholarship_id"),
                "university_id": sch.get("university_id"),
                "university_name": uni_name,
                "name": raw_name,
                "type": sch_type,
                "coverage": sch.get("coverage"),
                "eligibility_logic": " ".join(logic_reasons)
            })
            
        return {"results": results}