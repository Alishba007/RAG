# backend/file_processor.py
import os
from docx import Document
import PyPDF2

def read_file(filepath: str) -> str:
    """Read content from various file types"""
    ext = os.path.splitext(filepath)[1].lower()
    
    if ext == ".txt":
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    
    elif ext == ".docx":
        doc = Document(filepath)
        return "\n".join([p.text for p in doc.paragraphs])
    
    elif ext == ".pdf":
        text = ""
        with open(filepath, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() or ""
        return text
    
    else:
        raise ValueError(f"Unsupported file type: {ext}")

def process_file(file_path: str, output_dir: str = "processed"):
    """Process file and return summary"""
    content = read_file(file_path)
    return content