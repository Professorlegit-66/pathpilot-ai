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
    region = Column(String, nullable=True)
    city = Column(String, nullable=True)
    desired_degree = Column(String, default="Bachelor")
    current_education_level = Column(String, default="HSSC")
    ssc_percentage = Column(Float, default=75.0)
    hssc_percentage = Column(Float, default=85.0)
    hssc_group = Column(String, default="Pre-Engineering")
    mathematics_background = Column(Boolean, default=True)
    preferred_field = Column(String, default="Computer Science")
    budget = Column(String, default="Rs. 300,000 / year")
    financial_need_status = Column(Boolean, default=True)
    gpa_score = Column(String, nullable=True)
    standardized_test = Column(String, nullable=True)