from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import bcrypt
import jwt
from datetime import datetime, timedelta

from database import get_db
import models
from schemas import UserCreate, UserLogin, Token
from config import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8')[:72],
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    safe_password = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(safe_password, salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register", response_model=Token)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(full_name=user.full_name, email=user.email, hashed_password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize linked student profile
    new_profile = models.DBStudentProfile(
        user_id=new_user.id,
        country="Pakistan",
        region="Khyber Pakhtunkhwa",
        city="Kohat"
    )
    db.add(new_profile)
    db.commit()
    
    # Include user.id in JWT payload
    access_token = create_access_token(data={"sub": new_user.email, "id": new_user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Crucial: Include "id": user.id so profile_routes can identify the user
    access_token = create_access_token(data={"sub": user.email, "id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}