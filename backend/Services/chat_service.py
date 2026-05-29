# backend/Services/chat_service.py

import psycopg2
from psycopg2.extras import RealDictCursor
import os
import uuid
from datetime import datetime
import json

class ChatService:
    def __init__(self):
        self.db_config = {
            "host": os.getenv("SUPABASE_HOST"),
            "database": os.getenv("SUPABASE_DB"),
            "user": os.getenv("SUPABASE_USER"),
            "password": os.getenv("SUPABASE_PASSWORD"),
            "port": 5432,
            "sslmode": "require"
        }
    
    def get_db_conn(self):
        """Create database connection"""
        conn = psycopg2.connect(**self.db_config)
        conn.autocommit = True
        return conn
    
    # --------- CONVERSATIONS ---------
    
    def create_conversation(self, user_id: str, title: str = None) -> dict:
        """Create a new conversation"""
        conv_id = str(uuid.uuid4())
        if not title:
            title = f"Chat {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        
        conn = self.get_db_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO conversations (id, user_id, title, created_at, updated_at) 
                       VALUES (%s, %s, %s, NOW(), NOW())""",
                    (conv_id, user_id, title)
                )
            return {"id": conv_id, "title": title, "created_at": datetime.now().isoformat()}
        finally:
            conn.close()
    
    def get_user_conversations(self, user_id: str, limit: int = 20) -> list:
        conn = self.get_db_conn()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """SELECT id, title, created_at, updated_at 
                    FROM conversations 
                    WHERE user_id = %s 
                    ORDER BY updated_at DESC 
                    LIMIT %s""",
                    (user_id, limit)
                )
                rows = cur.fetchall()
            # ✅ Convert to plain dicts with serializable dates
                result = []
                for row in rows:
                    r = dict(row)
                    r['created_at'] = r['created_at'].isoformat() if r.get('created_at') else None
                    r['updated_at'] = r['updated_at'].isoformat() if r.get('updated_at') else None
                    result.append(r)
                return result
        finally:
            conn.close()
    
    def get_conversation_details(self, conversation_id: str, user_id: str) -> dict:
        conn = self.get_db_conn()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """SELECT id, title, created_at, updated_at 
                    FROM conversations 
                    WHERE id = %s AND user_id = %s""",
                    (conversation_id, user_id)
                )
                conv = cur.fetchone()
                if not conv:
                    return None

                cur.execute(
                    """SELECT id, role, content, source_documents, created_at 
                    FROM chat_messages 
                    WHERE conversation_id = %s 
                    ORDER BY created_at ASC""",
                    (conversation_id,)
                )
                messages = cur.fetchall()

            # ✅ Convert to plain dicts so FastAPI can serialize them
                conv = dict(conv)
                conv['created_at'] = conv['created_at'].isoformat() if conv.get('created_at') else None
                conv['updated_at'] = conv['updated_at'].isoformat() if conv.get('updated_at') else None

                clean_messages = []
                for msg in messages:
                    m = dict(msg)
                    m['created_at'] = m['created_at'].isoformat() if m.get('created_at') else None
                    if m.get('source_documents') and isinstance(m['source_documents'], str):
                        try:
                            m['source_documents'] = json.loads(m['source_documents'])
                        except:
                            m['source_documents'] = None
                    clean_messages.append(m)

                return {
                    "conversation": conv,
                    "messages": clean_messages
                }
        finally:
            conn.close()
    
    # --------- MESSAGES ---------
    
    def add_message(self, conversation_id: str, user_id: str, role: str, 
                   content: str, source_documents: list = None) -> dict:
        """Add a message to conversation"""
        msg_id = str(uuid.uuid4())
        source_json = json.dumps(source_documents) if source_documents else None
        
        conn = self.get_db_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO chat_messages 
                       (id, conversation_id, user_id, role, content, source_documents, created_at) 
                       VALUES (%s, %s, %s, %s, %s, %s, NOW())""",
                    (msg_id, conversation_id, user_id, role, content, source_json)
                )
                
                # Update conversation updated_at
                cur.execute(
                    """UPDATE conversations 
                       SET updated_at = NOW() 
                       WHERE id = %s""",
                    (conversation_id,)
                )
            
            return {
                "id": msg_id,
                "role": role,
                "content": content,
                "source_documents": source_documents,
                "created_at": datetime.now().isoformat()
            }
        finally:
            conn.close()
    
    def get_conversation_history(self, conversation_id: str, user_id: str, 
                                limit: int = 10) -> list:
        """Get recent messages from conversation for context"""
        conn = self.get_db_conn()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """SELECT role, content 
                       FROM chat_messages 
                       WHERE conversation_id = %s AND user_id = %s 
                       ORDER BY created_at DESC 
                       LIMIT %s""",
                    (conversation_id, user_id, limit)
                )
                messages = cur.fetchall()
                # Return in chronological order
                return list(reversed(messages))
        finally:
            conn.close()
    
    def delete_conversation(self, conversation_id: str, user_id: str) -> bool:
        """Delete a conversation and its messages"""
        conn = self.get_db_conn()
        try:
            with conn.cursor() as cur:
                # Messages will be deleted via ON DELETE CASCADE
                cur.execute(
                    """DELETE FROM conversations 
                       WHERE id = %s AND user_id = %s""",
                    (conversation_id, user_id)
                )
            return True
        finally:
            conn.close()