import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { updateProfile } from '../services/api/users';
import { User, Camera, Moon, Sun, Monitor } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Settings: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setAvatar(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await updateProfile({ name, avatar: avatar || undefined });
      setSuccess(true);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner size="large" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center sm:flex-row sm:items-start">
                <div className="relative mb-4 sm:mb-0 sm:mr-6">
                  <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt={user?.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-primary-600" />
                    )}
                  </div>
                  <label htmlFor="avatar" className="absolute bottom-0 right-0 bg-primary-600 text-white p-1 rounded-full cursor-pointer hover:bg-primary-700">
                    <Camera size={16} />
                    <input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <div className="w-full">
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="bg-error-50 text-error-700 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-success-50 text-success-700 p-3 rounded-md text-sm">
                  Profile updated successfully
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Theme</h3>
                  <p className="text-sm text-gray-500">
                    Choose how Chatter looks for you
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-2 rounded-md ${
                      theme === 'light' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-label="Light theme"
                  >
                    <Sun size={20} />
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-2 rounded-md ${
                      theme === 'dark' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-label="Dark theme"
                  >
                    <Moon size={20} />
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`p-2 rounded-md ${
                      theme === 'system' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-label="System theme preference"
                  >
                    <Monitor size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Privacy & Security</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">End-to-End Encryption</h3>
                  <p className="text-sm text-gray-500">
                    Messages are encrypted and can only be read by you and the recipients
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6 rounded-full bg-primary-600">
                  <span className="absolute inset-y-1 right-1 w-4 h-4 rounded-full bg-white"></span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Read Receipts</h3>
                  <p className="text-sm text-gray-500">
                    Let others know when you've read their messages
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6 rounded-full bg-primary-600">
                  <span className="absolute inset-y-1 right-1 w-4 h-4 rounded-full bg-white"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;