import os

class RAGService:
    def __init__(self, llm, vector_store, chat_service=None):
        self.llm = llm
        self.vector_store = vector_store
        self.chat_service = chat_service

    def stream_query(self, question: str, user: str, k: int = 3):
        docs = self.vector_store.search(question, k=k, user=user)

        if not docs:
            yield "No relevant documents found."
            return

        # Handle both dict and Document object formats
        context = "\n\n".join([
            doc["page_content"] if isinstance(doc, dict) else doc.page_content 
            for doc in docs
        ])

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

    def _extract_clean_filename(self, source_path: str) -> str:
        """Extract clean filename from source path, removing temp prefix"""
        # Remove temp prefix like 'temp_1f736b4a-8466-4723-ae54-19c810d2f919_'
        filename = os.path.basename(source_path)
        if filename.startswith('temp_'):
            # Remove temp_UUID_ prefix
            parts = filename.split('_', 2)
            if len(parts) > 2:
                filename = parts[2]
        return filename

    def query_with_history(self, question: str, user: str, conversation_id: str, k: int = 3):
        """Query with chat history context"""
        
        # Get chat history
        history = []
        if self.chat_service and conversation_id:
            history = self.chat_service.get_conversation_history(
                conversation_id, user, limit=5
            )
        
        # Search for relevant documents
        docs = self.vector_store.search(question, k=k, user=user)
        
        if not docs:
            return {
                "message": "No relevant documents found.",
                "sources": []
            }
        
        # Build context from documents (handle dict format)
        context = "\n\n".join([
            doc["page_content"] if isinstance(doc, dict) else doc.page_content 
            for doc in docs
        ])
        
        # Build conversation history context
        history_context = ""
        if history:
            history_context = "Previous conversation:\n"
            for msg in history:
                role_label = "User" if msg['role'] == 'user' else "Assistant"
                history_context += f"{role_label}: {msg['content']}\n"
            history_context += "\n"
        
        # Create enhanced prompt
        prompt = f"""You are a helpful assistant answering questions based on the provided context.
If the answer is not in the context, say "I don't know based on the provided documents."

{history_context}

Context from documents:
{context}

Question: {question}

Answer:"""
        
        # Generate response using the correct method (generate, not invoke)
        response = self.llm.generate(prompt)
        
        # Extract and format source documents with page numbers
        source_docs = []
        seen_sources = {}
        
        for doc in docs:
            if isinstance(doc, dict):
                source = doc["metadata"]["source"]
                chunk_id = doc["metadata"].get("chunk_id", 0)
            else:
                source = doc.metadata.get("source", "unknown")
                chunk_id = doc.metadata.get("chunk_id", 0)
            
            # Clean the filename
            clean_source = self._extract_clean_filename(source)
            
            # Group by source and collect unique chunk_ids (page numbers)
            if clean_source not in seen_sources:
                seen_sources[clean_source] = []
            
            if chunk_id not in seen_sources[clean_source]:
                seen_sources[clean_source].append(chunk_id)
        
        # Format sources with document name and page numbers
        for doc_name, chunk_ids in seen_sources.items():
            page_numbers = sorted(chunk_ids)
            page_str = ", ".join([f"Page {p+1}" for p in page_numbers])
            
            source_docs.append({
                "document": doc_name,
                "pages": page_str
            })
        
        return {
            "message": response,
            "sources": source_docs
        }
