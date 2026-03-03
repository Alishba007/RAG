from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
import os

class IngestionService:
    def __init__(self, vector_store):
        self.vector_store = vector_store
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=100
        )

    def ingest(self, file_path: str, user: str, content: str):
        chunks = self.splitter.split_text(content)

        documents = [
            Document(
                page_content=chunk,
                metadata={
                    "user": user,
                    "source": os.path.basename(file_path),
                    "chunk_id": i
                }
            )
            for i, chunk in enumerate(chunks)
        ]

        self.vector_store.add_documents(documents)

        return {
            "filename": os.path.basename(file_path),
            "chunks": len(chunks),
            "status": "success"
        }
