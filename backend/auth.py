from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from jose import jwt, JWTError
from passlib.context import CryptContext
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
import uuid
from datetime import timedelta
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

load_dotenv()
security = HTTPBearer()
router = APIRouter()
SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -------------------- DATABASE --------------------
def get_db_conn():
    conn = psycopg2.connect(
        host=os.getenv("SUPABASE_HOST"),
        database=os.getenv("SUPABASE_DB"),
        user=os.getenv("SUPABASE_USER"),
        password=os.getenv("SUPABASE_PASSWORD"),
        port=5432,
        sslmode="require"
    )
    conn.autocommit = True
    return conn

# -------------------- MODELS --------------------
class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    password: str

# -------------------- UTILS --------------------
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password):
    return pwd_context.hash(password)

def create_access_token(user_id: str):
    
    payload = {
        "sub": str(user_id),
        "type": "access"
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_user_by_username(username: str):
    conn = get_db_conn()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT id, username, password_hash FROM users WHERE username=%s", (username,))
        user = cur.fetchone()
    conn.close()
    return user

def create_user(username: str, password: str):
    user_id = str(uuid.uuid4())
    hashed = hash_password(password)
    conn = get_db_conn()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO users (id, username, password_hash,created_at) VALUES (%s, %s, %s,Now())",
            (user_id, username, hashed)
        )
    return {"id": user_id, "username": username}

# -------------------- DEPENDENCIES --------------------
def verify_access_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token")
        user_id = payload["sub"]
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# -------------------- ROUTES --------------------
@router.post("/signup")
def signup(user: UserRegister):
    existing = get_user_by_username(user.username)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    new_user = create_user(user.username, user.password)
    return {"message": "User created successfully", "user_id": new_user["id"]}

@router.post("/login")
def login(user: UserLogin):
    db_user = get_user_by_username(user.username)
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(db_user["id"])
    return {"access_token": token, "token_type": "bearer"}

@router.post("/refresh")
def refresh_token(refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token")

        new_payload = {
            "sub": payload["sub"],
            "type": "access"
        }

        new_access = jwt.encode(new_payload, SECRET_KEY, algorithm=ALGORITHM)

        return {"access_token": new_access}

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@router.get("/verify_token")
def verify_token(user: str = Depends(verify_access_token)):
    return {
        "valid": True,
        "user_id": user
    }