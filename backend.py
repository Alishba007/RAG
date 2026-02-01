from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import jwt, JWTError

from langchain_ollama import OllamaLLM
from langchain_huggingface import HuggingFaceEmbeddings

from langchain_chroma import Chroma

from langchain_core.documents import Document


# ------------------- AUTH SETUP -------------------

security = HTTPBearer()
SECRET = "super-secret-key"
ALGORITHM = "HS256"

def verify_token(creds: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(creds.credentials, SECRET, algorithms=[ALGORITHM])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ------------------- APP SETUP -------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------- LLM -------------------

llm = OllamaLLM(model="llama3.1")

# ------------------- EMBEDDINGS -------------------

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# ------------------- VECTOR DATABASE -------------------

vector_db = Chroma(
    persist_directory="./vectordb",
    embedding_function=embeddings
)

# ------------------- MODELS -------------------

class ChatRequest(BaseModel):
    message: str

class AddDocRequest(BaseModel):
    text: str

# ------------------- ADD DOCUMENT ENDPOINT -------------------

@app.post("/add-doc")
def add_document(req: AddDocRequest, user=Depends(verify_token)):
    doc = Document(
        page_content=req.text,
        metadata={"user": user}
    )

    vector_db.add_documents([doc])
    vector_db.persist()

    return {"status": "Document added"}

# ------------------- CHAT (RAG) -------------------

@app.post("/chat")
def chat(req: ChatRequest, user=Depends(verify_token)):
    # 1. Search relevant documents
    docs = vector_db.similarity_search(req.message, k=3)

    context = "\n\n".join(doc.page_content for doc in docs)

    # 2. Build prompt
    prompt = f"""
You are an assistant. Answer using ONLY the context below.
If the answer is not in the context, say "I don't know".

Context:
{context}

Question:
{req.message}
"""

    # 3. Ask LLM
    reply = llm.invoke(prompt)

    return {"reply": reply}
