import React from "react";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./navbar.css"; // IMPORTANT: add this

export default function AppNavbar() {
  return (
    <Navbar expand="lg" className=" custom-navbar" variant="dark">
      <Container>
        <Navbar.Brand href="/" className="brand-white">
          <img
            src="https://images.unsplash.com/photo-1674027444485-cec3da58eef4?q=80&w=1332&auto=format&fit=crop"
            height="32"
            width="32"
            alt="Logo"
            className="brand-logo"
          />
          <span className="ms-2 brand-text">Brainly</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#" className="nav-white">
              Dashboard
            </Nav.Link>
          </Nav>

          <div className="d-flex align-items-center">
            <Button className="signup-btn">
              Sign up
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
