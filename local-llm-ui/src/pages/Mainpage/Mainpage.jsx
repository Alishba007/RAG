import { useState, useRef } from "react";
import Navbar from '../../components/Navbar/navbar';

const Chat = ({ token }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { type: "user", text: input }]);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, { type: "bot", text: data.reply || "No reply" }]);
      } else {
        setMessages(prev => [...prev, { type: "bot", text: `❌ ${data.error || data.detail}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { type: "bot", text: `❌ Network error: ${err.message}` }]);
    } finally {
      setInput("");
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

    <div className="container-fluid flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>


      {/* Messages */}
      <div className="flex-grow-1 overflow-auto p-4">
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
            className="form-control form-control-lg me-2 bg-dark text-white border-secondary"
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
            className="btn btn-outline-light me-2"
            onClick={() => fileInputRef.current.click()}
          >
            📎
          </button>

          <button
            className="btn btn-primary"
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
