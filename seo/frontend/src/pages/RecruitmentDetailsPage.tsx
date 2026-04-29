import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Briefcase, Users, Plus, FileText, Calendar, MapPin, DollarSign, ChevronRight, X, Eye, Reply } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  jobType: string;
  salaryRange: string;
  status: 'active' | 'closed';
  createdAt: string;
  applicationsCount: number;
  requirements?: string;
  companyId?: number;
  companyName?: string;
}

interface Application {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  job: {
    id: number;
    title: string;
  };
  status: 'pending' | 'screening' | 'interview' | 'reviewing' | 'accepted' | 'selected' | 'rejected';
  createdAt: string;
  coverLetter: string;
  resume?: string;
  rejectionReason?: string;
  offerLetter?: string;
  messages?: Array<{
    id: number;
    sender: string;
    message: string;
    createdAt: string;
  }>;
}

const RecruitmentDetailsPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | string>('all');

  // Application management state
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [companyMessage, setCompanyMessage] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [offerLetterFile, setOfferLetterFile] = useState<File | null>(null);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [messageTextInput, setMessageTextInput] = useState('');
  const [aptitudeInfoInput, setAptitudeInfoInput] = useState('');
  const [meetupLinkInput, setMeetupLinkInput] = useState('');
  const [selectedStageInput, setSelectedStageInput] = useState<'screening' | 'interview' | ''>('');

  // Job posting form state
  const [jobForm, setJobForm] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: ''
  });
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [jobActionLoadingId, setJobActionLoadingId] = useState<number | null>(null);

  // Load data when component mounts or authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      // Clear data when not authenticated
      setJobs([]);
      setApplications([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Clear authentication errors when user clicks sign in
  const handleSignIn = () => {
    // Clear expired auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setError('');
    // Redirect to sign in
    window.location.assign('/business-signin');
  };

  // Retry loading data
  const handleRetry = () => {
    setError('');
    if (isAuthenticated) {
      loadData();
    }
  };

  // Quick debug - check if page is working
  useEffect(() => {
    console.log('=== RECRUITMENT PAGE DEBUG ===');
    console.log('Is Authenticated:', isAuthenticated);
    console.log('User:', user);
    console.log('Token in localStorage:', !!localStorage.getItem('auth_token'));
    console.log('Current jobs count:', jobs.length);
    console.log('==============================');
  });

  // Debug authentication state
  useEffect(() => {
    console.log('Authentication state:', isAuthenticated);
    console.log('User:', user);
    console.log('Token exists:', !!localStorage.getItem('auth_token'));
  }, [isAuthenticated, user]);

  // Debug jobs array
  useEffect(() => {
    console.log('Jobs array updated:', jobs);
    console.log('Jobs length:', jobs.length);
  }, [jobs]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');

      console.log('Starting loadData...');

      // Load jobs - use different endpoints based on authentication
      let jobsResponse;
      const isCompany = !!(user && (user.role === 'company' || (user as any).companyName));

      if (isCompany) {
        // Authenticated company user - get their specific jobs
        jobsResponse = await apiService.getCompanyJobs();
      } else {
        // Public user or regular user - get all public jobs
        jobsResponse = await apiService.getPublicJobs();
      }

      console.log('Jobs API response:', jobsResponse);
      if (jobsResponse.success) {
        console.log('Setting jobs:', jobsResponse.data);
        setJobs(jobsResponse.data || []);
        console.log('Jobs set successfully');
      } else {
        // Check if it's an auth error
        if (jobsResponse.error?.includes('Authentication') || jobsResponse.error?.includes('expired') || jobsResponse.error?.includes('401')) {
          setError('Authentication expired. Please sign in again.');
          // Clear expired token
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          return;
        }
        console.error('Failed to load jobs:', jobsResponse.error);
        setError(jobsResponse.error || 'Failed to load jobs');
      }

      // Load applications - only for authenticated companies
      let applicationsResponse;
      if (isCompany) {
        applicationsResponse = await apiService.getCompanyApplications();
        console.log('Applications API response:', applicationsResponse);
        if (applicationsResponse.success) {
          console.log('Setting applications:', applicationsResponse.data);
          setApplications(applicationsResponse.data || []);
        } else {
          // Check if it's an auth error
          if (applicationsResponse.error?.includes('Authentication') || applicationsResponse.error?.includes('expired') || applicationsResponse.error?.includes('401')) {
            setError('Authentication expired. Please sign in again.');
            // Clear expired token
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            return;
          }
          console.error('Failed to load applications:', applicationsResponse.error);
          // Don't override error if already set from jobs
          if (!error) {
            setError(applicationsResponse.error || 'Failed to load applications');
          }
        }
      } else {
        // Non-company users don't have applications to view
        setApplications([]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
      console.log('LoadData completed');
    }
  };

  const handlePostJob = async () => {
    console.log('handlePostJob called');
    console.log('Job form:', jobForm);

    if (!jobForm.title || !jobForm.description) {
      console.log('Validation failed - missing title or description');
      setError('Title and description are required');
      return;
    }

    try {
      console.log('Starting job submission...');
      setIsSubmittingJob(true);
      setError('');

      // Map frontend form to backend API format
      const jobData = {
        title: jobForm.title,
        description: jobForm.description || `Position in ${jobForm.department} department`,
        requirements: jobForm.requirements,
        location: jobForm.location,
        job_type: jobForm.type,  // Backend expects 'job_type'
        salary_range: jobForm.salary  // Backend expects 'salary_range'
      };

      console.log('Job data to send:', jobData);
      const response = await apiService.createJob(jobData);
      console.log('API response:', response);

      if (response.success) {
        console.log('Job created successfully:', response.data);
        setShowPostJobModal(false);
        setJobForm({
          title: '',
          department: '',
          location: '',
          type: 'Full-time',
          salary: '',
          description: '',
          requirements: ''
        });
        await loadData(); // Reload jobs
        console.log('Jobs reloaded, current jobs count:', jobs.length);
      } else {
        console.error('Failed to create job:', response.error);
        setError(response.error || 'Failed to post job');
      }
    } catch (err) {
      console.error('Error posting job:', err);
      setError('Failed to post job');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  // Close/complete a job (set status to 'closed')
  const handleCloseJob = async (jobId: number) => {
    const isCompany = !!(user && (user.role === 'company' || (user as any).companyName));
    if (!isCompany) {
      setError('Please sign in as a company to manage job listings');
      navigate('/business-signin');
      return;
    }
    if (!confirm("Mark this job as completed/closed? Candidates won't be able to apply.")) return;
    try {
      setJobActionLoadingId(jobId);
      const res = await apiService.updateJob(jobId, { status: 'closed' });
      if (res.success) {
        await loadData();
      } else {
        setError(res.error || 'Failed to close job');
      }
    } catch (e) {
      setError('Failed to close job');
    } finally {
      setJobActionLoadingId(null);
    }
  };

  // Permanently delete a job
  const handleDeleteJob = async (jobId: number) => {
    const isCompany = !!(user && (user.role === 'company' || (user as any).companyName));
    if (!isCompany) {
      setError('Please sign in as a company to manage job listings');
      navigate('/business-signin');
      return;
    }
    if (!confirm('Permanently delete this job and its applications? This cannot be undone.')) return;
    try {
      setJobActionLoadingId(jobId);
      const res = await apiService.deleteJob(jobId);
      if (res.success) {
        await loadData();
      } else {
        setError(res.error || 'Failed to delete job');
      }
    } catch (e) {
      setError('Failed to delete job');
    } finally {
      setJobActionLoadingId(null);
    }
  };

  const handleAcceptApplication = (application: Application) => {
    setSelectedApplication(application);
    setCompanyMessage('');
    setShowAcceptModal(true);
  };

  const handleRejectApplication = (application: Application) => {
    setSelectedApplication(application);
    setCompanyMessage('');
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleOpenSendMessage = (application: Application) => {
    setSelectedApplication(application);
    setMessageTextInput('');
    setAptitudeInfoInput('');
    setMeetupLinkInput('');
    setSelectedStageInput('');
    setShowSendMessageModal(true);
  };

  const confirmSendMessage = async () => {
    if (!selectedApplication) return;
    if (!messageTextInput && !aptitudeInfoInput && !meetupLinkInput) {
      setError('Please provide a message or interview details');
      return;
    }
    try {
      setProcessingAction(true);
      const payload: any = {
        message: messageTextInput,
      };
      if (selectedStageInput) payload.stage = selectedStageInput;
      if (aptitudeInfoInput) payload.aptitudeInfo = aptitudeInfoInput;
      if (meetupLinkInput) payload.meetupLink = meetupLinkInput;

      const res = await apiService.sendApplicationMessage(selectedApplication.id, payload);
      if (res.success) {
        setShowSendMessageModal(false);
        setSelectedApplication(null);
        await loadData();
        alert('Message sent to candidate');
      } else {
        setError(res.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReplyToCandidate = (messageId: string) => {
    navigate(`/business/reply-to-candidate/${messageId}`);
  };

  const confirmAcceptApplication = async () => {
    if (!selectedApplication) return;

    try {
      setProcessingAction(true);

      let offerLetterPayload = null;
      if (offerLetterFile) {
        // Convert file to base64
        const fileToBase64 = (file: File): Promise<string> => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.onload = () => {
              const result = reader.result;
              if (typeof result !== 'string') return reject(new Error('Failed to read file'));
              const commaIdx = result.indexOf(',');
              resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
            };
            reader.readAsDataURL(file);
          });
        };
        offerLetterPayload = {
          name: offerLetterFile.name,
          type: offerLetterFile.type,
          data: await fileToBase64(offerLetterFile)
        };
      }

      const response = await apiService.acceptApplication(selectedApplication.id, offerLetterPayload || '', companyMessage || '');

      if (response.success) {
        setShowAcceptModal(false);
        setSelectedApplication(null);
        setOfferLetterFile(null);
        await loadData(); // Reload applications
        alert('Application accepted and offer letter sent!');
      } else {
        setError(response.error || 'Failed to accept application');
      }
    } catch (err) {
      console.error('Error accepting application:', err);
      setError('Failed to accept application');
    } finally {
      setProcessingAction(false);
    }
  };

  const confirmRejectApplication = async () => {
    if (!selectedApplication || !rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      setProcessingAction(true);

      const response = await apiService.rejectApplication(selectedApplication.id, rejectionReason, companyMessage || '');

      if (response.success) {
        setShowRejectModal(false);
        setSelectedApplication(null);
        setRejectionReason('');
        await loadData(); // Reload applications
        alert('Application rejected with reason sent to candidate');
      } else {
        setError(response.error || 'Failed to reject application');
      }
    } catch (err) {
      console.error('Error rejecting application:', err);
      setError('Failed to reject application');
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'screening': return 'bg-indigo-100 text-indigo-800';
      case 'interview': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'selected': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications = applications.filter(app => {
    if (!app) return false;
    if (filterStatus !== 'all' && app.status !== filterStatus) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (app.user && ((app.user.name || '').toLowerCase().includes(q) || (app.user.email || '').toLowerCase().includes(q))) ||
      (app.job && (app.job.title || '').toLowerCase().includes(q)) ||
      (app.coverLetter || '').toLowerCase().includes(q)
    );
  });

  return (
    <>
      <DashboardLayout>
        <div className="p-6">
          {/* Show sign-in message for unauthenticated users */}
          {!isAuthenticated ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Authentication Required</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Please sign in to access recruitment features</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleSignIn}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/company-signup')}
                  className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Sign Up
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {(() => {
                    const isCompany = !!(user && (user.role === 'company' || (user as any).companyName));
                    return isCompany ? 'Recruitment Details' : 'Job Opportunities';
                  })()}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {(() => {
                    const isCompany = !!(user && (user.role === 'company' || (user as any).companyName));
                    return isCompany ? 'Manage your job listings and review applications.' : 'Browse available job opportunities.';
                  })()}
                </p>
              </div>

              {/* Stats Cards */}
              {(() => {
                const isCompany = !!(user && (user.role === 'company' || (user as any).companyName));
                return isCompany ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{jobs.length}</p>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                          <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{applications.length}</p>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                          <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {applications.filter(app => app.status === 'pending' || app.status === 'reviewing').length}
                          </p>
                        </div>
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                          <FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Available Jobs</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{jobs.length}</p>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                          <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Companies Hiring</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {new Set(jobs.map(job => job.companyId)).size}
                          </p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                          <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Error:</span> {error}
                    </div>
                    <div className="flex gap-2">
                      {error.includes('Authentication') || error.includes('expired') ? (
                        <button
                          onClick={handleSignIn}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Sign In Again
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleRetry}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                          >
                            Retry
                          </button>
                          <button
                            onClick={() => setError('')}
                            className="px-3 py-1 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Loading recruitment data...</p>
                </div>
              ) : (
                <>
                  {/* Action Button */}
                  <div className="mb-6 flex gap-3">
                    {(() => { const isCompany = !!(user && (user.role === 'company' || (user as any).companyName)); return isCompany; })() ? (
                      <>
                        <button
                          onClick={() => setShowPostJobModal(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                          Post New Job
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => navigate('/business-signin')}
                        className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Sign in as Company to Post
                      </button>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        onClick={() => setActiveTab('jobs')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'jobs'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                          }`}
                      >
                        Job Listings ({jobs.length})
                      </button>
                      {(() => { const isCompany = !!(user && (user.role === 'company' || (user as any).companyName)); return isCompany; })() && (
                        <button
                          onClick={() => setActiveTab('applications')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'applications'
                              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                          Applications ({applications.length})
                        </button>
                      )}
                    </nav>
                  </div>

                  {/* Content */}
                  {activeTab === 'jobs' && (
                    <div>
                      {jobs.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {(() => {
                              const isCompany = !!(user && (user.role === 'company' || (user as any).companyName));
                              return isCompany ? 'No Job Listings Yet' : 'No Job Listings Available';
                            })()}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {(() => {
                              const isCompany = !!(user && (user.role === 'company' || (user as any).companyName));
                              return isCompany ? 'Post your first job to start receiving applications.' : 'Check back later for new job opportunities.';
                            })()}
                          </p>
                          {(() => {
                            const isCompany = !!(user && (user.role === 'company' || (user as any).companyName));
                            return isCompany ? (
                              <button
                                onClick={() => setShowPostJobModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors"
                              >
                                <Plus className="w-5 h-5" />
                                Post Your First Job
                              </button>
                            ) : null;
                          })()}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {jobs.map((job) => (
                            <div key={job.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{job.title}</h3>
                                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {job.location || 'Location not specified'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Briefcase className="w-4 h-4" />
                                      {job.jobType || 'Full-time'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="w-4 h-4" />
                                      {job.salaryRange || 'Salary not specified'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                    {job.status}
                                  </span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {job.applicationsCount || 0} applicants
                                  </span>
                                  <ChevronRight className="w-5 h-5 text-gray-400" />
                                  {(() => { const isCompany = !!(user && (user.role === 'company' || (user as any).companyName)); return isCompany; })() && (
                                    <div className="flex gap-2 ml-2">
                                      {job.status !== 'closed' && (
                                        <button
                                          onClick={() => handleCloseJob(job.id)}
                                          disabled={jobActionLoadingId === job.id}
                                          className="px-3 py-1 text-xs rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white disabled:opacity-50"
                                        >
                                          {jobActionLoadingId === job.id ? 'Closing...' : 'Mark Complete'}
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleDeleteJob(job.id)}
                                        disabled={jobActionLoadingId === job.id}
                                        className="px-3 py-1 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                                      >
                                        {jobActionLoadingId === job.id ? 'Deleting...' : 'Delete'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'applications' && (
                    <div>
                      {applications.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Applications Yet</h3>
                          <p className="text-gray-600 dark:text-gray-400">Applications will appear here once candidates start applying to your job listings.</p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <input
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search by name, email, or job title"
                              className="w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                              <option value="all">All Statuses</option>
                              <option value="pending">Pending</option>
                              <option value="screening">Screening</option>
                              <option value="interview">Interview</option>
                              <option value="reviewing">Reviewing</option>
                              <option value="selected">Selected</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>

                          <div className="space-y-4">
                            {filteredApplications.map((application) => (
                              <div key={application.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{application.user.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{application.user.email}</p>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                      <span className="font-medium">{application.job.title}</span>
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Applied {new Date(application.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>

                                    {application.coverLetter && (
                                      <div className="mt-3">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Cover Letter</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{application.coverLetter}</p>
                                      </div>
                                    )}

                                    {application.resume && (
                                      <div className="mt-3">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Resume</h4>
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => {
                                              const resumeUrl = application.resume;
                                              if (resumeUrl && resumeUrl.startsWith('/uploads/')) {
                                                const link = document.createElement('a');
                                                const API_BASE = (import.meta as any)?.env?.VITE_API_URL || 'http://127.0.0.1:5001';
                                                link.href = `${API_BASE}${resumeUrl}`;
                                                link.download = `resume_${application.user.name.replace(/\s+/g, '_')}.pdf`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                              } else if (resumeUrl && resumeUrl.startsWith('data:')) {
                                                const parts = resumeUrl.split(',');
                                                const mimeType = parts[0].split(':')[1].split(';')[0];
                                                const data = parts[1];
                                                const byteChars = atob(data);
                                                const byteNumbers = new Array(byteChars.length);
                                                for (let i = 0; i < byteChars.length; i++) {
                                                  byteNumbers[i] = byteChars.charCodeAt(i);
                                                }
                                                const byteArray = new Uint8Array(byteNumbers);
                                                const blob = new Blob([byteArray], { type: mimeType });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `resume_${application.user.name.replace(/\s+/g, '_')}.${mimeType.split('/')[1] || 'file'}`;
                                                document.body.appendChild(a);
                                                a.click();
                                                a.remove();
                                                URL.revokeObjectURL(url);
                                              }
                                            }}
                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                                          >
                                            <FileText className="w-3 h-3" />
                                            Download Resume
                                          </button>
                                          {application.resume && application.resume.startsWith('/uploads/') && (
                                            <button
                                              onClick={() => window.open(`${(import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5001'}${application.resume}`, '_blank')}
                                              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                                            >
                                              <Eye className="w-3 h-3" />
                                              Preview
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {!application.resume && (
                                      <p className="text-gray-500 dark:text-gray-400 text-sm italic">No resume uploaded</p>
                                    )}

                                    {application.rejectionReason && (
                                      <div className="mt-3">
                                        <h4 className="font-medium text-red-600 dark:text-red-400 mb-1">Rejection Reason</h4>
                                        <p className="text-red-600 dark:text-red-400 text-sm">{application.rejectionReason}</p>
                                      </div>
                                    )}

                                    {application.offerLetter && (
                                      <div className="mt-3">
                                        <h4 className="font-medium text-green-600 dark:text-green-400 mb-1">Offer Letter Sent</h4>
                                        <p className="text-green-600 dark:text-green-400 text-sm">Offer letter has been sent to the candidate</p>
                                      </div>
                                    )}

                                    {/* Messages timeline */}
                                    {application.messages && application.messages.length > 0 && (
                                      <div className="mt-4">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Messages</h4>
                                        <div className="space-y-2">
                                          {application.messages.map((m) => (
                                            <div key={m.id} className={`p-3 rounded-md ${m.sender === 'company' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-900'}`}>
                                              <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                  <div className="text-xs text-gray-500">{m.sender === 'company' ? 'You' : application.user.name} • {new Date(m.createdAt).toLocaleString()}</div>
                                                  <div className="text-sm text-gray-700 dark:text-gray-200 mt-1 whitespace-pre-wrap">{m.message}</div>
                                                </div>
                                                {m.sender !== 'company' && (
                                                  <button
                                                    onClick={() => handleReplyToCandidate(m.id.toString())}
                                                    className="ml-2 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1"
                                                    title="Reply to this message"
                                                  >
                                                    <Reply className="w-3 h-3" />
                                                    Reply
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                      {application.status}
                                    </span>
                                    <div className="flex gap-2 flex-col md:flex-row">
                                      <button
                                        onClick={() => handleOpenSendMessage(application)}
                                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg transition-colors"
                                      >
                                        Send Message
                                      </button>
                                      {/* Only show Accept/Reject after company has sent at least one message */}
                                      {application.messages && application.messages.some(m => m.sender === 'company') && (
                                        <>
                                          <button
                                            onClick={() => handleAcceptApplication(application)}
                                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                                          >
                                            Accept
                                          </button>
                                          <button
                                            onClick={() => handleRejectApplication(application)}
                                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                                          >
                                            Reject
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </DashboardLayout>

      {/* Post Job Modal */}
      {showPostJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Post New Job</h2>
                <button
                  onClick={() => setShowPostJobModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. Senior Software Engineer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={jobForm.department}
                    onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. Engineering"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. New York, NY"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Type</label>
                  <select
                    value={jobForm.type}
                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. $80,000 - $120,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Description</label>
                  <textarea
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirements</label>
                  <textarea
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="List the required qualifications, skills, and experience..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowPostJobModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePostJob}
                    disabled={isSubmittingJob}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingJob ? 'Posting...' : 'Post Job'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept Application Modal */}
      {showAcceptModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Accept Application</h2>
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Candidate: {selectedApplication.user.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedApplication.user.email}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Position: {selectedApplication.job.title}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Cover Letter Preview:</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">{selectedApplication.coverLetter}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Offer Letter (PDF) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setOfferLetterFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Upload the signed offer letter PDF to send to the candidate.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Optional message to candidate
                  </label>
                  <textarea
                    value={companyMessage}
                    onChange={(e) => setCompanyMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Write an optional message to include with the offer (congratulations, next steps, contact info)..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAcceptModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAcceptApplication}
                    disabled={processingAction}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingAction ? 'Processing...' : 'Accept & Send Offer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Application Modal */}
      {showRejectModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reject Application</h2>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Candidate: {selectedApplication.user.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedApplication.user.email}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Position: {selectedApplication.job.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Please provide a reason for rejection..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Optional message to candidate
                  </label>
                  <textarea
                    value={companyMessage}
                    onChange={(e) => setCompanyMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Write an optional message to include with the rejection (feedback, next steps, resources)..."
                  />
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    The rejection reason will be sent to the candidate to help them understand the decision.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRejectApplication}
                    disabled={processingAction}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingAction ? 'Processing...' : 'Reject & Send Reason'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Send Message Modal */}
      {showSendMessageModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Send Message / Interview Details</h2>
                <button
                  onClick={() => setShowSendMessageModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Candidate: {selectedApplication.user.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedApplication.user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                  <textarea
                    value={messageTextInput}
                    onChange={(e) => setMessageTextInput(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Write details for candidate (agenda, expectations, contact info)..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aptitude Test Info (optional)</label>
                  <input type="text" value={aptitudeInfoInput} onChange={(e) => setAptitudeInfoInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder="e.g. Link to test or instructions" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google Meet / Interview Link (optional)</label>
                  <input type="text" value={meetupLinkInput} onChange={(e) => setMeetupLinkInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder="https://meet.google.com/..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stage (optional)</label>
                  <select value={selectedStageInput} onChange={(e) => setSelectedStageInput(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <option value="">No change</option>
                    <option value="screening">Move to Screening</option>
                    <option value="interview">Move to Interview</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowSendMessageModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
                  <button onClick={confirmSendMessage} disabled={processingAction} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{processingAction ? 'Sending...' : 'Send Message'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecruitmentDetailsPage;
