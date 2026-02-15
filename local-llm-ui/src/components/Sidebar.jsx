import { useState } from "react";

const Sidebar = ({ documents = [], onUploadClick, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white shadow-xl transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center shadow-md"
      >
        {isCollapsed ? "→" : "←"}
      </button>

      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">R</span>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold text-gray-800">RAG Chat</h2>
              <p className="text-xs text-gray-500">Document Q&A</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4">
        {!isCollapsed && (
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Navigation
          </h3>
        )}
        
        <button
          onClick={onUploadClick}
          className="flex items-center w-full p-3 mb-2 rounded-lg hover:bg-blue-50 text-gray-700"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600">📤</span>
          </div>
          {!isCollapsed && <span className="ml-3">Upload Documents</span>}
        </button>

        <button className="flex items-center w-full p-3 mb-2 rounded-lg hover:bg-blue-50 text-gray-700">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600">💬</span>
          </div>
          {!isCollapsed && <span className="ml-3">Chat</span>}
        </button>
      </div>

      {/* Documents Section */}
      {!isCollapsed && documents.length > 0 && (
        <div className="p-4 border-t">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Your Documents ({documents.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center p-2 rounded hover:bg-gray-50"
              >
                <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center mr-2">
                  <span className="text-xs">📄</span>
                </div>
                <span className="text-sm truncate">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <button
          onClick={onLogout}
          className="flex items-center w-full p-3 rounded-lg hover:bg-red-50 text-red-600"
        >
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <span className="text-red-600">🚪</span>
          </div>
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;