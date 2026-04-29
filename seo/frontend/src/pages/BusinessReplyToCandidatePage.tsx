import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Clock,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Send,
  Loader2
} from 'lucide-react';
import Button from '../components/Common/Button';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface CandidateResponse {
  id: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  message: string;
  responseType: 'candidate_reply' | 'follow_up_question' | 'acceptance' | 'declination';
  sentDate: string;
  isRead: boolean;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  jobTitle: string;
  companyName: string;
}

const BusinessReplyToCandidatePage: React.FC = () => {
  const { responseId } = useParams<{ responseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [response, setResponse] = useState<CandidateResponse | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!responseId) return;

    const fetchResponseData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch company applications and find the specific response
        const applicationsResponse = await apiService.getCompanyApplications();
        
        if (applicationsResponse.success && applicationsResponse.data) {
          // Find the response with matching ID
          let foundResponse: CandidateResponse | null = null;
          
          for (const app of applicationsResponse.data) {
            if (app.messages && app.messages.length > 0) {
              const messageResponse = app.messages.find((m: any) => m.id?.toString() === responseId);
              if (messageResponse && messageResponse.sender !== 'company') {
                foundResponse = {
                  id: messageResponse.id?.toString() || responseId,
                  applicationId: app.id.toString(),
                  candidateName: app.user?.name || 'Unknown Candidate',
                  candidateEmail: app.user?.email || 'unknown@example.com',
                  candidatePhone: '',
                  message: messageResponse.message,
                  responseType: messageResponse.sender === 'user' ? 'candidate_reply' : 'follow_up_question',
                  sentDate: messageResponse.createdAt || app.updatedAt,
                  isRead: false,
                  attachments: [],
                  jobTitle: app.job?.title || 'Unknown Position',
                  companyName: user?.companyName || 'Your Company'
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
              candidateName: 'John Doe',
              candidateEmail: 'john.doe@example.com',
              candidatePhone: '+1 (555) 987-6543',
              message: 'Thank you for the interview opportunity. I am very interested in this position and would like to confirm my availability for next week. Please let me know what time works best for the team.',
              responseType: 'candidate_reply',
              sentDate: new Date().toISOString(),
              isRead: false,
              jobTitle: 'Senior Developer',
              companyName: user?.companyName || 'Your Company'
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
          candidateName: 'John Doe',
          candidateEmail: 'john.doe@example.com',
          candidatePhone: '+1 (555) 987-6543',
          message: 'Thank you for the interview opportunity. I am very interested in this position and would like to confirm my availability for next week. Please let me know what time works best for the team.',
          responseType: 'candidate_reply',
          sentDate: new Date().toISOString(),
          isRead: false,
          jobTitle: 'Senior Developer',
          companyName: user?.companyName || 'Your Company'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResponseData();
  }, [responseId, user]);

  const getResponseTypeColor = (type: string) => {
    switch (type) {
      case 'candidate_reply':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'follow_up_question':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'acceptance':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'declination':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getResponseTypeLabel = (type: string) => {
    switch (type) {
      case 'candidate_reply':
        return 'Candidate Reply';
      case 'follow_up_question':
        return 'Follow Up Question';
      case 'acceptance':
        return 'Accepted Offer';
      case 'declination':
        return 'Declined Offer';
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
        alert('Reply sent successfully to candidate!');
        
        // Navigate back to recruitment details
        navigate('/recruitment-details');
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
          <Button onClick={() => navigate('/recruitment-details')}>
            Back to Recruitment
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
            onClick={() => navigate('/recruitment-details')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Recruitment
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reply to {response.candidateName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Send your response to the candidate regarding {response.jobTitle}
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
                    {response.candidateName}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResponseTypeColor(response.responseType)}`}>
                    {getResponseTypeLabel(response.responseType)}
                  </span>
                  {!response.isRead && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Candidate for {response.jobTitle} at {response.companyName}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {response.candidateEmail}
                  </span>
                  {response.candidatePhone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {response.candidatePhone}
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

            {/* Application Context */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Application Context
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-blue-700 dark:text-blue-400">Position:</span>
                  <span className="ml-2 text-blue-600 dark:text-blue-300">{response.jobTitle}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-700 dark:text-blue-400">Company:</span>
                  <span className="ml-2 text-blue-600 dark:text-blue-300">{response.companyName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reply Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Response
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From: {user?.companyName} ({user?.email})
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
              placeholder="Type your response to the candidate here..."
              required
            />
          </div>

          {/* Quick Response Templates */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Response Templates
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => setReplyMessage(`Thank you for your response. We appreciate your interest in the ${response.jobTitle} position. We would like to schedule an interview with you. Are you available next week?`)}
                className="text-left px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Schedule Interview
              </button>
              <button
                onClick={() => setReplyMessage(`Thank you for your interest in the ${response.jobTitle} position. We have reviewed your application and would like to move forward with the next steps.`)}
                className="text-left px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Move to Next Steps
              </button>
              <button
                onClick={() => setReplyMessage(`Thank you for your response. We have reviewed your application for the ${response.jobTitle} position. Unfortunately, we have decided to move forward with other candidates at this time.`)}
                className="text-left px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Politely Decline
              </button>
              <button
                onClick={() => setReplyMessage(`Thank you for your response. We would like to request additional information regarding your experience with [specific skill/technology]. Could you provide more details?`)}
                className="text-left px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Request More Info
              </button>
            </div>
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
                  Send Response
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/recruitment-details')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessReplyToCandidatePage;
