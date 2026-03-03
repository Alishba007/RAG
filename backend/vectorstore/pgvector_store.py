import os
import psycopg2
from psycopg2.extras import execute_values
from .base import BaseVectorStore
from dotenv import load_dotenv
load_dotenv()

class PGVectorStore(BaseVectorStore):
    def __init__(self, embedding):
        self.embedding = embedding
        self.conn = psycopg2.connect(
             host=os.getenv("SUPABASE_HOST"),
            database=os.getenv("SUPABASE_DB"),
            user=os.getenv("SUPABASE_USER"),
            password=os.getenv("SUPABASE_PASSWORD"),
            port=5432,
            sslmode="require"
        )

        self.conn.autocommit = True

    def add_documents(self, documents):
        texts = [doc.page_content for doc in documents]
        embeddings = self.embedding.embed_documents(texts)

        values = [
            (
                doc.metadata["user"],
                doc.metadata["source"],
                doc.metadata["chunk_id"],
                doc.page_content,
                embedding
            )
            for doc, embedding in zip(documents, embeddings)
        ]

        with self.conn.cursor() as cur:
            execute_values(
                cur,
                """
                insert into documents
                (user_id, source, chunk_id, content, embedding)
                values %s
                """,
                values
            )

    def search(self, query: str, k: int, user: str):
        query_embedding = self.embedding.embed_query(query)

        with self.conn.cursor() as cur:
            cur.execute(
                """
                select source, chunk_id, content,
                embedding <-> %s::vector as distance
                from documents
                where user_id = %s
                order by embedding <-> %s::vector
                limit %s;
                """,
                (query_embedding, user, query_embedding, k)
            )

            rows = cur.fetchall()

        return [
            {
                "page_content": row[2],
                "metadata": {
                    "source": row[0],
                    "chunk_id": row[1]
                }
            }
            for row in rows
        ]
