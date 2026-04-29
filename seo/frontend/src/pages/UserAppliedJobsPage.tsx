import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Building,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Filter,
  Search,
  ArrowRight
} from 'lucide-react';
import Button from '../components/Common/Button';
import { apiService } from '../services/api';

interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  appliedDate: string;
  status: 'pending' | 'viewed' | 'shortlisted' | 'rejected' | 'accepted';
  lastUpdated: string;
  hasResponse: boolean;
  responseMessage?: string;
  companyLogo?: string;
}

const UserAppliedJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real application data from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getUserApplications();
        
        if (response.success && response.data) {
          // Transform API data to match our JobApplication interface
          const transformedApplications: JobApplication[] = response.data.map((app: any) => ({
            id: app.id.toString(),
            jobId: app.job?.id?.toString() || '1',
            jobTitle: app.job?.title || 'Unknown Position',
            company: app.job?.companyName || 'Unknown Company',
            location: app.job?.location || 'Remote',
            type: app.job?.jobType?.toLowerCase() as 'full-time' | 'part-time' | 'contract' | 'internship' || 'full-time',
            salary: app.job?.salaryRange || 'Competitive',
            appliedDate: app.createdAt || new Date().toISOString().split('T')[0],
            status: app.status || 'pending',
            lastUpdated: app.updatedAt || app.createdAt || new Date().toISOString().split('T')[0],
            hasResponse: app.status !== 'pending' && (app.offerLetter || app.rejectionReason),
            responseMessage: app.offerLetter || app.rejectionReason || undefined,
            companyLogo: ''
          }));
          
          setApplications(transformedApplications);
          setFilteredApplications(transformedApplications);
        } else {
          console.warn('Failed to fetch applications:', response.error);
          setApplications([]);
          setFilteredApplications([]);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        setApplications([]);
        setFilteredApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Filter applications based on search and status
  useEffect(() => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    setFilteredApplications(filtered);
  }, [searchTerm, selectedStatus, applications]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'viewed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'shortlisted':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'accepted':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'viewed':
        return <Eye className="w-4 h-4" />;
      case 'shortlisted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'viewed', label: 'Viewed' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'accepted', label: 'Accepted' }
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
            My Job Applications
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track the status of your job applications and company responses
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
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">{filteredApplications.length}</span> applications
          </p>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.map((application, index) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Application Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {application.jobTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {application.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {application.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied: {new Date(application.appliedDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                        {application.hasResponse && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            <MessageSquare className="w-4 h-4" />
                            Has Response
                          </span>
                        )}
                      </div>

                      {/* Response Message */}
                      {application.hasResponse && application.responseMessage && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Company Response:</strong> {application.responseMessage}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/user/job-responses/${application.id}`)}
                    className="px-6 py-2"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Applications */}
        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No applications found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start applying for jobs to see your applications here
            </p>
            <Button onClick={() => navigate('/user/job-listing')}>
              Browse Jobs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAppliedJobsPage;
