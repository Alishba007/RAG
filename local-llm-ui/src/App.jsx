// frontend/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from "./pages/login";
import Chat from "./pages/Chat/Chat";
import Upload from "./pages/Upload";
import Mainpage from "./pages/Mainpage/Mainpage"

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
        path="/upload"
        element={
          token ? <Upload token={token} /> : <Navigate to="/login" />
        }
      />

      <Route
        path="/chat"
        element={
          // token ? <Chat token={token} setToken={setToken} /> : <Navigate to="/login" />
          token ? <Mainpage token={token} setToken={setToken} /> : <Navigate to="/login" />
        }
      />

      <Route path="/" element={<Navigate to="/upload" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;