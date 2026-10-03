import os
from dotenv import load_dotenv

load_dotenv()

# Single centralized secret key for the entire backend application
SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-hackathon-key-with-more-than-32-bytes-length!")
ALGORITHM = "HS256"