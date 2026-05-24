class RAGService:
    def __init__(self, llm, vector_store):
        self.llm = llm
        self.vector_store = vector_store

    def stream_query(self, question: str, user: str, k: int = 3):
        docs = self.vector_store.search(question, k=k, user=user)

        if not docs:
            yield "No relevant documents found."
            return

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

        for token in self.llm.stream(prompt):
            yield token
