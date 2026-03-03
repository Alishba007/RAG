from langchain_ollama import OllamaLLM
from .base import BaseLLM

class OllamaProvider(BaseLLM):
    def __init__(self, model="llama3.1"):
        self.model = OllamaLLM(model=model)

    def generate(self, prompt: str) -> str:
        return self.model.invoke(prompt)
