# backend/main.py

from fastapi import FastAPI, File, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
import uuid

from backend.config import Settings

from backend.llm.ollama_provider import OllamaProvider
from backend.embeddings.hf_embeddings import HFEmbedding
from backend.vectorstore.pgvector_store import PGVectorStore

from backend.Services.rag_service import RAGService
from backend.Services.ingestion_service import IngestionService
from backend.file_processor import read_file

from backend.auth import router as auth_router
from backend.auth import verify_access_token
from fastapi.responses import StreamingResponse


# ---------------- INIT ----------------

app = FastAPI()

# initialize AI stack
embedding = HFEmbedding()
vector_store = PGVectorStore(embedding)
llm = OllamaProvider(Settings.OLLAMA_MODEL)

rag_service = RAGService(llm, vector_store)
ingestion_service = IngestionService(vector_store)


# ---------------- CORS ----------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- AUTH ROUTES ----------------

app.include_router(auth_router)


# ---------------- MODELS ----------------

class ChatRequest(BaseModel):
    message: str


# ---------------- FILE UPLOAD ----------------

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    user_id: str = Depends(verify_access_token)
):

    temp_path = f"temp_{uuid.uuid4()}_{file.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        content = read_file(temp_path)

        result = ingestion_service.ingest(
            file_path=temp_path,
            user=user_id,
            content=content
        )

        return {
            "message": "Document processed successfully",
            "details": result
        }

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# ---------------- CHAT ----------------

@app.post("/chat")
async def chat(
    request: ChatRequest,
    user: str = Depends(verify_access_token)
):

    generator = rag_service.stream_query(request.message, user)

    return StreamingResponse(generator, media_type="text/plain")