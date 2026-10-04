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
        preferred_field = profile.get("preferred_field", "Computer Science").strip().lower()
        
        # Match by field_category or program name, or fallback to all programs if none match strictly
        target_programs = [
            p for p in self.programs_db 
            if preferred_field in p.get("field_category", "").strip().lower() or 
               preferred_field in p.get("program_name", "").strip().lower()
        ]
        
        if not target_programs:
            target_programs = self.programs_db  # Fallback to evaluate all available programs

        for program in target_programs:
            program_name = program.get("program_name", "Unknown Program")
            program_id = program.get("program_id", "Unknown ID")
            university_id = program.get("university_id", "Unknown Uni")
            
            is_eligible = True
            reasons = []

            # 1. Check Mathematics Requirement (min_math_percent)
            min_math = program.get("min_math_percent")
            if min_math is not None:
                if min_math > 4.0:  # Percentage-based threshold (e.g., Pakistan/India boards)
                    has_math = profile.get("mathematics_background", True)
                    if not has_math:
                        is_eligible = False
                        reasons.append("Mathematics background is required.")
                    else:
                        reasons.append(f"Meets mathematics prerequisite (Minimum requirement: {min_math}%).")
                else:  # GPA-based threshold (e.g., US institutions like CMU)
                    gpa = profile.get("gpa_score", 3.5)
                    if gpa < min_math:
                        is_eligible = False
                        reasons.append(f"GPA score ({gpa}) is below minimum requirement ({min_math}).")
                    else:
                        reasons.append(f"Meets minimum GPA requirement ({min_math}).")

            # 2. Check Overall Percentage / Academic Score (min_overall_percent)
            min_overall = program.get("min_overall_percent")
            if min_overall is not None:
                if min_overall > 4.0:  # Percentage-based
                    hssc_pct = profile.get("hssc_percentage")
                    if hssc_pct is None:
                        is_eligible = False
                        reasons.append("Student HSSC percentage not provided in profile.")
                    elif hssc_pct < min_overall:
                        is_eligible = False
                        reasons.append(f"HSSC percentage ({hssc_pct}%) is below the required minimum ({min_overall}%).")
                    else:
                        reasons.append(f"Meets minimum overall percentage requirement ({min_overall}%).")
                else:  # GPA-based
                    gpa = profile.get("gpa_score", 3.5)
                    if gpa < min_overall:
                        is_eligible = False
                        reasons.append(f"GPA score ({gpa}) is below minimum requirement ({min_overall}).")
                    else:
                        reasons.append(f"Meets minimum GPA requirement ({min_overall}).")

            # 3. Check Accepted Streams / Groups
            accepted_streams = program.get("accepted_streams", [])
            if accepted_streams and "General Track" not in accepted_streams and "STEM Focus" not in accepted_streams:
                hssc_group = profile.get("hssc_group", "Pre-Engineering")
                stream_match = any(
                    stream.lower() in hssc_group.lower() or hssc_group.lower() in stream.lower() 
                    for stream in accepted_streams
                )
                if not stream_match and hssc_group != "ICS":
                    if not (hssc_group == "ICS" and any("ics" in s.lower() or "computer" in s.lower() for s in accepted_streams)):
                        is_eligible = False
                        reasons.append(f"HSSC stream '{hssc_group}' is not explicitly listed in accepted streams: {', '.join(accepted_streams)}.")
                    else:
                        reasons.append("Meets accepted stream requirement.")
                else:
                    reasons.append("Meets accepted stream requirement.")
            else:
                reasons.append("Meets stream requirements.")

            status_string = "Eligible based on available data" if is_eligible else "Not eligible based on available data"

            results.append({
                "program_id": program_id,
                "program_name": program_name,
                "university_id": university_id,
                "eligibility_status": status_string,
                "reasoning": reasons
            })

        return results