from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import the modular routers
from routers import ai_routes, data_routes

# Load environment variables
load_dotenv()

app = FastAPI(
    title="PathPilot AI Multi-Agent Backend",
    description="Modular multi-agent MVP for education and career guidance.",
    version="1.0.0"
)

# Enable CORS for React frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the routers
app.include_router(ai_routes.router)
app.include_router(data_routes.router)