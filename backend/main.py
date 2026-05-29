# backend/main.py

from fastapi import FastAPI, File, UploadFile, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
import shutil
import os
import uuid
from typing import Optional

from backend.config import Settings

from backend.llm.ollama_provider import OllamaProvider
from backend.embeddings.hf_embeddings import HFEmbedding
from backend.vectorstore.pgvector_store import PGVectorStore

from backend.Services.rag_service import RAGService
from backend.Services.ingestion_service import IngestionService
from backend.Services.chat_service import ChatService
from backend.file_processor import read_file

from backend.auth import router as auth_router
from backend.auth import verify_access_token


# ---------------- INIT ----------------

app = FastAPI()

# initialize AI stack
embedding = HFEmbedding()
vector_store = PGVectorStore(embedding)
llm = OllamaProvider(Settings.OLLAMA_MODEL)

rag_service = RAGService(llm, vector_store, chat_service=None)  # Will be set below
ingestion_service = IngestionService(vector_store)
chat_service = ChatService()

# Now set chat_service in rag_service
rag_service.chat_service = chat_service


# ---------------- CORS ----------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- AUTH ROUTES ----------------

app.include_router(auth_router)


# ---------------- MODELS ----------------

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ConversationCreate(BaseModel):
    title: Optional[str] = None


# Helper function to clean LLM response
def clean_answer(text: str) -> str:
    """Remove source mentions from LLM response"""
    # Find where "Source" starts and remove everything after it
    if "Source" in text:
        text = text.split("Source")[0].strip()
    if "source" in text:
        text = text.split("source")[0].strip()
    if "document:" in text:
        text = text.split("document:")[0].strip()
    if "page:" in text and "document:" not in text:
        # Only remove page info if no document info before it
        text = text.split("page:")[0].strip()
    
    return text.strip()


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


# ---------------- CONVERSATION ENDPOINTS ----------------

@app.post("/conversations")
async def create_conversation(
    body: ConversationCreate,
    user_id: str = Depends(verify_access_token)
):
    """Create a new conversation"""
    conv = chat_service.create_conversation(user_id, body.title)
    return conv

@app.get("/conversations")
async def list_conversations(
    user_id: str = Depends(verify_access_token)
):
    """List all conversations for user"""
    conversations = chat_service.get_user_conversations(user_id)
    return {"conversations": conversations}

@app.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    user_id: str = Depends(verify_access_token)
):
    """Get conversation details with messages"""
    conv = chat_service.get_conversation_details(conversation_id, user_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    user_id: str = Depends(verify_access_token)
):
    """Delete a conversation"""
    if chat_service.delete_conversation(conversation_id, user_id):
        return {"message": "Conversation deleted"}
    raise HTTPException(status_code=404, detail="Conversation not found")


# ---------------- CHAT ----------------

@app.post("/chat", response_class=PlainTextResponse)
async def chat_with_history(
    request: ChatRequest,
    user_id: str = Depends(verify_access_token)
):
    """Chat endpoint with history support"""
    
    # Create conversation if needed
    conversation_id = request.conversation_id
    if not conversation_id:
        conv = chat_service.create_conversation(user_id)
        conversation_id = conv["id"]
    
    # Add user message to history
    chat_service.add_message(conversation_id, user_id, "user", request.message)
    
    # Get response from RAG with history
    rag_response = rag_service.query_with_history(
        request.message, 
        user_id, 
        conversation_id,
        k=3
    )
    
    # Clean the answer from any embedded source information
    clean_msg = clean_answer(rag_response["message"])
    
    # Add assistant response to history
    chat_service.add_message(
        conversation_id, 
        user_id, 
        "assistant", 
        clean_msg,
        rag_response.get("sources")
    )
    
    # Format response as plain text in the desired structure
    sources = rag_response.get("sources", [])
    
    # Build formatted response
    formatted_response = clean_msg
    
    if sources:
        formatted_response += "\n\nSource\n"
        for source in sources:
            formatted_response += f"document: {source['document']}\n"
            formatted_response += f"page: {source['pages']}\n"
    
    return formatted_response.strip()
