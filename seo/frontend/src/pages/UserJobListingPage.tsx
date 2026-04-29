import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building,
  Filter,
  Heart,
  ArrowRight,
  X
} from 'lucide-react';
import Button from '../components/Common/Button';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary: string;
  posted: string;
  description: string;
  requirements: string[];
  benefits: string[];
  companyLogo?: string;
  isSaved: boolean;
}

const UserJobListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
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

  // Fetch real jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        console.log('🔍 Starting to fetch jobs from API...');
        setIsLoading(true);
        const response = await apiService.getPublicJobs();

        console.log('📡 API Response:', response);

        if (response.success && response.data) {
          console.log('✅ Jobs fetched successfully:', response.data);
          // Transform API data to match our Job interface
          const transformedJobs: Job[] = response.data.map((job: any) => ({
            id: job.id.toString(),
            title: job.title,
            company: job.companyName || 'Company',
            location: job.location || 'Remote',
            type: job.jobType?.toLowerCase() as 'full-time' | 'part-time' | 'contract' | 'internship' || 'full-time',
            salary: job.salaryRange || 'Competitive',
            posted: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently',
            description: job.description || 'Join our team and make an impact!',
            requirements: job.requirements ? (Array.isArray(job.requirements) ? job.requirements : [job.requirements]) : ['Experience required'],
            benefits: job.benefits ? (Array.isArray(job.benefits) ? job.benefits : [job.benefits]) : ['Great work environment'],
            isSaved: false
          }));

          console.log('🔄 Transformed jobs:', transformedJobs);
          setJobs(transformedJobs);
          setFilteredJobs(transformedJobs);
        } else {
          console.warn('❌ Failed to fetch jobs:', response.error);
          setJobs([]);
          setFilteredJobs([]);
        }
      } catch (error) {
        console.error('💥 Error fetching jobs:', error);
        setJobs([]);
        setFilteredJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search and type
  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(job => job.type === selectedType);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, selectedType, jobs]);

  const handleApply = (job: Job) => {
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
        userName: `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || user.email,
        userEmail: user.email,
        coverLetter: applicationData.coverLetter,
        resume: resumePayload
      });

      if (response.success) {
        setShowApplicationModal(false);
        setApplicationData({ coverLetter: '', resume: null });
        setSelectedJob(null);
        alert('Application submitted successfully!');
      } else {
        alert(response.error || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      alert('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleSaveJob = (jobId: string) => {
    setJobs(jobs.map(job =>
      job.id === jobId ? { ...job, isSaved: !job.isSaved } : job
    ));
  };

  const jobTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Find Your Dream Job
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover opportunities that match your skills and aspirations
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs, companies, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Job Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {jobTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Found <span className="font-semibold text-gray-900 dark:text-white">{filteredJobs.length}</span> jobs
          </p>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Job Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {job.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.posted}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                          {job.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSaveJob(job.id)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${job.isSaved
                        ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    <Heart className={`w-4 h-4 ${job.isSaved ? 'fill-current' : ''}`} />
                  </motion.button>
                  <Button
                    onClick={() => handleApply(job)}
                    className="px-6 py-2"
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters to find more opportunities
            </p>
          </div>
        )}
      </div>

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

export default UserJobListingPage;
