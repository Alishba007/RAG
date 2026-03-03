from langchain_huggingface import HuggingFaceEmbeddings
from .base import BaseEmbedding

class HFEmbedding(BaseEmbedding):
    def __init__(self):
        self.model = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

    def embed_documents(self, texts):
        return self.model.embed_documents(texts)

    def embed_query(self, text):
        return self.model.embed_query(text)
