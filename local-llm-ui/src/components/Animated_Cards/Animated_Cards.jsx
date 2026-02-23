import React from "react";
import "./Animated_Cards.css";

export default function AnimatedCard({ title, description, onClick }) {
  return (
    <div className="animated-border-wrapper" onClick={onClick}>
      <div className="card custom-card">
        <div className="card-body text-white">
          <h5 className="card-title">{title}</h5>
          <p className="card-text">{description}</p>
        </div>
      </div>
    </div>
  );
}
