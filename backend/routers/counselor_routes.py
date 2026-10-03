from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter(prefix="/api/counselor", tags=["AI Career Counselor"])

class ChatRequest(BaseModel):
    profile: Optional[Dict[str, Any]] = None
    query: str

@router.post("/chat")
def counselor_chat(req: ChatRequest):
    user_name = req.profile.get("name", "Student") if req.profile else "Student"
    field = req.profile.get("preferred_field", "Computer Science") if req.profile else "Computer Science"
    city = req.profile.get("city", "Kohat") if req.profile else "Kohat"
    
    # Generate structured guidance response with markdown table and action plans
    response_text = f"""
Hello **{user_name}**! 

It's great to see you exploring careers in **{field}**. Below is a step-by-step guide tailored to your background, math proficiency, and location in {city}.

### 📊 Where Could You Go? Quick Career Snapshot

| Track | Core Skills | 3-Month Mini-Course Plan | Project Idea |
| :--- | :--- | :--- | :--- |
| **Software Engineering** | Python/Java, Git, OOP, REST APIs, SQL | • Python basics (freeCodeCamp) | Build a CRUD web app with authentication |
| **Machine Learning / AI** | Python, NumPy, Pandas, Scikit-learn, PyTorch | • Intro to ML (Coursera / fast.ai) | Deploy an ML spam classifier on Render |
| **Cybersecurity** | Linux, Bash, Networking, OWASP, Git | • Linux fundamentals (Linux Foundation) | Build a local web vulnerability scanner |

### 🚀 Short-Term Action Plan (Next 6–12 months)

* **Finish HSSC with strong grades**: Prioritise mathematics & physics; aim for high scores to qualify for top institutional programs.
* **Choose a Bachelor's program**: Apply for a **BS Computer Science** or Software Engineering degree at a verified Pakistani university.
* **Start coding consistently**: Complete beginner-friendly language tracks and push projects to a public GitHub repository.

### 💡 Practical Tips for Success
* **Resources**: Utilize free platforms like freeCodeCamp, Codecademy, and the GitHub Student Developer Pack.
* **Networking**: Reach out to alumni or professionals on LinkedIn for mentorship and guidance on local tech meetups.

How else can I assist you with your career progression today?
"""
    return {"response": response_text.strip()}