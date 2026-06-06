import React, { useState, useEffect } from "react";
import "./Sidebar.css";

const Sidebar = ({
  token,
  conversations,
  currentConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onLogout,
  onUpdateConversationTitle,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleNewChat = async () => {
    setLoading(true);
    await onCreateConversation();
    setLoading(false);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  return (
    <div className={`chat-sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Toggle Button */}
      {/* <button
        onClick={() => setIsOpen(!isOpen)}
        className="sidebar-toggle"
        title={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? "◀" : "▶"}
      </button> */}

      {isOpen && (
        <>
          {/* Header */}
          <div className="sidebar-header">
            <div className="logo-section">
               <img
                  src="https://plus.unsplash.com/premium_photo-1681487975579-3cb90dbe46a3?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Black Brain Logo"
                   className="sidebar-logo"
                />
             <div className="logo-text">
                <h2>Black Brain</h2>
                <p>Document Q&A</p>
              </div>
            </div>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="new-chat-btn"
            disabled={loading}
          >
            + New Chat
          </button>

          {/* Conversations List */}
          <div className="conversations-container">
            <h3 className="conversations-title">Conversations</h3>

            {conversations.length === 0 ? (
              <div className="no-conversations">
                <p>No conversations yet</p>
                <small>Start a new chat to begin</small>
              </div>
            ) : (
              <div className="conversations-list">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`conversation-item ${
                      currentConversationId === conv.id ? "active" : ""
                    }`}
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    <div className="conversation-content">
                      <p className="conversation-title" title={conv.title}>
                        {conv.title}
                      </p>
                      <span className="conversation-date">
                        {formatDate(conv.created_at)}
                      </span>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            `Delete this conversation?`
                          )
                        ) {
                          onDeleteConversation(conv.id);
                        }
                      }}
                      title="Delete conversation"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="sidebar-footer">
            <button onClick={onLogout} className="logout-btn">
              
              <span>Logout</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
