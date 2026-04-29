import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Button } from '../components/Common';
import { Zap, Copy, RefreshCw, MessageCircle } from 'lucide-react';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5001';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
  confidence?: number;
  sources?: string[];
  follow_up_questions?: string[];
}

const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "👋 Welcome! I'm your AI Assistant powered by Scalnex platform knowledge. Ask me anything about our features, pricing, or how to get started!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);



  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);


  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      content: '',
      isUser: false,
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch(`${API_URL}/api/platform_bot/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputMessage,
          answer_type: 'short'  // Short, accurate answers
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Remove typing indicator and add AI response with metadata
        setMessages(prev => {
          const withoutTyping = prev.filter(msg => msg.id !== 'typing');
          return [...withoutTyping, {
            id: Date.now().toString(),
            content: data.answer || 'Unable to generate a response. Please try again.',
            isUser: false,
            timestamp: new Date(),
            confidence: data.confidence,
            sources: data.sources,
            follow_up_questions: data.follow_up_questions
          }];
        });
      } else {
        setMessages(prev => {
          const withoutTyping = prev.filter(msg => msg.id !== 'typing');
          return [...withoutTyping, {
            id: Date.now().toString(),
            content: `Error: ${data.error || 'Could not reach the server. Please try again.'}`,
            isUser: false,
            timestamp: new Date()
          }];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing');
        return [...withoutTyping, {
          id: Date.now().toString(),
          content: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure the backend is running on ${API_URL}`,
          isUser: false,
          timestamp: new Date()
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('Copied to clipboard!');
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return { label: 'High Confidence', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' };
    if (confidence >= 0.6) return { label: 'Medium Confidence', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' };
    return { label: 'Low Confidence', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      content: "👋 Welcome! I'm your AI Assistant powered by Scalnex platform knowledge. Ask me anything about our features, pricing, or how to get started!",
      isUser: false,
      timestamp: new Date()
    }]);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">AI Assistant</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Powered by Scalnex Platform Knowledge</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Online</span>
            </div>
            <Button
              onClick={clearChat}
              variant="outline"
              size="sm"
            >
              Clear Chat
            </Button>
          </div>
        </div>



        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${message.isUser ? '' : ''}`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
                >
                  {message.isTyping ? (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200"></div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                  )}
                  <div className={`text-xs mt-2 ${message.isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {/* Enhanced Response Metadata */}
                {!message.isUser && !message.isTyping && message.confidence !== undefined && (
                  <div className="mt-2 space-y-2">
                    {/* Confidence Badge */}
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getConfidenceBadge(message.confidence).color}`}>
                      <Zap className="h-3 w-3" />
                      {getConfidenceBadge(message.confidence).label} ({Math.round(message.confidence * 100)}%)
                    </div>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded text-xs space-y-1">
                        <p className="font-medium text-gray-700 dark:text-gray-300">📚 Sources:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.sources.map((source, i) => (
                            <span key={i} className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-gray-700 dark:text-gray-300 truncate max-w-[150px]" title={source}>
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Questions */}
                    {message.follow_up_questions && message.follow_up_questions.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs space-y-2">
                        <p className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> Follow-up Questions:
                        </p>
                        <div className="space-y-1">
                          {message.follow_up_questions.map((q, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setInputMessage(q);
                                textareaRef.current?.focus();
                              }}
                              className="block w-full text-left px-2 py-1 rounded bg-white dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors truncate text-xs"
                              title={q}
                            >
                              → {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyMessage(message.content)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Copy response"
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about Scalnex features, SEO tools, pricing, etc... (Shift+Enter for new line)"
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                rows={1}
                maxLength={2000}
                disabled={isLoading}
              />
              <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                {inputMessage.length}/2000
              </div>
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 rounded-2xl"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
};

export default AIAssistantPage;


