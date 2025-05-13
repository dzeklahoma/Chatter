import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import MessageList from '../components/messages/MessageList';
import MessageInput from '../components/messages/MessageInput';
import ChatHeader from '../components/chat/ChatHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { SocketProvider, useSocket } from '../contexts/SocketContext';
import { getChat, Chat as ChatType } from '../services/api/chats';
import { getMessages, sendMessage, markMessageAsRead, Message } from '../services/api/messages';
import { useAuth } from '../contexts/AuthContext';

const Chat: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chat, setChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) {
      navigate('/');
      return;
    }

    const fetchChatAndMessages = async () => {
      setIsLoading(true);
      try {
        const [chatData, messagesData] = await Promise.all([
          getChat(chatId),
          getMessages(chatId),
        ]);
        setChat(chatData);
        setMessages(messagesData);
        
        // Mark messages as read
        const unreadMessages = messagesData.filter(
          (message) => message.status !== 'read' && message.senderId !== user?.id
        );
        
        if (unreadMessages.length > 0) {
          await Promise.all(unreadMessages.map((message) => markMessageAsRead(message.id)));
        }
      } catch (err) {
        setError('Failed to load conversation');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatAndMessages();
  }, [chatId, navigate, user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (
    content: string,
    type: 'text' | 'image' | 'file' = 'text',
    file?: File
  ) => {
    if (!chatId || !content.trim()) return;

    try {
      const newMessage = await sendMessage(chatId, content, type, file);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Socket component for handling real-time messages
  const ChatSocketHandler: React.FC = () => {
    const { socket } = useSocket();
    
    useEffect(() => {
      if (!socket || !chatId) return;

      // Listen for new messages
      socket.on('new_message', (message: Message) => {
        if (message.chatId === chatId) {
          setMessages((prevMessages) => [...prevMessages, message]);
          
          // Mark as read immediately if it's not from the current user
          if (message.senderId !== user?.id) {
            markMessageAsRead(message.id).catch(console.error);
          }
        }
      });

      // Listen for message status updates
      socket.on('message_status_update', ({ messageId, status }: { messageId: string; status: 'sent' | 'delivered' | 'read' }) => {
        setMessages((prevMessages) => 
          prevMessages.map((msg) => 
            msg.id === messageId ? { ...msg, status } : msg
          )
        );
      });

      return () => {
        socket.off('new_message');
        socket.off('message_status_update');
      };
    }, [socket, chatId]);

    return null;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner size="large" />
        </div>
      </Layout>
    );
  }

  if (error || !chat) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-full">
          <div className="text-error-600 mb-4">{error || 'Conversation not found'}</div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Back to conversations
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <SocketProvider>
      <Layout>
        <div className="flex flex-col h-full">
          <ChatHeader chat={chat} />
          
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <MessageList messages={messages} currentUserId={user?.id || ''} />
            <div ref={messagesEndRef} />
          </div>
          
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
        <ChatSocketHandler />
      </Layout>
    </SocketProvider>
  );
};

export default Chat;