# 🧠 RAG (Retrieval-Augmented Generation) System

A comprehensive **full-stack Retrieval-Augmented Generation** application combining a **FastAPI backend** with a **React frontend** for intelligent document-based Q&A. Process documents, store embeddings, and ask context-aware questions powered by local LLMs.

## 🎯 What is RAG?

**RAG (Retrieval-Augmented Generation)** combines:
- **Retrieval**: Extract relevant documents/context from a knowledge base
- **Augmentation**: Enhance the LLM with retrieved context
- **Generation**: Generate answers grounded in the context

This enables LLMs to answer questions about your documents without needing to fine-tune the model.

## ✨ Features

### 🔍 **Document Processing**
- Upload and process multiple document types (PDF, DOCX, TXT)
- Automatic text extraction and chunking
- Smart document indexing

### 🗂️ **Vector Storage & Retrieval**
- **FAISS** - CPU-based vector search (fast & efficient)
- **ChromaDB** - Alternative vector database option
- Semantic search using sentence transformers
- Persistent vector store for knowledge base

### 🤖 **AI Capabilities**
- **Ollama Integration** - Run models locally (Llama, Mistral, etc.)
- **LangChain Framework** - Orchestrate LLM workflows
- Context-aware question answering
- Document summarization

### 🔐 **Security & Authentication**
- JWT token-based authentication
- User management with bcrypt password hashing
- Secure API endpoints with role-based access

### 💾 **Database**
- **Supabase** - PostgreSQL backend for user/document metadata
- Scalable and reliable data persistence

### 🎨 **User Interface**
- **React + Vite** - Modern, fast frontend
- **React Bootstrap** - Responsive UI components
- **Tailwind CSS** - Utility-first styling
- Intuitive document upload and Q&A interface

### 📡 **Backend API**
- **FastAPI** - High-performance Python web framework
- RESTful API design
- Automatic API documentation (Swagger UI)

## 🏗️ Architecture

```
RAG System
├── Frontend (React)
│   ├── Document Upload UI
│   ├── Q&A Chat Interface
│   ├── Document Management
│   └── User Authentication
│
├── Backend (FastAPI)
│   ├── Document Processing
│   ├── Vector Store Management
│   ├── RAG Pipeline
│   ├��─ Authentication Service
│   └── Database Integration
│
├── Vector Store (FAISS/ChromaDB)
│   └── Embedded Documents
│
└── LLM (Ollama - Local)
    └── Inference Engine
```

## 📋 Prerequisites

### Backend
- **Python 3.8+**
- **Ollama** installed and running
- A local LLM model (e.g., `ollama pull llama2`)

### Frontend
- **Node.js 16+**
- **npm** or **yarn**

### Databases
- **Supabase Account** (free tier available)
- SQLite (local alternative)

## 🚀 Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Alishba007/RAG
cd RAG
```

### 2️⃣ Backend Setup

#### Install Python Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure Supabase

Create a `.env` file in the root directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# JWT Configuration
JWT_SECRET_KEY=your_secret_key
ALGORITHM=HS256

# Ollama Configuration
OLLAMA_MODEL=llama2
OLLAMA_BASE_URL=http://localhost:11434

# Vector Store
VECTOR_STORE_PATH=./vector_store
```

#### Start Backend Server

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend API available at: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 3️⃣ Frontend Setup

```bash
cd local-llm-ui

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend available at: `http://localhost:5173`

### 4️⃣ Verify Ollama

Ensure Ollama is running:

```bash
# Check Ollama status
ollama list

# Run a model
ollama run llama2

# Pull a specific model (if needed)
ollama pull mistral
```

## 💻 Usage Guide

### Upload Documents

1. Open the application at `http://localhost:5173`
2. Navigate to "Upload Documents"
3. Select files (PDF, DOCX, TXT)
4. Click "Upload"
5. Documents are processed and indexed

### Ask Questions

1. Go to "Ask a Question" section
2. Type your question
3. System retrieves relevant document chunks
4. LLM generates context-aware answer
5. View source documents used

### Manage Documents

- View all uploaded documents
- Delete documents
- Re-index documents
- View document statistics

## 📂 Project Structure

```
RAG/
├── backend/
│   ├── main.py                    # FastAPI application
│   ├── auth.py                    # Authentication logic
│   ├── models.py                  # Database models
│   ├── rag_pipeline.py            # RAG implementation
│   ├── document_processor.py      # Document handling
│   └── requirements.txt
│
├── local-llm-ui/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DocumentUpload.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── DocumentList.jsx
│   │   │   └── LoginForm.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   └── api.js            # API integration
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── vector_store/                  # FAISS/ChromaDB storage
├── summaries/                     # Generated summaries
├── requirements.txt               # Python dependencies
├── .env.example                   # Environment template
└── README.md
```

