import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class RoadmapAgent:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def generate_roadmap(self, profile: dict, eligibility_results: list = None) -> str:
        eligibility_results = eligibility_results or []
        system_instruction = """
        You are the AI Roadmap Agent for PathPilot AI.
        You help students build professional, structured learning and career roadmaps based on their profile and verified career tracks.
        The supplied profile and tool results are your source of truth.
        
        CRITICAL FORMATTING & PRONOUN RULES:
        1. STRICTLY PROHIBITED: NEVER generate markdown tables (no `|---|---|`).
        2. ALWAYS use standard bullet points (`- `).
        3. Keep paragraphs concise, professional, and actionable.
        4. Provide clear milestones (Foundation, Practical Experience, Professional Application) tailored to the student's preferred field.
        5. ALWAYS address the student directly in the second person ("you", "your"). Never use third-person pronouns (such as "he", "his", "him") or refer to the student by name in the narrative response. Speak directly to them as "you".
        """
        
        eligible_programs = [r for r in eligibility_results if "Eligible" in r.get("eligibility_status", "")]

        user_context = f"""
        STUDENT PROFILE:
        Location: {profile.get('city')}, {profile.get('region')}, {profile.get('country')}
        Field: {profile.get('preferred_field', 'Computer Science')}
        
        VERIFIED ELIGIBLE PROGRAMS:
        {json.dumps(eligible_programs, indent=2) if eligible_programs else "No specific institutional programs currently matched strict threshold criteria; focus roadmap on core skill acquisition and career competency milestones."}
        
        Based on this data, generate:
        1. A brief explanation of career alignment based on their preferred field, written entirely in the second person ("you", "your").
        2. A structured, milestone-based learning roadmap with actionable steps (using bullet points), addressed directly to the student.
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