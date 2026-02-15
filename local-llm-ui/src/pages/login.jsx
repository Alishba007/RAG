// frontend/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const Login = ({ setToken }) => {
  const [show, setShow] = useState(true);
  const [isSignup, setIsSignup] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const isFormValid = () => {
    if (!username.trim() || !password.trim()) return false;
    if (password.length < 6) return false;
    if (isSignup && password !== confirmPassword) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError("Please fix form errors.");
      return;
    }

    setLoading(true);
    setError("");

    const endpoint = isSignup
      ? "http://localhost:8000/signup"
      : "http://localhost:8000/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail);

      if (!isSignup) {
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
        setShow(false);
        navigate("/upload");
      } else {
        setIsSignup(false);
        setConfirmPassword("");
        setError("Signup successful. Please login.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="vh-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1508780709619-79562169bc64')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Modal show={show} centered backdrop="static">
        <Modal.Header>
          <Modal.Title>
            {isSignup ? "Create Account" : "Login"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && (
            <div className="alert alert-danger py-2">
              {error}
            </div>
          )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            {isSignup && (
              <Form.Group className="mb-3">
                <Form.Control
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer className="d-flex flex-column">
          <Button
            variant="primary"
            className="w-100 mb-2"
            disabled={!isFormValid() || loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : isSignup ? (
              "Sign Up"
            ) : (
              "Login"
            )}
          </Button>

          <Button
            variant="link"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
              setPassword("");
              setConfirmPassword("");
            }}
          >
            {isSignup
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Login;
