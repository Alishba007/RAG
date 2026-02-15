import { useState, useRef } from "react";

const Chat = ({ token }) => {
  const [messages, setMessages] = useState([]); // Chat history
  const [input, setInput] = useState("");       // User input
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
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

      const data = await response.json(); // properly parse JSON

      if (response.ok) {
        setMessages(prev => [...prev, { type: "bot", text: data.reply || "No reply" }]);
      } else {
        setMessages(prev => [...prev, { type: "bot", text: `❌ Error: ${data.error || data.detail}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { type: "bot", text: `❌ Network error: ${err.message}` }]);
    } finally {
      setInput(""); // clear input after sending
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
        setMessages(prev => [
          ...prev,
          { type: "system", text: `✅ Upload successful! ${data.details?.chunks || 1} chunks added.` },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { type: "system", text: `❌ Upload failed: ${data.error || data.detail}` },
        ]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { type: "system", text: `❌ Upload error: ${err.message}` }]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg max-w-md ${
              msg.type === "user"
                ? "self-end bg-blue-500 text-white"
                : msg.type === "bot"
                ? "self-start bg-gray-200 text-black"
                : "self-center bg-green-100 text-green-800"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="p-4 flex items-center gap-2 bg-white border-t">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg"
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: "none" }}
          accept=".pdf,.docx,.txt"
        />

        <button
          onClick={() => fileInputRef.current.click()}
          className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          disabled={uploading}
        >
          📎
        </button>

        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
