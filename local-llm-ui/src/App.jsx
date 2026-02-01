import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/login";
import Chat from "./pages/Chat/Chat";

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login setToken={setToken} />}
      />

      <Route
        path="/chat"
        element={
          token ? <Chat token={token} setToken={setToken}/> : <Navigate to="/login" />
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
