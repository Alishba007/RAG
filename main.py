from langchain_ollama import OllamaLLM

llm = OllamaLLM(model="llama3.1")

print("Type 'exit' or 'quit' to stop.\n")

while True:
    prompt = input("You: ").strip()
    if prompt.lower() in {"exit", "quit"}:
        print("Bot: Goodbye.")
        break

    response = llm.invoke(prompt)
    print("Bot:", response)
