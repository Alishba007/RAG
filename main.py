import os
from langchain_ollama import OllamaLLM
from docx import Document
import PyPDF2

llm = OllamaLLM(model="llama3.1")

OUTPUT_FOLDER = "summaries"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def read_file(filepath):
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
                text += page.extract_text() + "\n"
        return text
    else:
        raise ValueError("Unsupported file type. Only .txt, .docx, and .pdf are supported.")

def summarize_file(filepath):
    try:
        content = read_file(filepath)
    except Exception as e:
        return f"Error reading file: {e}", None

    prompt = f"Summarize this text:\n{content}"
    summary = llm.invoke(prompt)
    
    output_path = os.path.join(OUTPUT_FOLDER, os.path.basename(filepath) + "_summary.txt")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(summary)
    
    return summary, output_path

# Main chat loop
while True:
    prompt = input("You: ")
    if prompt.lower() in ["exit", "quit"]:
        break
    
    if os.path.isfile(prompt):
        summary, path = summarize_file(prompt)
        if path:
            print(f"Bot: I have summarized the file '{os.path.basename(prompt)}'.")
            print("Summary:", summary)
            print(f"(Saved to {path})")
        else:
            print(f"Bot: {summary}")
        continue
    
    response = llm.invoke(prompt)
    print("Bot:", response)
