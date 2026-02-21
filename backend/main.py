# backend/main.py
from fastapi import (
    FastAPI,
    File,
    UploadFile,
    Depends,
    HTTPException
)
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from datetime import timedelta
from jose import jwt, JWTError

import os
import shutil
import uvicorn
import sqlite3

from backend.auth import (
    verify_access_token,
    create_access_token,
    verify_password,
    get_user,
    create_user,
    SECRET_KEY,
    ALGORITHM
)



from backend.rag_engine import RAGEngine

# -------------------- INIT --------------------
app = FastAPI()
rag_engine = RAGEngine()

# -------------------- CORS --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- DATABASE --------------------
DB_PATH = "chrome.sqlite3"

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

# -------------------- MODELS --------------------
class ChatRequest(BaseModel):
    message: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    password: str

# -------------------- AUTH ROUTES --------------------

@app.post("/login")
def login(user: UserLogin):
    db_user = get_user(user.username)

    if not db_user:
        print("Password length (chars):", len(user.password))
        print("Password length (bytes):", len(user.password.encode()))
        raise HTTPException(status_code=401, detail="Invalid credentials")
        


    username, password_hash = db_user

    if not verify_password(user.password, password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(username)

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@app.post("/signup")
def register(user: UserRegister):
    create_user(user.username, user.password)
    return {"message": "User created successfully"}
    

@app.post("/refresh")
def refresh_token(refresh_token: str):
    try:
        payload = jwt.decode(
            refresh_token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token")

        new_access = create_token(
            {
                "sub": payload["sub"],
                "type": "access"
            },
            timedelta(minutes=ACCESS_EXPIRE_MINUTES)
        )

        return {"access_token": new_access}

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@app.get("/verify_token")
def verify_token(user: str = Depends(verify_access_token)):
    return {"valid": True, "user": user}


# -------------------- PROTECTED TEST --------------------

@app.get("/protected")
def protected_route(user: str = Depends(verify_access_token)):
    return {"message": f"Hello {user}"}

# -------------------- UPLOAD --------------------

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    user: str = Depends(verify_access_token)
):
    temp_path = f"temp_{file.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = rag_engine.add_document(temp_path, user)
        return {
            "message": "Document processed successfully",
            "details": result
        }
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# -------------------- CHAT --------------------

@app.post("/chat")
async def chat(
    request: ChatRequest,
    user: str = Depends(verify_access_token)
):
    response = rag_engine.query(request.message, user)
    return {"reply": response}

# -------------------- DOCUMENTS --------------------

@app.get("/documents")
async def get_documents(user: str = Depends(verify_access_token)):
    return rag_engine.get_user_documents(user)

# -------------------- RUN --------------------

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
