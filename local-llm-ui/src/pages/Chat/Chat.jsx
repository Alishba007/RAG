// frontend/src/pages/Chat.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ChatMessage from "../../components/ChatMessage"; // Loveable component
import Sidebar from "../../components/Sidebar"; // Loveable component

const Chat = ({ token, setToken }) => {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Load user's documents
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await fetch("http://localhost:8000/documents", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setDocuments(data.files || []);
        }
      } catch (error) {
        console.error("Error loading documents:", error);
      }
    };
    
    if (token) {
      loadDocuments();
    }
  }, [token]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    
    // Add user message to chat
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: userMessage,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    }]);
    
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add AI response to chat
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: data.reply,
          isUser: false,
          timestamp: new Date().toLocaleTimeString(),
          isAi: true,
        }]);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
        navigate("/login");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <Sidebar 
        documents={documents}
        onUploadClick={() => navigate("/upload")}
        onLogout={handleLogout}
      />

      {/* Main Chat Area */}
      <div className="ml-64 p-6"> {/* Adjust ml based on sidebar width */}
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Document Q&A</h1>
            <p className="text-gray-600">Ask questions about your uploaded documents</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/upload")}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              + Upload Documents
            </button>
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="bg-white rounded-2xl shadow-lg p-6 h-[70vh] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
              <p className="text-center max-w-md">
                Upload documents and ask questions about them. Try asking about specific topics in your documents.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                  isAi={message.isAi}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="mt-6">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question about your documents..."
              className="flex-1 px-6 py-4 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Thinking...
                </div>
              ) : (
                "Send"
              )}
            </button>
          </form>
          
          {/* Quick Prompts */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setInputMessage("Summarize the main topics")}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
            >
              Summarize main topics
            </button>
            <button
              onClick={() => setInputMessage("Find key points about")}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
            >
              Find key points
            </button>
            <button
              onClick={() => setInputMessage("Explain the main concepts")}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
            >
              Explain concepts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;