#!/usr/bin/env python3

"""
Test script to check if a school with ID 1 exists in the database.
"""

from sqlalchemy.orm import Session
from database import SessionLocal
from models import School

# Create a database session
db = SessionLocal()

try:
    # Check if any schools exist
    schools = db.query(School).all()
    print(f"Total schools found: {len(schools)}")
    
    # Print details of all schools
    for school in schools:
        print(f"School ID: {school.id}, Name: {school.school_name}, Code: {school.school_code}")
    
    # Check specifically for school with ID 1
    school_1 = db.query(School).filter(School.id == 1).first()
    if school_1:
        print(f"\nSchool with ID 1 found: {school_1.school_name}")
    else:
        print("\nNo school with ID 1 found")
        
        # If no schools exist, create one
        if not schools:
            print("Creating a default school...")
            new_school = School(
                school_name="测试学校",
                school_code="TEST001",
                address="测试地址",
                contact_info="13800138000"
            )
            db.add(new_school)
            db.commit()
            db.refresh(new_school)
            print(f"Created default school: ID={new_school.id}, Name={new_school.school_name}")
finally:
    # Close the session
    db.close()
