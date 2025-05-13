import React, { useState, useEffect } from 'react';
import { searchUsers, User } from '../../services/api/users';
import { createPrivateChat, Chat } from '../../services/api/chats';
import { User as UserIcon, X, Search } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface UserSearchProps {
  onSelectUser: (chat: Chat) => void;
  onClose: () => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onSelectUser, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search users. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = async (user: User) => {
    try {
      setIsLoading(true);
      const chat = await createPrivateChat(user.id);
      onSelectUser(chat);
    } catch (err) {
      setError('Failed to start chat. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">New Conversation</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for users..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      
      {error && (
        <div className="text-error-600 text-sm mb-4">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="medium" />
        </div>
      ) : searchResults.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {searchResults.map((user) => (
            <li
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className="py-3 flex items-center hover:bg-gray-50 cursor-pointer rounded-md px-2"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full" />
                ) : (
                  <UserIcon className="h-5 w-5 text-primary-600" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : searchQuery.trim().length >= 2 ? (
        <div className="text-center py-4 text-gray-500">
          No users found. Try a different search.
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          Search for users to start a conversation.
        </div>
      )}
    </div>
  );
};

export default UserSearch;