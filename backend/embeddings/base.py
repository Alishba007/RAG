class BaseEmbedding:
    def embed_documents(self, texts):
        raise NotImplementedError

    def embed_query(self, text):
        raise NotImplementedError
