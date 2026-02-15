import { useState } from "react";

const FileUpload = ({ onFileSelect, onDragOver, onDrop, files, onRemoveFile, uploadProgress }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      onFileSelect(e.target.files);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Drag & Drop Area */}
      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={(e) => {
          handleDragEnter(e);
          onDragOver && onDragOver(e);
        }}
        onDragLeave={handleDragLeave}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            onFileSelect(e.dataTransfer.files);
          }
          onDrop && onDrop(e);
        }}
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
          <span className="text-3xl">📁</span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Drag & Drop Files Here
        </h3>
        <p className="text-gray-600 mb-6">
          Or click to browse files from your computer
        </p>
        
        <label className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold cursor-pointer hover:opacity-90">
          Browse Files
          <input
            type="file"
            className="hidden"
            onChange={handleFileInput}
            multiple
            accept=".pdf,.docx,.txt"
          />
        </label>
        
        <p className="text-sm text-gray-500 mt-4">
          Supports: PDF, DOCX, TXT (Max 50MB each)
        </p>
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Selected Files ({files.length})
          </h4>
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-gray-600">
                      {file.type.includes("pdf") ? "📕" : 
                       file.type.includes("word") ? "📘" : "📝"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Upload Progress */}
                  {uploadProgress[file.id] !== undefined && (
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress[file.id]}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  {file.status === "success" && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      ✓ Uploaded
                    </span>
                  )}
                  
                  {file.status === "error" && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      ✗ Error
                    </span>
                  )}
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveFile(file.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;