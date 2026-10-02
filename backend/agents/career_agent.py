import json
import os

class CareerAgent:
    def __init__(self, data_dir="data"):
        self.data_dir = data_dir
        self.careers_db = self._load_json("careers.json")

    def _load_json(self, filename):
        filepath = os.path.join(self.data_dir, filename)
        if not os.path.exists(filepath):
            return []
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)

    def analyze(self, profile: dict) -> dict:
        field = profile.get("preferred_field", "Computer Science")
        target_careers = [c for c in self.careers_db if field in c.get("related_fields", [])]
        
        return {
            "agent": "CareerAgent",
            "status": "Success",
            "recommended_careers": target_careers if target_careers else self.careers_db,
            "reasoning": f"Analyzed student background in {profile.get('country', 'Pakistan')} targeting {field} and matched with verified industry roles."
        }

    def get_careers(self):
        return self.careers_db