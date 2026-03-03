from embeddings.hf_embeddings import HFEmbedding
from vectorstore.pgvector_store import PGVectorStore
from langchain_core.documents import Document

embedding = HFEmbedding()
store = PGVectorStore(embedding)

docs = [
    Document(
        page_content="Karachi is the largest city in Pakistan.",
        metadata={"user": "test_user", "source": "test_doc", "chunk_id": 1}
    ),
    Document(
        page_content="Islamabad is the capital of Pakistan.",
        metadata={"user": "test_user", "source": "test_doc", "chunk_id": 2}
    )
]

store.add_documents(docs)

results = store.search("Which city is the biggest in Pakistan?", 2, "test_user")

print(results)
