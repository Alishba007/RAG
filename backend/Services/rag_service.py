class RAGService:
    def __init__(self, llm, vector_store):
        self.llm = llm
        self.vector_store = vector_store

    def query(self, question: str, user: str, k: int = 3):
        docs = self.vector_store.search(question, k=k, user=user)

        if not docs:
            return {
                "answer": "No relevant documents found.",
                "sources": []
            }

        context = "\n\n".join([doc["page_content"] for doc in docs])


        prompt = f"""
You are a helpful assistant answering ONLY from the provided context.
If the answer is not in context, say you don't know.

Context:
{context}

Question:
{question}

Answer:
"""

        response = self.llm.generate(prompt)

        sources = [
            {
                "source": doc["metadata"].get("source"),
                "chunk_id": doc["metadata"].get("chunk_id")
            }   
        for doc in docs
        ]


        return {
            "answer": response,
            "sources": sources
        }
