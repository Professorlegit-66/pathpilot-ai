import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class RoadmapAgent:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def generate_roadmap(self, profile: dict, eligibility_results: list) -> str:
        system_instruction = """
        You are the AI Roadmap Agent for PathPilot AI.
        You must use ONLY the structured data supplied to you below. The supplied dataset is the source of truth.
        Never invent or assume universities, programs, scholarships, admission requirements, or fees.
        If information is not present, explicitly state what is missing.
        
        CRITICAL FORMATTING RULES:
        1. STRICTLY PROHIBITED: NEVER generate markdown tables (no `|---|---|`).
        2. ALWAYS use standard bullet points (`- `).
        3. Keep paragraphs concise and professional.
        """
        
        eligible_programs = [r for r in eligibility_results if "Eligible" in r.get("eligibility_status", "")]

        user_context = f"""
        STUDENT PROFILE:
        Name: {profile.get('name', 'Student')}
        Location: {profile.get('city')}, {profile.get('region')}, {profile.get('country')}
        Field: {profile.get('preferred_field')}
        
        ELIGIBLE PROGRAMS (Determined by Eligibility Agent):
        {json.dumps(eligible_programs, indent=2)}
        
        Based on this data, generate:
        1. A brief explanation of career alignment based on their field.
        2. A summary of the programs they are eligible for using bullet points.
        3. A short, personalized learning roadmap with clear milestones.
        """

        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_context}
                ],
                model="openai/gpt-oss-120b",
                temperature=0.3,
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Failed to synthesize AI roadmap via Groq API: {str(e)}"