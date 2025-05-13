import React, { useState, useRef } from 'react';
import { Smile, Paperclip, Send, X, Image, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

interface MessageInputProps {
  onSendMessage: (content: string, type: 'text' | 'image' | 'file', file?: File) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'image' | 'file' | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedFile(file);
        
        if (file.type.startsWith('image/')) {
          setUploadType('image');
        } else {
          setUploadType('file');
        }
        
        setShowAttachments(false);
      }
    },
  });

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const handleSendMessage = () => {
    if ((!message.trim() && !uploadedFile) || (uploadedFile && !uploadType)) {
      return;
    }

    if (uploadedFile && uploadType) {
      onSendMessage(message.trim(), uploadType, uploadedFile);
    } else {
      onSendMessage(message.trim(), 'text');
    }

    setMessage('');
    setUploadedFile(null);
    setUploadType(null);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleAttachments = () => {
    setShowAttachments(!showAttachments);
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setUploadType(null);
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {uploadedFile && (
        <div className="mb-2 p-2 bg-gray-100 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            {uploadType === 'image' ? (
              <Image size={16} className="text-primary-600 mr-2" />
            ) : (
              <File size={16} className="text-primary-600 mr-2" />
            )}
            <span className="text-sm truncate">{uploadedFile.name}</span>
          </div>
          <button 
            onClick={clearUpload}
            className="text-gray-500 hover:text-error-600"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      <div className="relative" {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="flex items-end bg-gray-100 rounded-lg">
          <button 
            onClick={toggleAttachments}
            className="p-3 text-gray-500 hover:text-primary-600"
          >
            <Paperclip size={20} />
          </button>
          
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="block w-full py-2 px-3 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-gray-900 max-h-32"
            rows={1}
          />
          
          <button className="p-3 text-gray-500 hover:text-primary-600">
            <Smile size={20} />
          </button>
          
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() && !uploadedFile}
            className={`p-3 rounded-r-lg ${
              message.trim() || uploadedFile
                ? 'text-primary-600 hover:text-primary-700' 
                : 'text-gray-400'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
        
        <AnimatePresence>
          {showAttachments && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-2 border border-gray-200"
            >
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    open();
                    setShowAttachments(false);
                  }}
                  className="flex flex-col items-center p-3 hover:bg-gray-100 rounded-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mb-1">
                    <Image size={20} className="text-primary-600" />
                  </div>
                  <span className="text-xs">Photos</span>
                </button>
                
                <button
                  onClick={() => {
                    open();
                    setShowAttachments(false);
                  }}
                  className="flex flex-col items-center p-3 hover:bg-gray-100 rounded-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center mb-1">
                    <File size={20} className="text-secondary-600" />
                  </div>
                  <span className="text-xs">Files</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MessageInput;