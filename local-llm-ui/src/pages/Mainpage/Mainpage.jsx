import { useState, useRef } from "react";
import Navbar from '../../components/Navbar/navbar';
import Animated_Cards from '../../components/Animated_Cards/Animated_Cards'
import './Mainpage.css'
const Chat = ({ token }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const handleSendMessage = async () => {
  if (!input.trim()) return;

  if (!hasStartedChat) {
    setHasStartedChat(true);
  }

  const userMessage = input;

  setMessages(prev => [...prev, { type: "user", text: userMessage }]);

  setInput("");

  try {
    const response = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMessage })
    });

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let botMessage = "";

    // create empty bot message first
    setMessages(prev => [...prev, { type: "bot", text: "" }]);

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);
      botMessage += chunk;

      // update last message live
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          type: "bot",
          text: botMessage
        };
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
        setMessages(prev => [...prev, { type: "system", text: `✅ Upload successful! ${data.details?.chunks || 1} chunks added.` }]);
      } else {
        setMessages(prev => [...prev, { type: "system", text: `❌ Upload failed: ${data.error || data.detail}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { type: "system", text: `❌ Upload error: ${err.message}` }]);
    } finally {
      setUploading(false);
    }
  };

 return (
  <div>
    
  <section className="vh-100  text-white d-flex flex-column overflow-hidden">
    <Navbar/>
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



    <div className="container-fluid flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>


      {/* Messages */}
      <div className="flex-grow-1 overflow-auto p-3 white-space: pre-wrap">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`d-flex ${
              msg.type === "user"
                ? "justify-content-end"
                : "justify-content-start"
            } mb-3`}
          >
            <div
              className={`p-3 rounded-4 ${
                msg.type === "user"
                  ? "bg-primary text-white"
                  : "bg-secondary text-white"
              }`}
              style={{ maxWidth: "60%" }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 border-top border-secondary">
        <div className="d-flex align-items-center">

          <input
            type="text"
            className="form-control form-control-lg me-2 bg-dark text-white border-secondary chat-input"
            placeholder="Type message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleSendMessage()
            }
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

          <button
            className="btn btn-primary chat-btn"
            onClick={handleSendMessage}
          >
            Send
          </button>

        </div>
      </div>

    </div>
  </section>




  



  </div>
);



};

export default Chat;
