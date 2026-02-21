import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./App.css";

import Login from "./pages/Login/login";
import Mainpage from "./pages/Mainpage/Mainpage";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/verify_token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          setToken(null);
        }
      } catch (err) {
        localStorage.removeItem("token");
        setToken(null);
      }

      setLoading(false);
    };

    verifyToken();
  }, [token]);

  if (loading) return null; // or spinner

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
            token ? (
              <Mainpage token={token} setToken={setToken} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
