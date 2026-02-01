import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username,password }),
    });

    console.log("Response status:", res.status); //Debug

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText); // Debug
        alert("Request failed");
        return;
    }

    const data = await res.json();
    console.log("Token received:", data.token); // Debug
    localStorage.setItem("token", data.token);
    setToken(data.token);
    navigate("/chat");
    
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        placeholder="Username"
        onChange={e => setUsername(e.target.value)}
      />
      <input
         placeholder="Password"
         type="password"
         onChange={e => setPassword(e.target.value)}
       />

      <button onClick={login}>Login</button>
    </div>
  );
}

export default Login;
