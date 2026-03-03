import os

class Settings:
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama")  # ollama | groq
    OLLAMA_MODEL = "llama3.1"

    VECTOR_DB = os.getenv("VECTOR_DB", "chroma")  # chroma | pgvector
    CHROMA_DIR = "./vector_store"

settings = Settings()
