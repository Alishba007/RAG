import requests
from .base import BaseLLM

class OllamaProvider(BaseLLM):
    def __init__(self, model):
        self.model = model
        self.url = "http://localhost:11434/api/generate"

    def generate(self, prompt):
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }

        response = requests.post(self.url, json=payload)
        return response.json()["response"]

    def stream(self, prompt):
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": True
        }

        response = requests.post(self.url, json=payload, stream=True)

        for line in response.iter_lines():
            if line:
                data = line.decode("utf-8")
                if '"response"' in data:
                    import json
                    token = json.loads(data)["response"]
                    yield token
