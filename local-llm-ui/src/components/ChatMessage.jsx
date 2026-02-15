const ChatMessage = ({ message, isUser, timestamp, isAi }) => {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[70%] rounded-2xl p-4 ${
          isUser
            ? "bg-blue-500 text-white rounded-br-none"
            : isAi
            ? "bg-gradient-to-r from-purple-100 to-pink-100 text-gray-800 rounded-bl-none"
            : "bg-gray-100 text-gray-800 rounded-bl-none"
        }`}
      >
        <div className="flex items-center mb-1">
          {isAi && (
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-xs">AI</span>
            </div>
          )}
          <span className="text-xs opacity-70">
            {isUser ? "You" : isAi ? "Assistant" : "System"} • {timestamp}
          </span>
        </div>
        <p className="whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
};

export default ChatMessage;