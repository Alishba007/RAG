from langchain_ollama import OllamaLLM
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

llm = OllamaLLM(model="llama3.1")

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

vectorstore = FAISS.load_local("vector_db", embeddings)

def rag_answer(query):
    docs = vectorstore.similarity_search(query, k=3)

    context = "\n".join([doc.page_content for doc in docs])

    prompt = f"""
    Use the following context to answer the question.
    If the answer is not in the context, say you don't know.

    Context:
    {context}

    Question:
    {query}
    """

    return llm.invoke(prompt)
