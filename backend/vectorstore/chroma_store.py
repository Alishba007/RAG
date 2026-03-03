from langchain_chroma import Chroma
from langchain_core.documents import Document
from .base import BaseVectorStore
import os

class ChromaStore(BaseVectorStore):
    def __init__(self, embedding, persist_directory: str):
        os.makedirs(persist_directory, exist_ok=True)
        self.store = Chroma(
            persist_directory=persist_directory,
            embedding_function=embedding.model
        )

    def add_documents(self, documents):
        self.store.add_documents(documents)

    def search(self, query: str, k: int, user: str):
        return self.store.similarity_search(
            query,
            k=k,
            filter={"user": user}
        )
