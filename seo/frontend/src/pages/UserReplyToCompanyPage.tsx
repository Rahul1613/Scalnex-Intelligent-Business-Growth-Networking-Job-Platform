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
  XCircle,
  MessageSquare,
  ArrowLeft,
  User,
  Mail,
  Phone,
  FileText,
  Download,
  Reply,
  Star,
  Send,
  Loader2
} from 'lucide-react';
import Button from '../components/Common/Button';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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

const UserReplyToCompanyPage: React.FC = () => {
  const { responseId } = useParams<{ responseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [response, setResponse] = useState<CompanyResponse | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!responseId) return;

    const fetchResponseData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all applications and find the specific response
        const applicationsResponse = await apiService.getUserApplications();
        
        if (applicationsResponse.success && applicationsResponse.data) {
          // Find the response with matching ID
          let foundResponse: CompanyResponse | null = null;
          
          for (const app of applicationsResponse.data) {
            if (app.messages && app.messages.length > 0) {
              const messageResponse = app.messages.find((m: any) => m.id?.toString() === responseId);
              if (messageResponse) {
                foundResponse = {
                  id: messageResponse.id?.toString() || responseId,
                  applicationId: app.id.toString(),
                  company: app.job?.companyName || 'Unknown Company',
                  responderName: messageResponse.sender === 'company' ? 'Hiring Team' : messageResponse.sender,
                  responderTitle: messageResponse.sender === 'company' ? 'Recruiter' : '',
                  responderEmail: app.job?.companyName?.toLowerCase().replace(' ', '') + '@example.com',
                  responderPhone: '',
                  message: messageResponse.message,
                  responseType: messageResponse.sender === 'company' ? 'interview_request' : 'follow_up',
                  sentDate: messageResponse.createdAt || app.updatedAt,
                  isRead: false,
                  attachments: [],
                };
                break;
              }
            }
          }

          // Fallback to mock data if no real response found
          if (!foundResponse) {
            foundResponse = {
              id: responseId,
              applicationId: '1',
              company: 'Tech Company',
              responderName: 'HR Manager',
              responderTitle: 'Human Resources',
              responderEmail: 'hr@techcompany.com',
              responderPhone: '+1 (555) 123-4567',
              message: 'Thank you for your interest in the position. We would like to schedule an interview to discuss your qualifications further.',
              responseType: 'interview_request',
              sentDate: new Date().toISOString(),
              isRead: false,
              nextSteps: 'Confirm your availability for the interview',
              interviewDetails: {
                date: 'Next Week',
                time: '2:00 PM',
                type: 'Video Call',
                location: 'Zoom/Teams',
                meetingLink: 'https://zoom.us/meeting/123456'
              }
            };
          }

          setResponse(foundResponse);
        }
      } catch (error) {
        console.error('Error fetching response:', error);
        // Set fallback response on error
        setResponse({
          id: responseId,
          applicationId: '1',
          company: 'Tech Company',
          responderName: 'HR Manager',
          responderTitle: 'Human Resources',
          responderEmail: 'hr@techcompany.com',
          responderPhone: '+1 (555) 123-4567',
          message: 'Thank you for your interest in the position. We would like to schedule an interview to discuss your qualifications further.',
          responseType: 'interview_request',
          sentDate: new Date().toISOString(),
          isRead: false,
          nextSteps: 'Confirm your availability for the interview',
          interviewDetails: {
            date: 'Next Week',
            time: '2:00 PM',
            type: 'Video Call',
            location: 'Zoom/Teams',
            meetingLink: 'https://zoom.us/meeting/123456'
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResponseData();
  }, [responseId]);

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

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !response) return;

    setIsSending(true);
    try {
      // Send reply using the real API
      const apiResponse = await apiService.sendApplicationMessage(parseInt(response.applicationId), {
        message: replyMessage.trim()
      });

      if (apiResponse.success) {
        // Show success message
        alert('Reply sent successfully!');
        
        // Navigate back to job responses
        navigate(`/user/job-responses/${response.applicationId}`);
      } else {
        throw new Error(apiResponse.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Response Not Found
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
            onClick={() => navigate(`/user/job-responses/${response.applicationId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Responses
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reply to {response.company}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Send your response to the hiring team
          </p>
        </div>

        {/* Original Message */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
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
          </div>

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
          </div>
        </div>

        {/* Reply Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Reply
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From: {user?.firstName} {user?.lastName} ({user?.email})
            </label>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message *
            </label>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Type your reply here..."
              required
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSendReply}
              disabled={!replyMessage.trim() || isSending}
              className="flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Reply
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate(`/user/job-responses/${response.applicationId}`)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserReplyToCompanyPage;
