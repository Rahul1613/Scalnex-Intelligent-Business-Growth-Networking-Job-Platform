import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Calendar, MapPin, Building, CheckCircle, Clock, X, Eye, FileText } from 'lucide-react';
import { apiService } from '../services/api';

interface Application {
  id: number;
  job: {
    id: number;
    title: string;
    companyName: string;
    location: string;
    jobType: string;
    salaryRange: string;
  };
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  createdAt: string;
  coverLetter: string;
  resume?: string;
  rejectionReason?: string;
  offerLetter?: string;
}

const UserApplicationsPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    console.log('UserApplicationsPage - User:', user);
    console.log('UserApplicationsPage - User role:', user?.role);
    console.log('UserApplicationsPage - Is Authenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      navigate('/user-login');
      return;
    }
    
    // Check if this is a company user trying to access user applications
    if (user?.role === 'company' || user?.companyName !== null) {
      console.log('Company user trying to access user applications, redirecting...');
      setError('This page is for job seekers, not companies. Redirecting to company dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      return;
    }
    
    // Prevent multiple API calls
    if (!loading) {
      loadApplications();
    }
  }, [isAuthenticated, navigate, user, loading]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getUserApplications();
      
      if (response.success) {
        setApplications(response.data || []);
      } else {
        // Check if it's an authentication error
        if (response.error?.includes('Authentication') || response.error?.includes('expired') || response.error?.includes('401')) {
          setError('Authentication expired. Please sign in again.');
          // Clear expired token
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate('/user-login');
          }, 2000);
        } else {
          setError(response.error || 'Failed to load applications');
        }
      }
    } catch (err) {
      console.error('Error loading applications:', err);
      // Check if it's a network/CORS error
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to load applications');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'reviewing': return <Eye className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Applications</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/recruitment')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Jobs
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  localStorage.removeItem('auth_user');
                  navigate('/');
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your Applications ({applications.length})
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track the status of your job applications
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Start applying for jobs to see them here</p>
            <button
              onClick={() => navigate('/recruitment')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((application) => (
              <div key={application.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{application.job.title}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <Building className="w-4 h-4" />
                      <span>{application.job.companyName}</span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {application.job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {application.job.jobType}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {application.job.salaryRange}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {application.coverLetter && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Cover Letter</h4>
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{application.coverLetter}</p>
                      </div>
                    )}
                    {application.rejectionReason && (
                      <div className="mt-3">
                        <h4 className="font-medium text-red-600 dark:text-red-400 mb-1">Rejection Reason</h4>
                        <p className="text-red-600 dark:text-red-400 text-sm">{application.rejectionReason}</p>
                      </div>
                    )}
                    {application.offerLetter && (
                      <div className="mt-3">
                        <h4 className="font-medium text-green-600 dark:text-green-400 mb-1">Offer Letter</h4>
                        <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                          <p className="text-green-800 dark:text-green-200 text-sm mb-2">Congratulations! You've been offered this position.</p>
                          <button
                            onClick={() => setSelectedApplication(application)}
                            className="text-green-600 dark:text-green-400 text-sm underline hover:text-green-700 dark:hover:text-green-300"
                          >
                            View Offer Letter
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedApplication.job.title}</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building className="w-4 h-4" />
                  <span>{selectedApplication.job.companyName}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(selectedApplication.status)}`}>
                    {getStatusIcon(selectedApplication.status)}
                    {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedApplication.job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {selectedApplication.job.jobType}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {selectedApplication.job.salaryRange}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Applied: {new Date(selectedApplication.createdAt).toLocaleDateString()} at {new Date(selectedApplication.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cover Letter</h3>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                </div>

                {selectedApplication.messages && selectedApplication.messages.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Messages from Company</h3>
                    <div className="space-y-3">
                      {selectedApplication.messages.map((m: any) => (
                        <div key={m.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="text-sm text-gray-700 dark:text-gray-200 mb-1">{m.sender === 'company' ? 'From Company' : m.sender}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{m.message}</div>
                          <div className="text-xs text-gray-400 mt-2">Sent: {new Date(m.createdAt).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedApplication.rejectionReason && (
                  <div>
                    <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">Rejection Reason</h3>
                    <p className="text-red-600 dark:text-red-400 whitespace-pre-wrap">{selectedApplication.rejectionReason}</p>
                  </div>
                )}

                {selectedApplication.offerLetter && (
                  <div>
                    <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">Offer Letter</h3>
                    <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedApplication.offerLetter}</p>
                      <button
                        onClick={() => {
                          // Create and download offer letter as text file
                          const blob = new Blob([selectedApplication.offerLetter || ''], { type: 'text/plain' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `offer_letter_${selectedApplication.job.title.replace(/\s+/g, '_')}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          window.URL.revokeObjectURL(url);
                        }}
                        className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                      >
                        Download Offer Letter
                      </button>
                    </div>
                  </div>
                )}

                {selectedApplication.resume && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Resume</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FileText className="w-4 h-4" />
                      <span>Resume attached</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserApplicationsPage;
