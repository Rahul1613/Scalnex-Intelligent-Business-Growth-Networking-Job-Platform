import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Briefcase, Clock, Plus, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface JobListing {
  id: number;
  companyId: number;
  companyName: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  jobType: string;
  salaryRange: string;
  status: string;
  createdAt: string;
  applicationsCount: number;
}

interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  userId: number;
  userName: string;
  userEmail: string;
  coverLetter: string;
  resumeUrl: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: string;
  updatedAt: string;
}

const API_URL = 'http://127.0.0.1:5001';

const CompanyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token === 'guest-business-token') {
      setJobs([]);
      setApplications([]);
      setLoading(false);
      return;
    }

    if (isAuthenticated && user?.role === 'company') {
      fetchJobs();
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/jobs?company_id=${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch jobs');

      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load job listings');
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/applications/company`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch applications');

      const data = await res.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (appId: number, newStatus: 'accepted' | 'rejected') => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast.success(`Application ${newStatus}`);
      fetchApplications(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update application status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'reviewed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'accepted': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authentication Required</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Please log in as a company to access the dashboard.</p>
            <button
              onClick={() => navigate('/company-login')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium"
            >
              Go to Company Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'company') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Account</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">This page is for companies. Please use the User Dashboard.</p>
            <button
              onClick={() => navigate('/applications')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
            >
              Go to User Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your job listings and review applications.</p>
          </div>
          <button
            onClick={() => navigate('/recruitment')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center gap-2"
          >
            <Plus size={18} />
            Post New Job
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-2 mb-6 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'jobs'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            Job Listings ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'applications'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            Applications ({applications.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        ) : (
          <>
            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div className="space-y-4">
                {jobs.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
                    <Briefcase className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Job Listings Yet</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Post your first job to start receiving applications.</p>
                    <button
                      onClick={() => navigate('/recruitment')}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium inline-flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Post New Job
                    </button>
                  </div>
                ) : (
                  jobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{job.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Briefcase size={14} />
                              {job.jobType}
                            </span>
                            <span>{job.location}</span>
                            <span>{job.salaryRange}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full text-sm font-medium">
                            {job.applicationsCount} Applications
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${job.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                            {job.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">{job.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} />
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
                    <Users className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Applications Yet</h3>
                    <p className="text-gray-600 dark:text-gray-300">Applications will appear here once candidates apply for your jobs.</p>
                  </div>
                ) : (
                  applications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{app.userName}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{app.userEmail}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Briefcase size={14} />
                            <span>Applied for: {app.jobTitle}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>

                      {app.coverLetter && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Letter</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{app.coverLetter}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500">
                          <Clock size={12} className="inline mr-1" />
                          Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                        {app.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateApplicationStatus(app.id, 'accepted')}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                            >
                              <CheckCircle2 size={16} />
                              Accept
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(app.id, 'rejected')}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
