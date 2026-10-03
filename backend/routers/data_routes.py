import os
import json
from fastapi import APIRouter

router = APIRouter(prefix="/api/data", tags=["Data Engine"])

def load_json_dataset(filename: str):
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    filepath = os.path.join(base_dir, "data", filename)
    if not os.path.exists(filepath):
        return []
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[Error] Failed to read {filename}: {e}")
        return []

@router.get("/careers")
def get_careers():
    careers = load_json_dataset("careers.json")
    return careers