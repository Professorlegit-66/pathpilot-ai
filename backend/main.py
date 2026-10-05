import os
from database import engine
import models
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import auth_routes, profile_routes, program_routes, counselor_routes, ai_routes, data_routes

current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, ".env")
load_dotenv(dotenv_path=env_path)

models.Base.metadata.create_all(bind=engine)
    
app = FastAPI(
    title="PathPilot AI Multi-Agent Backend",
    description="Modular multi-agent MVP for education and career guidance.",
    version="1.0.0"
)

# Define allowed origins for CORS (required when allow_credentials=True)
origins = [
    "https://pathpilot-ai-phi.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth_routes.router)
app.include_router(profile_routes.router)
app.include_router(ai_routes.router)
app.include_router(program_routes.router)
app.include_router(data_routes.router)
app.include_router(counselor_routes.router)