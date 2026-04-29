import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Search,
  Users,
  Megaphone,
  TrendingUp,
  FileText,
  Settings,
  ChevronLeft,
  User,
  Heart,
  Map,
  BrainCircuit
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['company'] },
    { id: 'user-dashboard', label: 'User Dashboard', icon: LayoutDashboard, path: '/user-dashboard', roles: ['user'] },
    { id: 'seo-tools', label: 'SEO Tools', icon: Search, path: '/seo-tools', roles: ['company'] },
    { id: 'geo-analyzer', label: 'Geo Analyzer', icon: Map, path: '/geo-analyzer', roles: ['company'] },
    { id: 'knowledge-bucket', label: 'AI Bot', icon: BrainCircuit, path: '/knowledge-bucket', roles: ['company', 'user'] },
    { id: 'reach-optimization', label: 'Reach Optimization', icon: Megaphone, path: '/reach-optimization', roles: ['company'] },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/analytics', roles: ['company'] },
    { id: 'sentiment-analysis', label: 'Sentiment & Reputation', icon: Heart, path: '/sentiment-analysis', roles: ['company', 'user'] },
    { id: 'growth-tips', label: 'Growth Tips', icon: TrendingUp, path: '/growth-tips', roles: ['company'] },
    { id: 'employees', label: 'Employees', icon: Users, path: '/employees', roles: ['company'] },
    { id: 'recruitment-details', label: 'Recruitment Details', icon: Users, path: '/recruitment-details', roles: ['company'] },
    { id: 'product-details', label: 'Product Details', icon: FileText, path: '/product-details', roles: ['company'] },
    { id: 'content', label: 'Content', icon: FileText, path: '/content', roles: ['company'] },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile', roles: ['company', 'user'] },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', roles: ['company', 'user'] },
  ];

  const filteredItems = navigationItems.filter(item => {
    if (!user || !user.role) return false;
    return item.roles.includes(user.role);
  });

  const isActive = (path: string) => location.pathname === path;

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        isProfileMenuOpen &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isProfileMenuOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              {user?.role === 'user' ? 'User Dashboard' : 'Business Dashboard'}
            </span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const hasSubItems = (item as any).subItems && (item as any).subItems.length > 0;
            // For now, let's keep it simple: always expand if active or if child is active

            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group
                    ${active
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`} />
                  <span className="font-medium">{item.label}</span>
                  {active && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>

                {/* Nested Items */}
                {hasSubItems && (
                  <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-100 dark:border-gray-700 pl-2">
                    {(item as any).subItems.map((sub: any) => {
                      const subActive = isActive(sub.path);
                      const SubIcon = sub.icon;
                      return (
                        <button
                          key={sub.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(sub.path);
                            if (window.innerWidth < 1024) {
                              onToggle();
                            }
                          }}
                          className={`
                             w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left text-sm transition-all duration-200
                             ${subActive
                              ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                            }
                          `}
                        >
                          <SubIcon className="w-4 h-4" />
                          <span>{sub.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 relative">
          <button
            ref={profileButtonRef}
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-haspopup="menu"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user
                  ? (
                      `${(user.firstName || '')[0] ?? ''}${(user.lastName || '')[0] ?? ''}`.trim() ||
                      `${(user.companyName || '')[0] ?? ''}`.trim() ||
                      'U'
                    )
                  : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user
                  ? (user.role === 'company'
                      ? (user.companyName || 'Business')
                      : (`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'))
                  : 'Guest'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user ? user.email : 'Not signed in'}</p>
            </div>
            <span className="sr-only">Open profile menu</span>
          </button>

          {isProfileMenuOpen && (
            <div
              ref={profileMenuRef}
              role="menu"
              aria-label="Profile menu"
              className="absolute left-4 right-4 bottom-16 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2"
            >
              <button
                role="menuitem"
                onClick={() => { navigate('/profile'); setIsProfileMenuOpen(false); if (window.innerWidth < 1024) onToggle(); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Profile
              </button>
              <button
                role="menuitem"
                onClick={() => { navigate('/settings?tab=account'); setIsProfileMenuOpen(false); if (window.innerWidth < 1024) onToggle(); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Account
              </button>
              <button
                role="menuitem"
                onClick={() => { navigate('/settings'); setIsProfileMenuOpen(false); if (window.innerWidth < 1024) onToggle(); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Settings
              </button>
              <button
                role="menuitem"
                onClick={() => { navigate('/settings?tab=billing'); setIsProfileMenuOpen(false); if (window.innerWidth < 1024) onToggle(); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Plan and Pricing
              </button>
              <button
                role="menuitem"
                onClick={() => { navigate('/settings?tab=billing&view=history'); setIsProfileMenuOpen(false); if (window.innerWidth < 1024) onToggle(); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Purchase History
              </button>
              <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
              <button
                role="menuitem"
                onClick={() => { logout(); navigate('/'); setIsProfileMenuOpen(false); if (window.innerWidth < 1024) onToggle(); }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-md"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
