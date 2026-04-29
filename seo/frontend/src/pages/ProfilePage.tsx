import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import apiService, { BusinessListingData } from '../services/api';
import { User, Building2, Save, CheckCircle, AlertCircle } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'personal' | 'business'>('personal');
  const [saving, setSaving] = useState(false);
  const [loadingBiz, setLoadingBiz] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Personal State
  const [email, setEmail] = useState(user?.email || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');

  // Business State
  const emptyBusiness: BusinessListingData = useMemo(() => ({
    businessName: '',
    businessLogo: undefined,
    businessCategory: '',
    description: '',
    establishedYear: '',
    numberOfEmployees: '',
    contactPersonName: '',
    businessEmail: '',
    contactNumber: '',
    businessAddress: '',
    websiteUrl: '',
    googleMyBusinessLink: '',
    facebookPageUrl: '',
    instagramProfile: '',
    linkedinPage: '',
    youtubeChannelUrl: '',
    whatsappBusinessNumber: '',
    businessBrochure: undefined,
    googleAccountConnected: false,
    metaAccountConnected: false,
    sitemapFile: undefined,
    trackingPixels: ''
  }), []);

  const [business, setBusiness] = useState<BusinessListingData>(emptyBusiness);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Load business data
    const loadBusinessData = async () => {
      setLoadingBiz(true);
      try {
        // Fetch full data if API available (simulated)
        const usersBusinesses = await apiService.getUserBusinesses();
        if (usersBusinesses.success && usersBusinesses.data && usersBusinesses.data.length > 0) {
          const businessData = usersBusinesses.data[0];
          if (businessData) {
            setBusiness(prev => ({ ...prev, ...(businessData as any) }));
          }
        }
      } catch (err) {
        console.error("Error loading business data", err);
      } finally {
        setLoadingBiz(false);
      }
    };
    loadBusinessData();

    setEmail(user?.email || '');
    setCompanyName(user?.companyName || '');
  }, [isAuthenticated, user]);

  const handleSaveBusiness = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const usersBusinesses = await apiService.getUserBusinesses();
      if (usersBusinesses.success && usersBusinesses.data?.length > 0) {
        const bizId = (usersBusinesses.data[0] as any).id || '1';
        await apiService.updateBusiness(bizId, business);
      } else {
        await apiService.submitBusinessListing(business);
      }
      setMessage({ type: 'success', text: 'Business details saved successfully.' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to save business details.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h1>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 mb-8">
          <button
            onClick={() => setActiveTab('personal')}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'personal'
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            <div className="flex items-center space-x-2">
              <User size={18} />
              <span>Personal Profile</span>
            </div>
            {activeTab === 'personal' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('business')}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'business'
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            <div className="flex items-center space-x-2">
              <Building2 size={18} />
              <span>Business Details</span>
            </div>
            {activeTab === 'business' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-t-full" />
            )}
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
            {message.text}
          </div>
        )}

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">

          {/* PERSONAL TAB */}
          {activeTab === 'personal' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <label htmlFor="profile-email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="profile-companyName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Company Name (Personal Ref)</label>
                <input
                  id="profile-companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>

                          </div>
          )}

          {/* BUSINESS TAB */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              {loadingBiz ? (
                <div className="text-center py-8 text-gray-500">Loading business details...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="business-businessName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Name</label>
                      <input
                        id="business-businessName"
                        value={business.businessName}
                        onChange={(e) => setBusiness({ ...business, businessName: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                      <input
                        value={business.businessCategory}
                        onChange={(e) => setBusiness({ ...business, businessCategory: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                        placeholder="e.g. Retail, Tech, Services"
                      />
                    </div>
                    <div>
                      <label htmlFor="business-websiteUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website URL</label>
                      <input
                        id="business-websiteUrl"
                        value={business.websiteUrl}
                        onChange={(e) => setBusiness({ ...business, websiteUrl: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                      />
                    </div>
                    <div>
                      <label htmlFor="business-businessEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Email</label>
                      <input
                        id="business-businessEmail"
                        value={business.businessEmail}
                        onChange={(e) => setBusiness({ ...business, businessEmail: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Social Media</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">LinkedIn</label>
                          <input
                            value={business.linkedinPage}
                            onChange={(e) => setBusiness({ ...business, linkedinPage: e.target.value })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                            placeholder="LinkedIn URL"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Instagram</label>
                          <input
                            value={business.instagramProfile}
                            onChange={(e) => setBusiness({ ...business, instagramProfile: e.target.value })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                            placeholder="Instagram URL"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Description</label>
                          <textarea
                            value={business.description}
                            onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                            rows={4}
                            placeholder="Describe your business..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      onClick={handleSaveBusiness}
                      disabled={saving}
                      className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Business Details'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
