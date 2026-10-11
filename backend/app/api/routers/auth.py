"""Authentication endpoints."""

import secrets
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.limiter import limiter
from app.core.security import (
    create_access_token,
    get_password_hash,
    validate_password_strength,
    verify_password,
)
from app.db.session import get_db
from app.models import User
from app.schemas import LoginRequest, UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
@limiter.limit(settings.RATE_LIMIT_REGISTER)
async def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    from app.models import Student
    from sqlalchemy import func

    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    cleaned_usn = user_data.usn.strip().upper() if user_data.usn and user_data.usn.strip() else None
    if cleaned_usn:
        existing_usn_student = db.query(Student).filter(func.upper(Student.usn) == cleaned_usn).first()
        if existing_usn_student and existing_usn_student.user_id:
            raise HTTPException(status_code=400, detail=f"USN {cleaned_usn} is already registered to an active account.")

    validate_password_strength(user_data.password)
    hashed_password = get_password_hash(user_data.password)

    if cleaned_usn:
        unique_id = cleaned_usn
    else:
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        random_suffix = secrets.token_hex(2)
        unique_id = f"USR{timestamp}{random_suffix}"

    admin_email = settings.ADMIN_EMAIL
    user_role = "admin" if admin_email and user_data.email == admin_email else "user"
    dept = user_data.branch or user_data.department or "CSE"

    db_user = User(
        email=user_data.email,
        password=hashed_password,
        full_name=user_data.full_name,
        unique_id=unique_id,
        phone_number=user_data.phone_number,
        department=dept,
        role=user_role,
        is_active=True,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Link existing student or create new student record
    matched_student = None
    if cleaned_usn:
        matched_student = db.query(Student).filter(func.upper(Student.usn) == cleaned_usn).first()
    if not matched_student:
        matched_student = db.query(Student).filter(func.lower(Student.email) == user_data.email.lower().strip()).first()

    if matched_student:
        matched_student.user_id = db_user.id
        if cleaned_usn:
            matched_student.usn = cleaned_usn
        if user_data.branch:
            matched_student.branch = user_data.branch
        if user_data.year:
            matched_student.year = int(user_data.year)
        if user_data.semester:
            matched_student.semester = int(user_data.semester)
        if user_data.section:
            matched_student.section = user_data.section
        db.commit()
    elif user_role != "admin" or cleaned_usn:
        new_student = Student(
            usn=cleaned_usn or unique_id,
            full_name=user_data.full_name,
            email=user_data.email,
            branch=user_data.branch or dept or "CSE",
            year=int(user_data.year) if user_data.year else 3,
            semester=int(user_data.semester) if user_data.semester else 6,
            section=user_data.section or "A",
            class_code="BCS703 — Cryptography & Network Security",
            user_id=db_user.id,
        )
        db.add(new_student)
        db.commit()

    access_token = create_access_token(data={"sub": db_user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(db_user),
    }


@router.post("/login")
@limiter.limit(settings.RATE_LIMIT_LOGIN)
async def login(request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(login_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated. Please contact administrator.")

    access_token = create_access_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user),
    }
