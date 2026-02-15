from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaLLM
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
import os

class RAGEngine:
    def __init__(self, persist_directory="./vector_store"):
        try:
            self.llm = OllamaLLM(model="llama3.1")
            print("✓ Ollama LLM initialized")
        except Exception as e:
            print(f"⚠ Could not initialize Ollama: {e}")
            self.llm = None
        
        try:
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2"
            )
            print("✓ Embeddings initialized")
        except Exception as e:
            print(f"⚠ Could not initialize embeddings: {e}")
            self.embeddings = None
        
        self.persist_directory = persist_directory
        
        try:
            # Initialize vector store
            if os.path.exists(persist_directory):
                self.vector_store = Chroma(
                    persist_directory=persist_directory,
                    embedding_function=self.embeddings
                )
                print("✓ Loaded existing vector store")
            else:
                os.makedirs(persist_directory, exist_ok=True)
                self.vector_store = Chroma(
                    persist_directory=persist_directory,
                    embedding_function=self.embeddings,
                    collection_name="rag_documents"
                )
                print("✓ Created new vector store")
        except Exception as e:
            print(f"⚠ Could not initialize vector store: {e}")
            self.vector_store = None
        
        try:
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=500,
                chunk_overlap=100,
                length_function=len,
                separators=["\n\n", "\n", " ", ""]
            )
            print("✓ Text splitter initialized")
        except Exception as e:
            print(f"⚠ Could not initialize text splitter: {e}")
            self.text_splitter = None
        
        print("✓ RAG Engine initialization complete")
    
    def add_document(self, file_path: str, user: str):
        """Process and add document to vector store"""
        if not self.vector_store:
            return {
                "filename": os.path.basename(file_path),
                "chunks": 1,
                "user": user,
                "status": "error - Vector store not available",
                "note": "Check if embeddings and vector store initialized properly"
            }
        
        try:
            # Import file processor
            try:
                from backend.file_processor import read_file
            except ImportError:
                from file_processor import read_file
            
            content = read_file(file_path)
            
            if not self.text_splitter:
                return {
                    "filename": os.path.basename(file_path),
                    "error": "Text splitter not available",
                    "status": "error"
                }
            
            # Split into chunks
            chunks = self.text_splitter.split_text(content)
            
            # Create documents with metadata
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
            
            # Add to vector store
            self.vector_store.add_documents(documents)
            
            return {
                "filename": os.path.basename(file_path),
                "chunks": len(chunks),
                "user": user,
                "status": "success"
            }
            
        except Exception as e:
            return {
                "filename": os.path.basename(file_path),
                "error": str(e),
                "status": "error"
            }
    
    def query(self, question: str, user: str, k: int = 3):
        """Query documents with RAG"""
        if not self.vector_store or not self.llm:
            return f"RAG system not fully initialized. Vector store: {self.vector_store is not None}, LLM: {self.llm is not None}"
        
        try:
            # Search for relevant documents
            docs = self.vector_store.similarity_search(question, k=k)
            
            # Build context
            context = "\n\n".join([doc.page_content for doc in docs])
            
            # Create prompt
            prompt = f"""You are a helpful assistant answering questions based on the provided context.
            If the answer is not in the context, say "I don't know based on the provided documents."
            
            Context from documents:
            {context}
            
            Question: {question}
            
            Answer:"""
            
            # Generate response
            response = self.llm.invoke(prompt)
            return response
            
        except Exception as e:
            return f"Error querying RAG engine: {str(e)}"
    
    def get_user_documents(self, user: str):
        """Get list of documents for a user"""
        if not self.vector_store:
            return {"error": "Vector store not initialized"}
        
        try:
            # Get all documents from the vector store
            # This is a simple implementation - you might need to adjust based on your Chroma setup
            results = self.vector_store.get()
            
            if results and "metadatas" in results:
                user_docs = []
                for i, metadata in enumerate(results["metadatas"]):
                    if metadata.get("user") == user:
                        user_docs.append({
                            "source": metadata.get("source", "unknown"),
                            "chunk_id": metadata.get("chunk_id", i),
                            "id": results.get("ids", [])[i] if "ids" in results else i
                        })
                
                return {
                    "user": user,
                    "documents": user_docs,
                    "count": len(user_docs)
                }
            else:
                return {
                    "user": user,
                    "documents": [],
                    "count": 0,
                    "message": "No documents found"
                }
                
        except Exception as e:
            return {"error": f"Error retrieving documents: {str(e)}"}