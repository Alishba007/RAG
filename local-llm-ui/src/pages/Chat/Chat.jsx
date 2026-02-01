import { useState, useEffect } from "react";

function Chat({ token, setToken }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    window.location.href = "/login";
  };

  // 🔐 Verify token ONCE when Chat loads
  useEffect(() => {
    if (!token) {
      logout();
      return;
    }

    fetch("http://localhost:8000/verify-token", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      if (res.status === 401) {
        logout();
      }
    });
  }, [token]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input }),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.reply },
      ]);

      setInput("");
    } catch (err) {
      console.error("Chat error:", err);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Local LLM Chat</h2>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "auto",
        }}
      >
        {messages.map((m, i) => (
          <p key={i}>
            <b>{m.role}:</b> {m.text}
          </p>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type message"
        style={{ width: "80%" }}
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chat;