## 🔧 Configuration

### Switch Vector Store

#### Use FAISS (Default - CPU)

```python
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings()
vector_store = FAISS.from_documents(documents, embeddings)
```

#### Use ChromaDB (GPU-friendly)

```python
from langchain_community.vectorstores import Chroma

vector_store = Chroma.from_documents(
    documents,
    embeddings,
    persist_directory="./vector_store"
)
```

### Change LLM Model

Edit `.env`:

```env
OLLAMA_MODEL=mistral      # Faster
OLLAMA_MODEL=neural-chat  # Balanced
OLLAMA_MODEL=orca-mini    # Lightweight
```

## 📊 Supported Document Types

| Format | Support | Details |
|--------|---------|---------|
| **PDF** | ✅ | Text extraction from pages |
| **DOCX** | ✅ | Word document paragraphs |
| **TXT** | ✅ | Plain text files |
| **PPT** | ⚠️ | In development |
| **Excel** | ⚠️ | In development |

## 🧪 Example Workflow

### Step 1: Upload Document
```
Upload: research_paper.pdf
Status: ✅ Processed (pages: 15, chunks: 245)
```

### Step 2: Ask Question
```
User: "What are the main findings?"
System: Retrieves 5 most relevant chunks
LLM: Generates comprehensive answer
Source: [Pages 8-10, 15]
```

### Step 3: Follow-up Questions
```
User: "How does this compare to previous work?"
System: Uses conversation history + context
LLM: Provides comparative analysis
```

## 🐛 Troubleshooting

### Issue: "Connection refused" to Ollama

**Solution**: Start Ollama:
```bash
ollama serve
```

### Issue: "Vector store not found"

**Solution**: Upload documents first or rebuild index:
```bash
python backend/rebuild_index.py
```

### Issue: CORS errors in frontend

**Solution**: Ensure backend CORS is configured:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Out of memory with large documents

**Solution**: Adjust chunk size in config:
```python
CHUNK_SIZE = 512  # Reduce from 1000
CHUNK_OVERLAP = 100
```

## 📈 Performance Tips

- **Use FAISS** for fast similarity search
- **Smaller chunks** (256-512 tokens) for accuracy
- **Rerank results** before feeding to LLM
- **Cache embeddings** for frequently accessed documents
- **Use lightweight models** (Mistral, Phi) for speed
- **Batch process** documents for efficiency

## 📚 Tech Stack

### Backend
- **FastAPI** - Web framework
- **LangChain** - LLM orchestration
- **FAISS** - Vector search
- **ChromaDB** - Alternative vector store
- **Sentence Transformers** - Embedding generation
- **Ollama** - Local LLM inference
- **Supabase** - Database
- **FastAPI-JWT** - Authentication

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Bootstrap** - UI components
- **Tailwind CSS** - Styling

## 🔐 Security Considerations

- ✅ Use strong JWT secrets
- ✅ Enable HTTPS in production
- ✅ Validate file uploads
- ✅ Rate limit API endpoints
- ✅ Use environment variables for secrets
- ✅ Implement rate limiting
- ✅ Add CSRF protection
- ✅ Regular security updates

## 🚢 Deployment

### Backend (Heroku/Railway)

```bash
# Create Procfile
echo "web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT" > Procfile

# Deploy
git push heroku main
```

### Frontend (Vercel/Netlify)

```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod
```

### Docker Deployment

```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

## 📚 Learning Resources

- [LangChain Documentation](https://python.langchain.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [FAISS GitHub](https://github.com/facebookresearch/faiss)
- [Ollama Models](https://ollama.ai/library)
- [RAG Concepts](https://huggingface.co/docs/transformers/en/tasks/question_answering)

## 📈 Future Enhancements

- [ ] Multi-user document sharing
- [ ] Advanced document analytics
- [ ] Real-time collaboration
- [ ] Conversation history
- [ ] Document versioning
- [ ] Custom prompts/templates
- [ ] Model fine-tuning pipeline
- [ ] Web interface improvements
- [ ] Cost tracking & analytics
- [ ] API rate limiting

## 📝 License

MIT License - See LICENSE file

## 🤝 Contributing

Contributions welcome:

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request


