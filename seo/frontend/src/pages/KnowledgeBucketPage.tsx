import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, File, Trash2, Send, Loader2, BrainCircuit, Bot, User as UserIcon, CheckCircle2, AlertCircle, Zap, BookOpen, Copy } from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import toast from 'react-hot-toast';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5001';

interface UploadedFile {
  file_id: string;
  filename: string;
  path?: string;
  createdAt?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  confidence?: number;
  sources?: string[];
  follow_up_questions?: string[];
  answer_type?: string;
  metadata?: any;
}

const KnowledgeBucketPage: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [fetchingFiles, setFetchingFiles] = useState(true);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant', 
      content: 'Hello! 👋 I\'m your intelligent knowledge assistant. Ask me anything about your uploaded documents. I can provide short summaries or detailed explanations—just let me know your preference!'
    }
  ]);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [answerType, setAnswerType] = useState<'short' | 'long' | 'detailed'>('detailed');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const getToken = () => localStorage.getItem('auth_token');

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/knowledge/files`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await response.json();
      if (response.ok && data.files) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Error fetching knowledge files:', error);
    } finally {
      setFetchingFiles(false);
    }
  };

  useEffect(() => {
    if (getToken()) {
      fetchFiles();
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const token = getToken();
    if (!file || !token) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExt = new Set(['pdf', 'csv', 'xlsx', 'xls', 'txt']);
    if (!allowedExt.has(ext)) {
      toast.error('Unsupported file format. Please upload PDF, CSV, XLSX, XLS, or TXT.');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Reading and organizing your knowledge...');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/knowledge/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('File processed and added to knowledge bucket!', { id: toastId });
        await fetchFiles();
      } else {
        toast.error(data.error || 'Upload failed', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error during upload', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    const token = getToken();
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/knowledge/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success("File deleted from bucket");
        setFiles(files.filter(f => f.file_id !== fileId));
      } else {
        toast.error("Failed to delete file");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return { label: 'High Confidence', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' };
    if (confidence >= 0.6) return { label: 'Medium Confidence', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' };
    return { label: 'Low Confidence', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' };
  };

  const handleAskQuestion = async (e?: React.FormEvent, followUp?: string) => {
    e?.preventDefault();
    const token = getToken();
    const userQ = followUp || query.trim();
    if (!userQ || !token) return;
    
    setMessages(prev => [...prev, { role: 'user', content: userQ }]);
    if (!followUp) setQuery('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/api/knowledge/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          query: userQ,
          answer_type: answerType
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.answer,
          confidence: data.confidence,
          sources: data.sources,
          follow_up_questions: data.follow_up_questions,
          answer_type: data.answer_type,
          metadata: data.metadata
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.error || "Sorry, I encountered an error. Please try again later." 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "System error: Could not reach the backend." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.pdf')) return <FileText className="text-red-400 h-5 w-5" />;
    if (filename.endsWith('.csv') || filename.endsWith('.xlsx') || filename.endsWith('.xls')) return <File className="text-green-500 h-5 w-5" />;
    if (filename.endsWith('.txt')) return <FileText className="text-blue-400 h-5 w-5" />;
    return <FileText className="text-gray-400 h-5 w-5" />;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-6rem)] bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm mt-4 p-4 lg:p-6 space-y-6 overflow-y-auto">
        
        {/* Header with Answer Type Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="h-7 w-7 text-indigo-500" />
              AI Bot
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload private documents and get intelligent answers with confidence scoring & sources.</p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {/* Answer Type Selector */}
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['short', 'long', 'detailed'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setAnswerType(type)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all capitalize ${
                    answerType === type
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={`${type === 'short' ? 'Quick answers' : type === 'long' ? 'Detailed explanations' : 'Comprehensive responses'}`}
                >
                  {type === 'short' ? 'Quick' : type === 'long' ? 'Detailed' : 'Full'}
                </button>
              ))}
            </div>

            {/* Upload Button */}
            <div className="relative group">
              <input 
                type="file" 
                accept=".txt,.csv,.xlsx,.xls,.pdf" 
                className="hidden" 
                id="knowledge-upload" 
                onChange={handleFileUpload} 
                disabled={isUploading}
              />
              <label htmlFor="knowledge-upload" className={`flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors cursor-pointer ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}>
                {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                {isUploading ? 'Uploading...' : 'Add Knowledge'}
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[500px]">
           {/* Left/Main Panel: Chat */}
           <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-full">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-3">
                 <Bot className="h-5 w-5 text-indigo-500" />
                 <h2 className="font-semibold text-gray-800 dark:text-gray-200">Knowledge Assistant</h2>
              </div>
              
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'}`}>
                    {msg.role === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[80%] text-sm ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`p-3 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-tl-none leading-relaxed whitespace-pre-wrap'
                    }`}>
                      {msg.content}
                    </div>
                    
                    {/* Enhanced Response Metadata */}
                    {msg.role === 'assistant' && msg.confidence !== undefined && (
                      <div className="mt-2 space-y-2">
                        {/* Confidence Badge */}
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getConfidenceBadge(msg.confidence).color}`}>
                          <Zap className="h-3 w-3" />
                          {getConfidenceBadge(msg.confidence).label} ({Math.round(msg.confidence * 100)}%)
                        </div>

                        {/* Sources */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs space-y-1">
                            <p className="font-medium text-gray-600 dark:text-gray-300">📚 Sources:</p>
                            <div className="flex flex-wrap gap-1">
                              {msg.sources.map((source, i) => (
                                <span key={i} className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300 truncate max-w-[150px]" title={source}>
                                  {source}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Follow-up Questions */}
                        {msg.follow_up_questions && msg.follow_up_questions.length > 0 && (
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded text-xs space-y-2">
                            <p className="font-medium text-indigo-700 dark:text-indigo-300">💡 Follow-up Questions:</p>
                            <div className="space-y-1">
                              {msg.follow_up_questions.map((q, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleAskQuestion(undefined, q)}
                                  className="block w-full text-left px-2 py-1 rounded bg-white dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors truncate"
                                  title={q}
                                >
                                  {q}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleCopyMessage(msg.content)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="Copy response"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
                 {isTyping && (
                    <div className="flex items-center gap-3 text-gray-400">
                       <Bot className="h-5 w-5 text-indigo-400" />
                       <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl rounded-tl-none">
                         <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                       </div>
                    </div>
                 )}
                 <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                 <form onSubmit={handleAskQuestion} className="relative flex items-center gap-2">
                    <input 
                       type="text"
                       value={query}
                       onChange={e => setQuery(e.target.value)}
                       placeholder={`Ask a ${answerType} question about your data...`}
                       className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full pl-5 pr-12 py-3 focus:outline-none focus:border-indigo-500"
                    />
                    <button 
                       type="submit"
                       disabled={isTyping || !query.trim()}
                       aria-label="Send question"
                       title="Send question"
                       className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full disabled:opacity-50 transition-colors"
                    >
                       <Send className="h-4 w-4" />
                    </button>
                 </form>
              </div>
           </div>

           {/* Right Panel: Uploaded Files Tracker */}
           <div className="w-full lg:w-80 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                 <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Active Files
                 </h2>
                 <p className="text-xs text-gray-500 mt-1">Currently indexed ({files.length})</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                 {fetchingFiles ? (
                    <div className="flex justify-center py-6 text-gray-400">
                       <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                 ) : files.length === 0 ? (
                    <div className="text-center py-10 px-4 flex flex-col items-center">
                       <AlertCircle className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                       <p className="text-sm text-gray-500 dark:text-gray-400">Your bucket is empty. Upload PDFs, CSVs, or text files to begin.</p>
                    </div>
                 ) : (
                    <div className="space-y-3">
                       {files.map((file) => (
                          <div key={file.file_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 rounded-lg group hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
                             <div className="flex items-center gap-3 truncate pr-2">
                               {getFileIcon(file.filename)}
                               <div className="truncate">
                                 <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate" title={file.filename}>
                                    {file.filename}
                                 </p>
                                 <p className="text-xs text-green-500 flex items-center gap-1 mt-0.5">
                                    <CheckCircle2 className="h-3 w-3" /> Indexed
                                 </p>
                               </div>
                             </div>
                             <button
                                onClick={() => handleDeleteFile(file.file_id)}
                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                title="Remove from bucket"
                             >
                                <Trash2 className="h-4 w-4" />
                             </button>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default KnowledgeBucketPage;
