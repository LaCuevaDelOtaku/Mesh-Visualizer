
import React, { useCallback, useRef } from 'react';

interface FileUploadProps {
  onFileLoad: (content: string, name: string) => void;
  onFileError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoad, onFileError }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.toLowerCase().endsWith('.obj')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            onFileLoad(content, file.name);
          } catch (err) {
            onFileError('Error processing file.');
          }
        };
        reader.onerror = () => {
          onFileError('Failed to read the file.');
        };
        reader.readAsText(file);
      } else {
        onFileError('Invalid file type. Please upload an .obj file.');
      }
    }
    if (event.target) {
        event.target.value = '';
    }
  }, [onFileLoad, onFileError]);

  const handleClick = () => {
      inputRef.current?.click();
  }

  return (
    <div>
        <input
            type="file"
            accept=".obj"
            onChange={handleFileChange}
            className="hidden"
            ref={inputRef}
        />
        <button
            onClick={handleClick}
            className="px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
        >
            Select .obj File
        </button>
    </div>
  );
};

export default FileUpload;
