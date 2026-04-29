import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Briefcase,
  Building,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  MessageSquare,
  ArrowLeft,
  User,
  Mail,
  Phone,
  FileText,
  Download,
  Reply
} from 'lucide-react';
import Button from '../components/Common/Button';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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

interface CompanyResponse {
  id: string;
  applicationId: string;
  company: string;
  responderName: string;
  responderTitle: string;
  responderEmail: string;
  responderPhone?: string;
  message: string;
  responseType: 'initial_review' | 'interview_request' | 'rejection' | 'offer' | 'follow_up';
  sentDate: string;
  isRead: boolean;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  nextSteps?: string[];
  interviewDetails?: {
    date: string;
    time: string;
    type: string;
    location: string;
    meetingLink?: string;
  };
}

const UserJobResponsesPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [responses, setResponses] = useState<CompanyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  useEffect(() => {
    if (!applicationId) return;

    const fetchApplicationData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all applications and find the specific one
        const response = await apiService.getUserApplications();
        
        if (response.success && response.data) {
          const appData = response.data.find((app: any) => app.id.toString() === applicationId);
          
            if (appData) {
            const application: JobApplication = {
              id: appData.id.toString(),
              jobId: appData.job?.id?.toString() || '1',
              jobTitle: appData.job?.title || 'Unknown Position',
              company: appData.job?.companyName || 'Unknown Company',
              location: appData.job?.location || 'Remote',
              type: appData.job?.jobType || 'full-time',
              salary: appData.job?.salaryRange || 'Competitive',
              appliedDate: appData.createdAt || new Date().toISOString().split('T')[0],
              status: appData.status || 'pending',
              lastUpdated: appData.updatedAt || appData.createdAt || new Date().toISOString().split('T')[0],
              hasResponse: appData.status !== 'pending' && (appData.offerLetter || appData.rejectionReason),
              responseMessage: appData.offerLetter || appData.rejectionReason || undefined,
              companyLogo: ''
            };
            
            setApplication(application);
            
            // If company messages are present, map them to responses
            const mappedResponses: CompanyResponse[] = [];
            if (appData.messages && appData.messages.length > 0) {
              appData.messages.forEach((m: any, idx: number) => {
                mappedResponses.push({
                  id: (m.id || idx).toString(),
                  applicationId: applicationId,
                  company: application.company,
                  responderName: m.sender === 'company' ? 'Hiring Team' : 'You',
                  responderTitle: m.sender === 'company' ? 'Recruiter' : 'Candidate',
                  responderEmail: m.sender === 'company' ? (application.company?.toLowerCase() + '@example.com') : user?.email || '',
                  responderPhone: '',
                  message: m.message,
                  responseType: m.sender === 'company' ? 'interview_request' : 'follow_up',
                  sentDate: m.createdAt || application.lastUpdated,
                  isRead: false,
                  attachments: [],
                });
              });
            } else {
              // Fallback to previous mock behaviors
              if (appData.offerLetter) {
                mappedResponses.push({
                  id: '1',
                  applicationId: applicationId,
                  company: application.company,
                  responderName: 'HR Manager',
                  responderTitle: 'Human Resources',
                  responderEmail: 'hr@' + application.company.toLowerCase().replace(' ', '') + '.com',
                  responderPhone: '+1 (555) 123-4567',
                  message: appData.offerLetter,
                  responseType: 'offer',
                  sentDate: application.lastUpdated,
                  isRead: false,
                  nextSteps: ['Review offer letter', 'Accept or decline offer', 'Complete onboarding documents'],
                  interviewDetails: {
                    date: 'TBD',
                    time: 'TBD',
                    type: 'Offer Discussion',
                    location: 'Phone/Video Call',
                    meetingLink: ''
                  }
                });
              } else if (appData.rejectionReason) {
                mappedResponses.push({
                  id: '1',
                  applicationId: applicationId,
                  company: application.company,
                  responderName: 'HR Manager',
                  responderTitle: 'Human Resources',
                  responderEmail: 'hr@' + application.company.toLowerCase().replace(' ', '') + '.com',
                  responderPhone: '+1 (555) 123-4567',
                  message: appData.rejectionReason,
                  responseType: 'rejection',
                  sentDate: application.lastUpdated,
                  isRead: false
                });
              }
            }

            setResponses(mappedResponses);
          } else {
            console.warn('Application not found');
          }
        } else {
          console.warn('Failed to fetch application:', response.error);
        }
      } catch (error) {
        console.error('Error fetching application:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationData();
  }, [applicationId]);

  const getResponseTypeColor = (type: string) => {
    switch (type) {
      case 'initial_review':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'interview_request':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'rejection':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'offer':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      case 'follow_up':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getResponseTypeLabel = (type: string) => {
    switch (type) {
      case 'initial_review':
        return 'Initial Review';
      case 'interview_request':
        return 'Interview Request';
      case 'rejection':
        return 'Rejection';
      case 'offer':
        return 'Job Offer';
      case 'follow_up':
        return 'Follow Up';
      default:
        return 'Response';
    }
  };

  const handleMarkAsRead = (responseId: string) => {
    setResponses(responses.map(response =>
      response.id === responseId ? { ...response, isRead: true } : response
    ));
  };

  const handleReply = (responseId: string) => {
    // Navigate to reply page or open reply modal
    navigate(`/user/reply-to-company/${responseId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Application Not Found
          </h2>
          <Button onClick={() => navigate('/user/applied-jobs')}>
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/user/applied-jobs')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Company Responses
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {application.jobTitle}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
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
              </div>
            </div>
          </div>
        </div>

        {/* Responses */}
        <div className="space-y-6">
          {responses.map((response, index) => (
            <motion.div
              key={response.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
            >
              {/* Response Header */}
              <div className={`border-b p-6 ${response.responderName === 'You' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${response.responderName === 'You' ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {response.responderName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResponseTypeColor(response.responseType)}`}>
                          {getResponseTypeLabel(response.responseType)}
                        </span>
                        {!response.isRead && response.responderName !== 'You' && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {response.responderTitle} at {response.company}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {response.responderEmail}
                        </span>
                        {response.responderPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {response.responderPhone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(response.sentDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!response.isRead && response.responderName !== 'You' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(response.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                    {response.responderName !== 'You' && (
                      <Button
                        size="sm"
                        onClick={() => handleReply(response.id)}
                      >
                        <Reply className="w-4 h-4 mr-2" />
                        Reply
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Response Content */}
              <div className="p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {response.message}
                  </p>
                </div>

                {/* Interview Details */}
                {response.interviewDetails && (
                  <div className="mt-6 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3">
                      Interview Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-green-700 dark:text-green-400">Date:</span>
                        <span className="ml-2 text-green-600 dark:text-green-300">{response.interviewDetails.date}</span>
                      </div>
                      <div>
                        <span className="font-medium text-green-700 dark:text-green-400">Time:</span>
                        <span className="ml-2 text-green-600 dark:text-green-300">{response.interviewDetails.time}</span>
                      </div>
                      <div>
                        <span className="font-medium text-green-700 dark:text-green-400">Type:</span>
                        <span className="ml-2 text-green-600 dark:text-green-300">{response.interviewDetails.type}</span>
                      </div>
                      <div>
                        <span className="font-medium text-green-700 dark:text-green-400">Location:</span>
                        <span className="ml-2 text-green-600 dark:text-green-300">{response.interviewDetails.location}</span>
                      </div>
                    </div>
                    {response.interviewDetails.meetingLink && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(response.interviewDetails?.meetingLink, '_blank')}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Join Meeting
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Next Steps */}
                {response.nextSteps && response.nextSteps.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Next Steps
                    </h4>
                    <ul className="space-y-2">
                      {response.nextSteps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Attachments */}
                {response.attachments && response.attachments.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Attachments
                    </h4>
                    <div className="space-y-2">
                      {response.attachments.map((attachment, attachmentIndex) => (
                        <div
                          key={attachmentIndex}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {attachment.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              ({attachment.type})
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(attachment.url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Responses */}
        {responses.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No responses yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              The company hasn't responded to your application yet. Check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserJobResponsesPage;
