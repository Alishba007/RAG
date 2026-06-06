import React from "react";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./navbar.css";

export default function AppNavbar({ setToken }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Navbar expand="lg" className="custom-navbar" variant="dark">
      <Container>
        <Navbar.Brand href="/" className="brand-white">
          <img
            src="https://plus.unsplash.com/premium_photo-1681487975579-3cb90dbe46a3?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            height="32"
            width="32"
            alt="Logo"
            className="brand-logo"
          />
          <span className="ms-2 brand-text">Black Brain</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#" className="nav-white">
              Dashboard
            </Nav.Link>
          </Nav>

          <div className="d-flex align-items-center">
            <Button className="signup-btn" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
