from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text
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
    
    country = Column(String, nullable=True)
    region = Column(String, nullable=True)
    city = Column(String, nullable=True)
    desired_degree = Column(String, nullable=True)
    current_education_level = Column(String, nullable=True)
    ssc_percentage = Column(Float, nullable=True)
    hssc_percentage = Column(Float, nullable=True)
    hssc_group = Column(String, nullable=True)
    mathematics_background = Column(Boolean, default=False, nullable=True)
    preferred_field = Column(String, nullable=True)
    target_career = Column(String, nullable=True)
    selected_program = Column(Text, nullable=True)
    budget = Column(String, nullable=True)
    financial_need_status = Column(Boolean, nullable=True)
    gpa_score = Column(String, nullable=True)
    standardized_test = Column(String, nullable=True)