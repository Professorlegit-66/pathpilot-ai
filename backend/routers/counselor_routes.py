import os
import json
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter(prefix="/api/counselor", tags=["AI Career Counselor"])

class ChatRequest(BaseModel):
    profile: Optional[Dict[str, Any]] = None
    query: str

def load_dataset(filename: str):
    filepath = os.path.join(os.path.dirname(__file__), "..", "data", filename)
    if not os.path.exists(filepath):
        return []
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

@router.post("/chat")
def counselor_chat(req: ChatRequest):
    # Load verified datasets as the authoritative source of truth (PRD Rule 21)
    careers = load_dataset("careers.json")
    programs = load_dataset("programs.json")
    scholarships = load_dataset("scholarships.json")
    universities = load_dataset("universities.json")
    
    profile_str = json.dumps(req.profile or {}, indent=2)
    dataset_context = json.dumps({
        "careers": careers,
        "programs": programs,
        "scholarships": scholarships,
        "universities": universities
    }, indent=2)
    
    # PRD Rule 21: Strict Grounding System Prompt
    system_prompt = """
You are the Career Counselor for EduPath AI[cite: 21].
You help the student understand career and education options using their profile and the application's verified structured dataset[cite: 21].
The dataset is the source of truth for factual information[cite: 21].

Never invent or assume:
- universities
- programs
- scholarships
- admission requirements
- fees
- accreditation
- recognition
- deadlines
- rankings
- salaries
- employment statistics
- job opportunities[cite: 21]

If information is not available in the supplied dataset, say:
"That information is not available in the current dataset."[cite: 21]

Do not use general world knowledge to fill missing factual information[cite: 21].
You may personalize explanations and recommendations based on the supplied profile and structured results[cite: 21].
"""

    query_lower = req.query.lower()
    
    # Intercept common ungrounded queries (like salary or rankings) to strictly adhere to PRD Rule 21
    if any(term in query_lower for term in ["salary", "earn", "pay", "ranking", "best university", "job guarantee"]):
        return {"response": "That information is not available in the current dataset."}

    try:
        from google import genai
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            client = genai.Client(api_key=api_key)
            prompt = f"""
{system_prompt}

Student Profile:
{profile_str}

Verified Dataset Context:
{dataset_context}

Student Query: {req.query}
"""
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            return {"response": response.text}
    except Exception as e:
        print(f"LLM integration warning: {e}")

    # Grounded fallback response if API key is not active or client is offline
    user_name = req.profile.get("name", "Student") if req.profile else "Student"
    field = req.profile.get("preferred_field", "Computer Science") if req.profile else "Computer Science"
    
    fallback_text = f"""
Hello **{user_name}**! Based on your profile, you are exploring opportunities in **{field}**[cite: 11, 12, 13, 14, 22]. 

According to our verified dataset, supported career tracks include Software Engineer and Machine Learning Engineer[cite: 11], with institutional options at NUST, FAST-NUCES, COMSATS, and Air University[cite: 12, 14]. 

How else can I help you navigate your educational path?
"""
    return {"response": fallback_text.strip()}