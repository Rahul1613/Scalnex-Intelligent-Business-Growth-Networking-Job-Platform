import React, { useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Bell, Lock, Download, Trash2, Moon, Sun, Globe, Mail, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'privacy'>('account');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [seoAlerts, setSeoAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('private');
  const [dataSharing, setDataSharing] = useState(false);
  const [analyticsTracking, setAnalyticsTracking] = useState(true);



  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save notification and privacy settings to localStorage
      localStorage.setItem('notification_settings', JSON.stringify({
        emailNotifications,
        seoAlerts,
        weeklyReports,
        marketingEmails
      }));

      localStorage.setItem('privacy_settings', JSON.stringify({
        profileVisibility,
        dataSharing,
        analyticsTracking
      }));

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };



  const handleExportData = () => {
    // Export user data as JSON
    const userData = {
      user,
      exportDate: new Date().toISOString(),
      settings: {
        notifications: { emailNotifications, seoAlerts, weeklyReports, marketingEmails },
        privacy: { profileVisibility, dataSharing, analyticsTracking }
      }
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-platform-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setMessage({ type: 'success', text: 'Data exported successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (window.confirm('This will permanently delete all your data. Are you absolutely sure?')) {
        logout();
        setMessage({ type: 'success', text: 'Account deleted. Redirecting...' });
      }
    }
  };

  const tabs = [
    { id: 'account' as const, label: 'Account', icon: Globe },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'privacy' as const, label: 'Privacy', icon: Lock },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and configurations</p>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`mb-6 flex items-center gap-2 p-4 rounded-lg border ${message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
            : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
            }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Account Settings
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Manage your account information and preferences
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900 dark:text-white">{user?.email}</span>
                          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                            Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        User ID
                      </label>
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white font-mono text-sm">{user?.id}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Appearance
                      </label>
                      <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">Click to toggle</span>
                      </button>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notification Preferences
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Choose what notifications you want to receive
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Email Notifications', desc: 'Receive important updates via email', state: emailNotifications, setState: setEmailNotifications, icon: Mail },
                      { label: 'SEO Alerts', desc: 'Get notified about SEO issues and improvements', state: seoAlerts, setState: setSeoAlerts, icon: Bell },
                      { label: 'Weekly Reports', desc: 'Receive weekly performance summaries', state: weeklyReports, setState: setWeeklyReports, icon: Download },
                      { label: 'Marketing Emails', desc: 'Tips, updates, and promotional content', state: marketingEmails, setState: setMarketingEmails, icon: Mail },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-start gap-3 flex-1">
                            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => item.setState(!item.state)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.state ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.state ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSaveSettings}
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Privacy & Security
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Control your privacy and data preferences
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-medium text-gray-900 dark:text-white">Profile Visibility</label>
                        <select
                          value={profileVisibility}
                          onChange={(e) => setProfileVisibility(e.target.value as 'public' | 'private')}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="private">Private</option>
                          <option value="public">Public</option>
                        </select>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Control who can see your profile information</p>
                    </div>

                    {[
                      { label: 'Data Sharing', desc: 'Share anonymized data to improve services', state: dataSharing, setState: setDataSharing },
                      { label: 'Analytics Tracking', desc: 'Help us improve by tracking usage', state: analyticsTracking, setState: setAnalyticsTracking },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-3 flex-1">
                          <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => item.setState(!item.state)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.state ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.state ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <button
                      onClick={handleExportData}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Export My Data
                    </button>

                    <button
                      onClick={handleDeleteAccount}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete Account
                    </button>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSaveSettings}
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}


            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;


