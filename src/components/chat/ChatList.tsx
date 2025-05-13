import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { User, Users, Check, CheckCheck } from 'lucide-react';
import { Chat } from '../../services/api/chats';
import LoadingSpinner from '../ui/LoadingSpinner';
import { motion } from 'framer-motion';

interface ChatListProps {
  chats: Chat[];
  isLoading: boolean;
  error: string | null;
  onSelectChat: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, isLoading, error, onSelectChat }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-error-600 mb-2">{error}</p>
        <button className="text-primary-600 hover:text-primary-700 underline">Retry</button>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-primary-100 rounded-full mb-4">
          <MessageCircle className="h-8 w-8 text-primary-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No conversations yet</h3>
        <p className="text-gray-600 mb-4">Start a new chat to begin messaging</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {chats.map((chat, index) => (
          <motion.li
            key={chat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
            }}
            onClick={() => onSelectChat(chat.id)}
            className="px-4 py-4 flex cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="relative flex-shrink-0">
              {chat.type === 'private' ? (
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  {chat.members[0]?.avatar ? (
                    <img
                      src={chat.members[0].avatar}
                      alt={chat.members[0].name}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <User className="h-6 w-6 text-primary-600" />
                  )}
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-secondary-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-secondary-600" />
                </div>
              )}
              {chat.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                </span>
              )}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {chat.type === 'private'
                    ? chat.members[0]?.name || 'Unknown User'
                    : chat.name}
                </h3>
                {chat.lastMessage && (
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(chat.lastMessage.timestamp), { addSuffix: true })}
                  </span>
                )}
              </div>
              {chat.lastMessage && (
                <div className="mt-1 flex items-center">
                  <p className="text-sm text-gray-600 truncate flex-1">
                    {chat.lastMessage.content}
                  </p>
                  <MessageStatus status="delivered" />
                </div>
              )}
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

// Message status component
const MessageStatus: React.FC<{ status: 'sent' | 'delivered' | 'read' }> = ({ status }) => {
  if (status === 'sent') {
    return <Check size={14} className="text-gray-400 ml-1" />;
  } else if (status === 'delivered') {
    return <CheckCheck size={14} className="text-gray-400 ml-1" />;
  } else {
    return <CheckCheck size={14} className="text-primary-600 ml-1" />;
  }
};

// Import at the top
import { MessageCircle } from 'lucide-react';

export default ChatList;