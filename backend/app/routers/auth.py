from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserLogin, UserResponse
from app.services.auth_service import hash_password, verify_password
from app.core.security import create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class UserUpdate(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)

class PasswordUpdate(BaseModel):
    current_password: str = Field(min_length=1, max_length=200)
    new_password: str = Field(min_length=6, max_length=200)

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered"
        )

    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()

    if not user or not verify_password(
        user_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email
        }
    }

@router.get("/me", response_model=UserResponse)
def get_me(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    user = (
        db.query(User)
        .filter(User.id == int(current_user_id))
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user

@router.put("/me", response_model=UserResponse)
def update_me(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    user = (
        db.query(User)
        .filter(User.id == int(current_user_id))
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    clean_name = user_data.full_name.strip()

    if not clean_name:
        raise HTTPException(
            status_code=400,
            detail="Full name cannot be empty"
        )

    user.full_name = clean_name

    db.commit()
    db.refresh(user)

    return user

@router.put("/password")
def update_password(
    password_data: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    user = (
        db.query(User)
        .filter(User.id == int(current_user_id))
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Verify the current password before allowing a change
    if not verify_password(
        password_data.current_password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    # Reject if the new password matches the old one
    if verify_password(
        password_data.new_password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from the current password"
        )

    user.password_hash = hash_password(password_data.new_password)

    db.commit()
    db.refresh(user)

    return {
        "message": "Password updated successfully",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
        },
    }