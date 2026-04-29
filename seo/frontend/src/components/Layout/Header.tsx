import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Moon, Sun, Menu, X, Rocket, LogOut } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is on the home page
  const isHomePage = location.pathname === '/';

  // Debug authentication state
  useEffect(() => {
    console.log('🔐 Authentication State:', { isAuthenticated, user: user ? { email: user.email, id: user.id } : null });
  }, [isAuthenticated, user]);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Marketplace', href: '/marketplace' },
    ...(isAuthenticated ? [
      { name: 'Marketing', href: '/ad-campaigns' },
      { name: 'BI Analytics', href: '/analytics' },
      { name: 'Billing', href: '/billing' }
    ] : [])
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (href: string) => {
    navigate(href);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-success-500 rounded-lg flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Scalnex</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className={`text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2`}
                >
                  {item.name === 'Marketing' && <BarChart3 className="w-4 h-4" />}
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Right side buttons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              {/* Auth Buttons */}
              <div className="hidden sm:flex items-center space-x-2 ml-auto">
                {isAuthenticated && isHomePage ? (
                  <>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="bg-gradient-to-r from-primary-600 to-success-500 hover:from-primary-700 hover:to-success-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base whitespace-nowrap flex items-center space-x-2"
                    >
                      <Rocket className="w-4 h-4" />
                      <span>Start Now</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-red-600 hover:text-red-500 transition-colors flex items-center space-x-2"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </>
                ) : !isAuthenticated ? (
                  <button
                    onClick={() => navigate('/business-signin')}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    List Your Business
                  </button>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-red-600 hover:text-red-500 transition-colors flex items-center space-x-2"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className="md:hidden p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden border-t border-gray-200 dark:border-gray-700"
              >
                <div className="py-3 sm:py-4 space-y-1 sm:space-y-2">
                  {navigation.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.href)}
                      className={`block w-full text-left px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center gap-3`}
                    >
                      {item.name === 'Marketing' && <BarChart3 className="w-5 h-5" />}
                      {item.name}
                    </button>
                  ))}
                  <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                    {isAuthenticated && isHomePage ? (
                      <div className="px-4 space-y-2 sm:space-y-3">
                        <button
                          onClick={() => {
                            navigate('/dashboard');
                            setIsMenuOpen(false);
                          }}
                          className="w-full bg-gradient-to-r from-primary-600 to-success-500 hover:from-primary-700 hover:to-success-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-center transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base flex items-center justify-center space-x-2"
                        >
                          <Rocket className="w-4 h-4" />
                          <span>Start Now</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:text-red-500 transition-colors text-left flex items-center space-x-3"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    ) : !isAuthenticated ? (
                      <div className="px-4 space-y-2">
                        <button
                          onClick={() => {
                            navigate('/business-signin');
                            setIsMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors text-left"
                        >
                          List Your Business
                        </button>
                      </div>
                    ) : (
                      <div className="px-4">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:text-red-500 transition-colors text-left flex items-center space-x-3"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </header>
    </>
  );
};

export default Header;
