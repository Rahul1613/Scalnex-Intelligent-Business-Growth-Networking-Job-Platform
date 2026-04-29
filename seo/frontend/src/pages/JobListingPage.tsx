import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, MapPin, DollarSign, Calendar, Clock, Users, Building, Send, CheckCircle, X, Eye } from 'lucide-react';
import { apiService } from '../services/api';

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  jobType: string;
  salaryRange: string;
  status: string;
  createdAt: string;
  companyName: string;
  applicationsCount: number;
  hasApplied?: boolean;
}

const JobListingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resume: null as File | null
  });
  const [applying, setApplying] = useState(false);

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

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPublicJobs();
      if (response.success) {
        setJobs(response.data || []);
      } else {
        setError('Failed to load jobs');
      }
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job: Job) => {
    if (!isAuthenticated) {
      navigate('/user-login');
      return;
    }

    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!selectedJob || !user) return;

    // Validate resume is required
    if (!applicationData.resume) {
      alert('Resume is required. Please upload your resume to continue.');
      return;
    }

    try {
      setApplying(true);

      const resumePayload = applicationData.resume
        ? {
            name: applicationData.resume.name,
            type: applicationData.resume.type,
            data: await fileToBase64(applicationData.resume)
          }
        : null;

      const response = await apiService.submitApplication({
        jobId: selectedJob.id,
        userId: user.id,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        userEmail: user.email,
        coverLetter: applicationData.coverLetter,
        resume: resumePayload
      });
      
      if (response.success) {
        // Mark job as applied
        setJobs(jobs.map(job => 
          job.id === selectedJob.id ? { ...job, hasApplied: true } : job
        ));
        
        setShowApplicationModal(false);
        setApplicationData({ coverLetter: '', resume: null });
        setSelectedJob(null);
        alert('Application submitted successfully!');
      } else {
        setError(response.error || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleViewApplications = () => {
    if (!isAuthenticated) {
      navigate('/user-login');
      return;
    }
    navigate('/user-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading jobs...</p>
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Job Opportunities</h1>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <button
                  onClick={handleViewApplications}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  My Applications
                </button>
              )}
              {!isAuthenticated && (
                <>
                  <button
                    onClick={() => navigate('/user-login')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/user-signup')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
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

      {/* Jobs List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Available Positions ({jobs.length})
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Find your next career opportunity
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No jobs available</h3>
            <p className="text-gray-600 dark:text-gray-400">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        job.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <Building className="w-4 h-4" />
                      <span>{job.companyName}</span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.jobType}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salaryRange}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {job.applicationsCount} applicants
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {job.hasApplied ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Applied
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApply(job)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Apply Now
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedJob.title}</h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building className="w-4 h-4" />
                  <span>{selectedJob.companyName}</span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedJob.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {selectedJob.jobType}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {selectedJob.salaryRange}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedJob.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Job Description</h3>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedJob.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Requirements</h3>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedJob.requirements}</p>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  {selectedJob.hasApplied ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
                      <CheckCircle className="w-5 h-5" />
                      Already Applied
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedJob(null);
                        handleApply(selectedJob);
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {showApplicationModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Apply for {selectedJob.title}</h2>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cover Letter
                  </label>
                  <textarea
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Tell us why you're interested in this position..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resume <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setApplicationData({ ...applicationData, resume: e.target.files?.[0] || null })}
                    accept=".pdf,.doc,.docx"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  {!applicationData.resume && (
                    <p className="text-red-500 text-xs mt-1">Resume is required</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowApplicationModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitApplication}
                    disabled={applying || !applicationData.resume}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applying ? 'Submitting...' : (!applicationData.resume ? 'Upload Resume to Continue' : 'Submit Application')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListingPage;
