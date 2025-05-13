import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ChatList from '../components/chat/ChatList';
import UserSearch from '../components/users/UserSearch';
import NewGroupChat from '../components/chat/NewGroupChat';
import { getChats, Chat } from '../services/api/chats';
import { SocketProvider } from '../contexts/SocketContext';
import { Plus, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const fetchedChats = await getChats();
        setChats(fetchedChats);
      } catch (err) {
        setError('Failed to load chats');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleChatSelect = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const handleNewChat = () => {
    setShowNewChat(true);
    setShowNewGroup(false);
  };

  const handleNewGroup = () => {
    setShowNewGroup(true);
    setShowNewChat(false);
  };

  const closeModals = () => {
    setShowNewChat(false);
    setShowNewGroup(false);
  };

  const addNewChat = (chat: Chat) => {
    setChats((prevChats) => [chat, ...prevChats]);
    closeModals();
    navigate(`/chat/${chat.id}`);
  };

  return (
    <SocketProvider>
      <Layout>
        <div className="container mx-auto px-4 py-6 h-full">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Conversations</h1>
            <div className="flex space-x-2">
              <button
                onClick={handleNewChat}
                className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <Plus size={16} className="mr-1" />
                <span>New Chat</span>
              </button>
              <button
                onClick={handleNewGroup}
                className="flex items-center px-3 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors"
              >
                <Users size={16} className="mr-1" />
                <span>New Group</span>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showNewChat && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6"
              >
                <UserSearch onSelectUser={addNewChat} onClose={closeModals} />
              </motion.div>
            )}

            {showNewGroup && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6"
              >
                <NewGroupChat onGroupCreated={addNewChat} onClose={closeModals} />
              </motion.div>
            )}
          </AnimatePresence>

          <ChatList
            chats={chats}
            isLoading={isLoading}
            error={error}
            onSelectChat={handleChatSelect}
          />
        </div>
      </Layout>
    </SocketProvider>
  );
};

export default Dashboard;