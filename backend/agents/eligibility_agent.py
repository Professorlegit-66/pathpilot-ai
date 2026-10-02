import json
import os

class EligibilityAgent:
    def __init__(self, data_dir="data"):
        self.data_dir = data_dir
        self.programs_db = self._load_json("programs.json")

    def _load_json(self, filename):
        filepath = os.path.join(self.data_dir, filename)
        if not os.path.exists(filepath):
            return []
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)

    def evaluate(self, profile: dict) -> list:
        results = []
        preferred_field = profile.get("preferred_field", "Computer Science")
        target_programs = [p for p in self.programs_db if p.get("field") == preferred_field]
        
        if not target_programs:
            return []

        for program in target_programs:
            program_name = program.get("name", "Unknown Program")
            program_id = program.get("id") or program.get("program_id", "Unknown ID")
            university_id = program.get("university_id", "Unknown Uni")
            
            rules = program.get("eligibility") or program.get("eligibility_rules") or {}
            
            if not rules:
                results.append({
                    "program_id": program_id,
                    "program_name": program_name,
                    "university_id": university_id,
                    "eligibility_status": "Cannot determine from current dataset",
                    "reasoning": ["Eligibility rules are not populated in the current dataset."]
                })
                continue
                
            is_eligible = True
            reasons = []

            # 1. Check Mathematics Requirement
            req_math = rules.get("mathematics_required")
            if req_math is not None:
                has_math = profile.get("mathematics_background", True)
                if req_math and not has_math:
                    is_eligible = False
                    reasons.append("Mathematics requirement not satisfied.")
                else:
                    reasons.append("Meets mathematics requirement.")

            # 2. Check HSSC Minimum Percentage
            min_hssc = rules.get("minimum_hssc_percent") if "minimum_hssc_percent" in rules else rules.get("min_hssc_percentage")
            if min_hssc is not None:
                hssc_pct = profile.get("hssc_percentage")
                if hssc_pct is None:
                    is_eligible = False
                    reasons.append("Student HSSC percentage not provided.")
                elif hssc_pct < min_hssc:
                    is_eligible = False
                    reasons.append(f"HSSC percentage ({hssc_pct}%) is below required minimum ({min_hssc}%).")
                else:
                    reasons.append(f"Meets stated HSSC percentage requirement ({min_hssc}%).")

            # 3. Check SSC Minimum Percentage
            min_ssc = rules.get("minimum_ssc_percent") if "minimum_ssc_percent" in rules else rules.get("min_ssc_percentage")
            if min_ssc is not None:
                ssc_pct = profile.get("ssc_percentage")
                if ssc_pct is None:
                    is_eligible = False
                    reasons.append("Student SSC percentage not provided.")
                elif ssc_pct < min_ssc:
                    is_eligible = False
                    reasons.append(f"SSC percentage ({ssc_pct}%) is below required minimum ({min_ssc}%).")
                else:
                    reasons.append(f"Meets stated SSC percentage requirement ({min_ssc}%).")

            # 4. Check HSSC Accepted Groups
            req_groups = rules.get("hssc_groups") or rules.get("required_hssc_groups")
            if req_groups:
                hssc_group = profile.get("hssc_group", "Pre-Engineering")
                group_match = (
                    hssc_group in req_groups or
                    (hssc_group == "ICS" and "Computer Science" in req_groups)
                )
                if not group_match:
                    is_eligible = False
                    reasons.append(f"HSSC group '{hssc_group}' is not listed in accepted groups: {', '.join(req_groups)}.")
                else:
                    reasons.append("Meets HSSC group requirement.")

            status_string = "Eligible based on available data" if is_eligible else "Not eligible based on available data"

            results.append({
                "program_id": program_id,
                "program_name": program_name,
                "university_id": university_id,
                "eligibility_status": status_string,
                "reasoning": reasons
            })

        return results