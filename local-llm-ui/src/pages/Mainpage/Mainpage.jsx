import { useState } from "react";
import "./Mainpage.css";

function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello. I am your AI assistant." }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", content: input }
    ];
    setMessages(newMessages);
    setInput("");

    // MOCK RESPONSE (replace with real API)
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "This is a mock response." }
      ]);
    }, 800);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">ChatGPT Replica</div>

      <div className="chat-body">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role}`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Send a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
