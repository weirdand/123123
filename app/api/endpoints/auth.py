from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt

router = APIRouter()

# Модели данных (соответствуют твоим типам из фронта)
class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    password: str
    name: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    plan: str
    devicesLimit: int
    scriptsLimit: int
    createdAt: str

class AuthResponse(BaseModel):
    user: UserResponse
    token: str

# Временное хранилище (потом заменишь на БД)
fake_users_db = {
    "test@test.com": {
        "id": "1",
        "email": "test@test.com",
        "name": "Test User",
        "password": "$2b$12$KIXHqUqZ5Q5Q5Q5Q5Q5Q5u",  # hashed "password"
        "plan": "pro",
        "devicesLimit": 100,
        "scriptsLimit": 999,
        "createdAt": datetime.now().isoformat()
    }
}

@router.post("/login", response_model=AuthResponse)
async def login(user_data: UserLogin):
    # Простая проверка для теста
    if user_data.email == "test@test.com" and user_data.password == "password":
        user = fake_users_db["test@test.com"]
        token = jwt.encode(
            {"sub": user["id"], "exp": datetime.utcnow() + timedelta(days=7)},
            "secret-key",
            algorithm="HS256"
        )
        return AuthResponse(
            user=UserResponse(
                id=user["id"],
                email=user["email"],
                name=user["name"],
                plan=user["plan"],
                devicesLimit=user["devicesLimit"],
                scriptsLimit=user["scriptsLimit"],
                createdAt=user["createdAt"]
            ),
            token=token
        )
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/register", response_model=AuthResponse)
async def register(user_data: UserRegister):
    # Простая регистрация
    user = {
        "id": str(len(fake_users_db) + 1),
        "email": user_data.email,
        "name": user_data.name,
        "password": "hashed",  # в реальности хешируй
        "plan": "free",
        "devicesLimit": 20,
        "scriptsLimit": 10,
        "createdAt": datetime.now().isoformat()
    }
    fake_users_db[user_data.email] = user
    
    token = jwt.encode(
        {"sub": user["id"], "exp": datetime.utcnow() + timedelta(days=7)},
        "secret-key",
        algorithm="HS256"
    )
    
    return AuthResponse(
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            plan=user["plan"],
            devicesLimit=user["devicesLimit"],
            scriptsLimit=user["scriptsLimit"],
            createdAt=user["createdAt"]
        ),
        token=token
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user():
    # Временно возвращаем тестового пользователя
    user = fake_users_db["test@test.com"]
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        plan=user["plan"],
        devicesLimit=user["devicesLimit"],
        scriptsLimit=user["scriptsLimit"],
        createdAt=user["createdAt"]
    )

@router.post("/change-password")
async def change_password(old: str, new: str):
    return {"success": True}