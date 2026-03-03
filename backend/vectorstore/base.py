class BaseVectorStore:
    def add_documents(self, documents):
        raise NotImplementedError

    def search(self, query: str, k: int, user: str):
        raise NotImplementedError
