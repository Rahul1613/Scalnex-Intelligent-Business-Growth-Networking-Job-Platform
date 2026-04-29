import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, Search, FileText, MessageSquare } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  userId: string;
  userName: string;
  userEmail: string;
  coverLetter: string;
  resumeUrl: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: string;
  updatedAt: string;
  createdAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  offerLetter?: string;
  rejectionReason?: string;
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected'>('all');
  const [jobCount, setJobCount] = useState(0);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);

        // Check if user is a company
        const isCompany = !!(user && (user.role === 'company' || (user as any).companyName));

        let response;
        if (isCompany) {
          // For companies, fetch applications to their jobs
          response = await apiService.getCompanyApplications();
        } else {
          // For regular users, fetch their own applications
          response = await apiService.getUserApplications();
        }

        if (response.success && response.data) {
          // Transform API data to match our Application interface
          const transformedApps: Application[] = response.data.map((app: any) => ({
            id: app.id?.toString() || '',
            jobId: app.job?.id?.toString() || '',
            jobTitle: app.job?.title || '',
            companyName: app.job?.companyName || 'Company',
            userId: app.user?.id?.toString() || '',
            userName: app.user?.name || '',
            userEmail: app.user?.email || '',
            coverLetter: app.coverLetter || '',
            resumeUrl: app.resume || '',
            status: app.status || 'pending',
            appliedAt: app.createdAt || new Date().toISOString(),
            updatedAt: app.updatedAt || app.createdAt || new Date().toISOString(),
            createdAt: app.createdAt,
            acceptedAt: app.acceptedAt,
            rejectedAt: app.rejectedAt,
            offerLetter: app.offerLetter,
            rejectionReason: app.rejectionReason
          }));

          setApplications(transformedApps);
        } else {
          console.warn('Failed to fetch applications:', response.error);
          setApplications([]); // Set empty array on error
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        setApplications([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    const fetchJobCount = async () => {
      try {
        console.log('🔢 Fetching job count from API...');
        const response = await apiService.getPublicJobs();
        console.log('📊 Job count API Response:', response);

        if (response.success && response.data) {
          const count = response.data.length;
          console.log('✅ Job count set to:', count);
          setJobCount(count);
        } else {
          console.warn('❌ Failed to fetch job count:', response.error);
          setJobCount(0);
        }
      } catch (error) {
        console.error('💥 Error fetching job count:', error);
        setJobCount(0);
      }
    };

    fetchApplications();
    fetchJobCount();
  }, [user, isAuthenticated]);

  const filteredApplications = applications.filter(app =>
    filter === 'all' ? true : app.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'reviewed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'accepted': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your job search and applications</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-xl font-medium"
          >
            Logout
          </button>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            onClick={() => navigate('/user/job-listing')}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Browse Jobs</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Find new opportunities</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {jobCount} Jobs
            </div>
          </div>

          <div
            onClick={() => navigate('/user/applied-jobs')}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Applied Jobs</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your applications</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {applications.length}
            </div>
          </div>

          <div
            onClick={() => {
              const hasResponses = applications.some(app => app.status !== 'pending');
              if (hasResponses) {
                navigate('/user/applied-jobs');
              } else {
                console.log('No responses yet');
              }
            }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Responses</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Company replies</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {applications.filter(app => app.status !== 'pending').length}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-2 mb-6 inline-flex gap-2">
          {(['all', 'pending', 'reviewed', 'accepted', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-medium transition-all capitalize ${filter === status
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              {status}
              {status !== 'all' && (
                <span className="ml-2 text-xs opacity-75">
                  ({applications.filter(a => a.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
            <Briefcase className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'No Applications Yet' : `No ${filter} Applications`}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {filter === 'all'
                ? 'Start applying for jobs from the Marketplace to see them here.'
                : `You don't have any ${filter} applications at the moment.`
              }
            </p>
            <button
              onClick={() => navigate('/user/job-listing')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium inline-flex items-center gap-2"
            >
              <Search size={18} />
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase size={20} className="text-gray-400" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{app.jobTitle}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 ml-8">{app.companyName || 'Company'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4 ml-8">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    Applied {new Date(app.createdAt || app.appliedAt).toLocaleDateString()}
                  </span>
                  {app.acceptedAt && (
                    <span className="flex items-center gap-1">
                      Updated {new Date(app.acceptedAt).toLocaleDateString()}
                    </span>
                  )}
                  {app.rejectedAt && (
                    <span className="flex items-center gap-1">
                      Updated {new Date(app.rejectedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {app.coverLetter && (
                  <div className="ml-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Letter</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{app.coverLetter}</p>
                  </div>
                )}

                {app.offerLetter && (
                  <div className="ml-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Offer Letter</p>
                      <button
                        onClick={() => {
                          const offer = app.offerLetter as any;
                          if (typeof offer === 'object' && offer.name && offer.type && offer.data) {
                            // Download uploaded PDF
                            const byteChars = atob(offer.data);
                            const byteNumbers = new Array(byteChars.length);
                            for (let i = 0; i < byteChars.length; i++) {
                              byteNumbers[i] = byteChars.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], { type: offer.type });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = offer.name;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            URL.revokeObjectURL(url);
                          } else {
                            // Fallback to print for text offer letters
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                              printWindow.document.write(`
                                <!DOCTYPE html>
                                <html>
                                  <head>
                                    <title>Offer Letter</title>
                                    <style>
                                      body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
                                      h1 { color: #1f2937; }
                                      .meta { margin-bottom: 24px; }
                                      .content { white-space: pre-wrap; }
                                    </style>
                                  </head>
                                  <body>
                                    <h1>Offer Letter</h1>
                                    <div class="meta">
                                      <p><strong>Date:</strong> ${new Date(app.acceptedAt || app.updatedAt || app.createdAt || Date.now()).toLocaleDateString()}</p>
                                      <p><strong>Position:</strong> ${app.jobTitle}</p>
                                      <p><strong>Company:</strong> ${app.companyName || 'Company'}</p>
                                    </div>
                                    <div class="content">${offer}</div>
                                  </body>
                                </html>
                              `);
                              printWindow.document.close();
                              printWindow.focus();
                              setTimeout(() => {
                                printWindow.print();
                                printWindow.close();
                              }, 250);
                            }
                          }
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                      >
                        Download Offer Letter
                      </button>
                    </div>
                    {typeof app.offerLetter === 'string' ? (
                      <p className="text-sm text-green-600 dark:text-green-400 line-clamp-3">{app.offerLetter}</p>
                    ) : (
                      <p className="text-xs text-green-600 dark:text-green-400">PDF uploaded by company</p>
                    )}
                  </div>
                )}

                {app.rejectionReason && (
                  <div className="ml-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mt-3">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">Rejection Reason</p>
                    <p className="text-sm text-red-600 dark:text-red-400 line-clamp-3">{app.rejectionReason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
