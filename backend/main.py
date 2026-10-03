import os
from database import engine
import models
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import auth_routes, profile_routes, program_routes, counselor_routes
from routers import ai_routes, data_routes

# Load environment variables
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, ".env")
load_dotenv(dotenv_path=env_path)

# Create all database tables (this creates pathpilot.db automatically)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PathPilot AI Multi-Agent Backend",
    description="Modular multi-agent MVP for education and career guidance.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth_routes.router)
app.include_router(profile_routes.router)
app.include_router(ai_routes.router)
app.include_router(program_routes.router)
app.include_router(data_routes.router)