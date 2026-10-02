import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class CareerCounselorAgent:
    def __init__(self, data_dir="data"):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.data_dir = data_dir
        self.careers_db = self._load_json("careers.json")

    def _load_json(self, filename):
        filepath = os.path.join(self.data_dir, filename)
        if not os.path.exists(filepath):
            return []
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)

    def get_advice(self, profile: dict, user_query: str) -> str:
        system_instruction = """
        You are the AI Career Counselor for PathPilot AI, operating inside a live chat window. 
        Your goal is to provide warm, encouraging, highly specific, and actionable career advice.
        You are free to use clean markdown structures, bullet points, headers, and comparative markdown tables (`| Column | Column |`) because the frontend renders them natively.
        Keep your tone professional, supportive, and mentoring.
        """

        context_data = f"""
        STUDENT PROFILE:
        - Name: {profile.get('name', 'Student')}
        - Location: {profile.get('city')}, {profile.get('region')}, {profile.get('country')}
        - Education Level: {profile.get('current_education_level')}
        - Preferred Field: {profile.get('preferred_field')}
        - Math Background: {profile.get('mathematics_background')}

        AVAILABLE CAREER DATASET:
        {json.dumps(self.careers_db, indent=2)}
        """

        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": f"{context_data}\n\nSTUDENT QUESTION: {user_query}"}
                ],
                model="openai/gpt-oss-120b",
                temperature=0.4,
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Counselor error: Unable to generate advice at this moment. ({str(e)})"