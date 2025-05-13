import React, { useState } from 'react';
import { searchUsers, User } from '../../services/api/users';
import { createGroupChat, Chat } from '../../services/api/chats';
import { User as UserIcon, X, Search, Users, Plus, Trash2 } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface NewGroupChatProps {
  onGroupCreated: (chat: Chat) => void;
  onClose: () => void;
}

const NewGroupChat: React.FC<NewGroupChatProps> = ({ onGroupCreated, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const results = await searchUsers(searchQuery);
      // Filter out already selected users
      const filteredResults = results.filter(
        (user) => !selectedUsers.some((selected) => selected.id === user.id)
      );
      setSearchResults(filteredResults);
    } catch (err) {
      setError('Failed to search users. Please try again.');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddUser = (user: User) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchResults(searchResults.filter((u) => u.id !== user.id));
    setSearchQuery('');
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }
    
    if (selectedUsers.length < 2) {
      setError('Please select at least 2 members for the group');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const memberIds = selectedUsers.map((user) => user.id);
      const newGroup = await createGroupChat(groupName, memberIds);
      onGroupCreated(newGroup);
    } catch (err) {
      setError('Failed to create group. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Create Group Chat</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="mb-4">
        <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
          Group Name
        </label>
        <input
          id="groupName"
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Members ({selectedUsers.length})
        </label>
        {selectedUsers.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedUsers.map((user) => (
              <div 
                key={user.id}
                className="flex items-center bg-primary-50 px-3 py-1 rounded-full"
              >
                <span className="text-sm text-primary-800">{user.name}</span>
                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className="ml-2 text-primary-600 hover:text-error-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 mb-4">
            No members selected yet
          </div>
        )}
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Search for users to add..."
            className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            onClick={handleSearch}
            className="absolute inset-y-0 right-0 px-3 flex items-center bg-primary-600 text-white rounded-r-md hover:bg-primary-700"
          >
            {isSearching ? <LoadingSpinner size="small" /> : 'Search'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="text-error-600 text-sm mb-4">
          {error}
        </div>
      )}
      
      {isSearching ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="medium" />
        </div>
      ) : searchResults.length > 0 ? (
        <div className="max-h-48 overflow-y-auto mb-4">
          <ul className="divide-y divide-gray-200">
            {searchResults.map((user) => (
              <li
                key={user.id}
                onClick={() => handleAddUser(user)}
                className="py-2 flex items-center hover:bg-gray-50 cursor-pointer rounded-md px-2"
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                  ) : (
                    <UserIcon className="h-4 w-4 text-primary-600" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Plus size={16} className="text-primary-600" />
              </li>
            ))}
          </ul>
        </div>
      ) : searchQuery ? (
        <div className="text-center py-4 text-gray-500 mb-4">
          No users found. Try a different search.
        </div>
      ) : null}
      
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md mr-2 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateGroup}
          disabled={isLoading || !groupName.trim() || selectedUsers.length < 2}
          className={`px-4 py-2 rounded-md flex items-center ${
            isLoading || !groupName.trim() || selectedUsers.length < 2
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="small" />
              <span className="ml-2">Creating...</span>
            </>
          ) : (
            <>
              <Users size={16} className="mr-2" />
              Create Group
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NewGroupChat;