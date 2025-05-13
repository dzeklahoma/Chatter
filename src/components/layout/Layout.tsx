import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle, User, Settings, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white shadow-md">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-600">
              <Link to="/" className="flex items-center space-x-2">
                <MessageCircle className="h-8 w-8 text-white" />
                <span className="text-xl font-semibold text-white">Chatter</span>
              </Link>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
              <nav className="mt-5 flex-1 px-2 space-y-2">
                <Link
                  to="/"
                  className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                >
                  <MessageCircle className="mr-3 h-5 w-5 text-gray-500 group-hover:text-primary-700" />
                  Chats
                </Link>
                <Link
                  to="/settings"
                  className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                >
                  <Settings className="mr-3 h-5 w-5 text-gray-500 group-hover:text-primary-700" />
                  Settings
                </Link>
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-200 flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full" />
                    ) : (
                      <User className="h-6 w-6 text-primary-600" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                    <p className="text-xs font-medium text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-auto p-1 rounded-full text-gray-500 hover:text-error-600 hover:bg-error-50"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:bg-gray-100 focus:text-gray-600"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <MessageCircle className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-lg font-semibold">Chatter</span>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <Link to="/settings" className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
                <Settings className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20"
                onClick={closeMobileMenu}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="md:hidden fixed inset-y-0 left-0 flex flex-col z-30 w-full max-w-xs bg-white"
              >
                <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 bg-primary-600">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-8 w-8 text-white" />
                    <span className="text-xl font-semibold text-white">Chatter</span>
                  </div>
                  <button onClick={closeMobileMenu} className="text-white">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex-1 h-0 overflow-y-auto">
                  <nav className="mt-5 px-2 space-y-3">
                    <Link
                      to="/"
                      onClick={closeMobileMenu}
                      className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                    >
                      <MessageCircle className="mr-3 h-5 w-5 text-gray-500 group-hover:text-primary-700" />
                      Chats
                    </Link>
                    <Link
                      to="/settings"
                      onClick={closeMobileMenu}
                      className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                    >
                      <Settings className="mr-3 h-5 w-5 text-gray-500 group-hover:text-primary-700" />
                      Settings
                    </Link>
                  </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                  <div className="flex-shrink-0 w-full group block">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-200 flex items-center justify-center">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full" />
                        ) : (
                          <User className="h-6 w-6 text-primary-600" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                        <p className="text-xs font-medium text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="ml-auto p-1 rounded-full text-gray-500 hover:text-error-600 hover:bg-error-50"
                      >
                        <LogOut className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;