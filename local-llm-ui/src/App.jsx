// frontend/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'; 
import Login from "./pages/Login/login";

import Mainpage from "./pages/Mainpage/Mainpage"
import './App.css'

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  return (
    <div className="hero">
    <Routes>
      <Route
        path="/login"
        element={<Login setToken={setToken} />}
      />

      
      <Route
        path="/"
        element={

          token ? <Mainpage token={token} setToken={setToken} /> : <Navigate to="/login" />
        }
      />

      
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
    </div>
  );
}

export default App;