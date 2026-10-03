from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class DBStudentProfile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    country = Column(String, default="Pakistan")
    region = Column(String)
    city = Column(String)
    current_education_level = Column(String)
    ssc_percentage = Column(Float)
    hssc_percentage = Column(Float)
    hssc_group = Column(String)
    mathematics_background = Column(Boolean, default=True)
    preferred_field = Column(String)
    financial_need_status = Column(Boolean, default=True)