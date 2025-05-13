import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, User, Users, Phone, Video } from 'lucide-react';
import { Chat } from '../../services/api/chats';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatHeaderProps {
  chat: Chat;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chat }) => {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const goBack = () => {
    navigate('/');
  };

  const getChatName = () => {
    if (chat.type === 'private') {
      return chat.members[0]?.name || 'Unknown User';
    }
    return chat.name;
  };

  const getChatAvatar = () => {
    if (chat.type === 'private') {
      if (chat.members[0]?.avatar) {
        return <img src={chat.members[0].avatar} alt={chat.members[0].name} className="h-10 w-10 rounded-full" />;
      }
      return <User className="h-6 w-6 text-primary-600" />;
    }
    return <Users className="h-6 w-6 text-secondary-600" />;
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center">
        <button 
          onClick={goBack}
          className="mr-3 block md:hidden"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
          {getChatAvatar()}
        </div>
        
        <div className="ml-3">
          <h2 className="text-lg font-medium text-gray-900">{getChatName()}</h2>
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-success-500 mr-2"></span>
            <span className="text-xs text-gray-500">Online</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
          <Phone className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
          <Video className="h-5 w-5" />
        </button>
        <div className="relative">
          <button 
            onClick={toggleOptions} 
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          
          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
              >
                <div className="py-1">
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    View Info
                  </button>
                  {chat.type === 'group' && (
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Manage Members
                    </button>
                  )}
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Search in Chat
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-error-50">
                    Delete Conversation
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;