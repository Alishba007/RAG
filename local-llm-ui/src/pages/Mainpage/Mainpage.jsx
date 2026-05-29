import { useState, useRef, useEffect } from "react";
import Navbar from '../../components/Navbar/navbar';
import Animated_Cards from '../../components/Animated_Cards/Animated_Cards';
import Sidebar from "../../components/Sidebar/sidebar";
import './Mainpage.css';

const Chat = ({ token }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [hasStartedChat, setHasStartedChat] = useState(false);

  // ✅ Conversation state
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  // ✅ Fetch conversations from backend on load
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:8000/conversations", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setConversations(data.conversations || []))
      .catch(err => console.error("Failed to load conversations:", err));
  }, [token]);

  // ✅ Create conversation in backend
  const handleCreateConversation = () => {
  setCurrentConversationId(null);
  setMessages([]);
  setHasStartedChat(false);
};

  // ✅ Select conversation and load its messages
 // ✅ Load messages properly when clicking a conversation
const handleSelectConversation = async (id) => {
  if (id === currentConversationId) return;

  setCurrentConversationId(id);
  setHasStartedChat(true);

  try {
    const res = await fetch(`http://localhost:8000/conversations/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      setMessages([]);
      setConversations(prev => prev.filter(c => c.id !== id));
      return;
    }

    const data = await res.json();
    
    // ✅ Check both possible response shapes from your backend
    const msgs = data.messages || data.history || [];
    const mapped = msgs.map(m => ({
      type: m.role === "user" ? "user" : "bot",
      text: m.content
    }));
    setMessages(mapped);

  } catch (err) {
    console.error("Failed to load conversation:", err);
  }
};

  // ✅ Delete conversation from backend
  const handleDeleteConversation = async (id) => {
    await fetch(`http://localhost:8000/conversations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setMessages([]);
      setHasStartedChat(false);
    }
  };

  const handleLogout = () => {
    // your logout logic here
  };

  
 // ✅ Only creates backend conversation on first message
const handleSendMessage = async () => {
  if (!input.trim()) return;
  if (!hasStartedChat) setHasStartedChat(true);

  const userMessage = input;
  setMessages(prev => [...prev, { type: "user", text: userMessage }]);
  setInput("");

  try {
    let convId = currentConversationId;

    // Only create conversation on first message
    if (!convId) {
      const title = userMessage.length > 40
        ? userMessage.slice(0, 40) + "..."
        : userMessage;

      const res = await fetch("http://localhost:8000/conversations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title })
      });
      const newConv = await res.json();
      convId = newConv.id;
      setCurrentConversationId(convId);
      setConversations(prev => [newConv, ...prev]);
    }

    const response = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMessage, conversation_id: convId })
    });

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let botMessage = "";
    setMessages(prev => [...prev, { type: "bot", text: "" }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      botMessage += decoder.decode(value);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { type: "bot", text: botMessage };
        return updated;
      });
    }

  } catch (err) {
    setMessages(prev => [...prev, { type: "bot", text: `❌ ${err.message}` }]);
  }
};

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setUploading(true);
      setMessages(prev => [...prev, { type: "system", text: `Uploading ${file.name}...` }]);
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { type: "system", text: `Upload successful! ${data.details?.chunks || 1} chunks added.` }]);
      } else {
        setMessages(prev => [...prev, { type: "system", text: `Upload failed: ${data.error || data.detail}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { type: "system", text: ` Upload error: ${err.message}` }]);
    } finally {
      setUploading(false);
    }
  };

  return (
  <div style={{ 
    height: "100vh", 
    display: "flex", 
    flexDirection: "column", 
    overflow: "hidden",
    color: "white"
  }}>

    {/* Navbar - shrinks to its natural height */}
    <div style={{ flexShrink: 0 }}>
      <Navbar />
    </div>

    {/* Everything below navbar */}
    <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

      {/* Sidebar */}
      <Sidebar
        token={token}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onCreateConversation={handleCreateConversation}
        onDeleteConversation={handleDeleteConversation}
        onLogout={handleLogout}
        onUpdateConversationTitle={() => {}}
      />

      {/* Right column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>

        {/* Cards - only show when no chat */}
        {!hasStartedChat && messages.length === 0 && (
          <div className="cards-container">
            <Animated_Cards
              title="Ask About your Documents"
              description="Upload PDFs and get summaries instantly."
              onClick={() => setInput("Summarize my uploaded document")}
            />
            <Animated_Cards
              title="Explain Complex Topics"
              description="Break down difficult concepts step by step."
              onClick={() => setInput("Explain quantum computing simply")}
            />
            <Animated_Cards
              title="Generate Ideas"
              description="Brainstorm and refine your thinking."
              onClick={() => setInput("Give me startup ideas")}
            />
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`d-flex ${msg.type === "user" ? "justify-content-end" : "justify-content-start"} mb-3`}
            >
              <div
                className={`p-3 rounded-4 ${msg.type === "user" ? "bg-primary text-white" : "bg-secondary text-white"}`}
                style={{ maxWidth: "60%" }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div className="p-3 border-top border-secondary" style={{ flexShrink: 0 }}>
          <div className="d-flex align-items-center">
            <input
              type="text"
              className="form-control form-control-lg me-2 bg-dark text-white border-secondary chat-input"
              placeholder="Type message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              hidden
              accept=".pdf,.docx,.txt"
            />
            <button
              className="btn btn-outline-light me-2 chat-btn"
              onClick={() => fileInputRef.current.click()}
            >
              📎
            </button>
            <button className="btn btn-primary chat-btn" onClick={handleSendMessage}>
              Send
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
);
};

export default Chat;