import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, Image, File, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Message } from '../../services/api/messages';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  const groupMessagesByDate = () => {
    const groups: { [date: string]: Message[] } = {};
    
    messages.forEach((message) => {
      const date = format(new Date(message.timestamp), 'MMMM d, yyyy');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-primary-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-800">End-to-end encrypted</h3>
        <p className="text-sm text-gray-600 text-center mt-2 max-w-md">
          Messages in this conversation are secured with end-to-end encryption. No one outside of this chat can read them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(messageGroups).map(([date, msgs]) => (
        <div key={date} className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs">
              {date}
            </div>
          </div>
          
          {msgs.map((message, index) => {
            const isCurrentUser = message.senderId === currentUserId;
            
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs md:max-w-md ${isCurrentUser ? 'bg-primary-600 text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-xl rounded-tr-xl rounded-br-xl'}`}>
                  {message.type === 'text' && (
                    <div className="p-3">
                      <p>{message.content}</p>
                    </div>
                  )}
                  
                  {message.type === 'image' && (
                    <div className="overflow-hidden">
                      {message.fileUrl && (
                        <img 
                          src={message.fileUrl} 
                          alt="Shared image" 
                          className="w-full h-auto rounded-t-xl"
                        />
                      )}
                      <div className="p-3 flex items-center">
                        <Image size={16} className={isCurrentUser ? 'text-white' : 'text-gray-600'} />
                        <span className="ml-2">{message.content || 'Shared an image'}</span>
                      </div>
                    </div>
                  )}
                  
                  {message.type === 'file' && (
                    <div className="p-3">
                      <div className="flex items-center">
                        <File size={16} className={isCurrentUser ? 'text-white' : 'text-gray-600'} />
                        <span className="ml-2">{message.fileName || 'Document'}</span>
                      </div>
                      {message.content && <p className="mt-1">{message.content}</p>}
                    </div>
                  )}
                  
                  <div className={`flex items-center justify-end px-3 pb-1 text-xs ${isCurrentUser ? 'text-primary-100' : 'text-gray-500'}`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {isCurrentUser && message.status && (
                      <span className="ml-1">
                        {message.status === 'sent' ? (
                          <Check size={12} />
                        ) : message.status === 'delivered' ? (
                          <CheckCheck size={12} />
                        ) : (
                          <CheckCheck size={12} className="text-primary-300" />
                        )}
                      </span>
                    )}
                    {message.encrypted && (
                      <Shield size={12} className="ml-1" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MessageList;