
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, CheckCircle, XCircle, Clock, Calendar, Building2, Eye, Download, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Common/Button';

interface Application {
    id: string;
    jobId: string;
    jobTitle: string;
    jobCompany: string;
    status: 'submitted' | 'accepted' | 'rejected' | 'interview';
    createdAt: string;
    applicant: {
        fullName: string;
        email: string;
        // ... other fields
    };
    messages?: {
        id: string;
        from: 'company' | 'applicant';
        type: 'message' | 'offer' | 'internship' | 'system';
        text: string;
        createdAt: string;
        attachmentName?: string;
        attachmentBase64?: string;
    }[];
}

const ApplicationsPage: React.FC = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState<Application[]>([]);
    const [filter, setFilter] = useState<'all' | 'submitted' | 'accepted' | 'rejected'>('all');
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);

    useEffect(() => {
        // Load applications from localStorage
        const storedApps = localStorage.getItem('applications');
        if (storedApps) {
            try {
                setApplications(JSON.parse(storedApps));
            } catch (e) {
                console.error("Failed to parse applications", e);
            }
        }
    }, [filter]); // Re-read when filter changes to ensure fresh data if modified elsewhere

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
            case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
            case 'submitted': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted': return <CheckCircle size={16} className="mr-1" />;
            case 'rejected': return <XCircle size={16} className="mr-1" />;
            case 'submitted': return <Clock size={16} className="mr-1" />;
            default: return <Clock size={16} className="mr-1" />;
        }
    };

    const viewAttachment = (base64: string) => {
        const win = window.open();
        if (win) {
            win.document.write(`<iframe src="${base64}" style="width:100%;height:100%" frameborder="0"></iframe>`);
        }
    };

    const filteredApplications = applications.filter(app => {
        if (filter === 'all') return true;
        return app.status === filter;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Applications</h1>
                        <p className="text-gray-600 dark:text-gray-400">Track the status of your job applications</p>
                    </div>
                    <Button onClick={() => navigate('/marketplace')} variant="outline">
                        Browse More Jobs
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {(['all', 'submitted', 'accepted', 'rejected'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${filter === f
                                ? 'bg-purple-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Applications List */}
                {filteredApplications.length > 0 ? (
                    <div className="space-y-4">
                        {filteredApplications.map((app, index) => (
                            <motion.div
                                key={app.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">
                                        <Briefcase size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{app.jobTitle}</h3>
                                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mt-1 gap-4">
                                            <span className="flex items-center gap-1"><Building2 size={14} /> {app.jobCompany}</span>
                                            <span className="flex items-center gap-1"><Calendar size={14} /> Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(app.status)}`}>
                                        {getStatusIcon(app.status)}
                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                    </span>
                                    <Button size="sm" variant="outline" onClick={() => setSelectedApp(app)}>
                                        <Eye size={16} className="mr-2" /> View Details
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 dashed">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No applications found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {filter !== 'all' ? `No applications with status "${filter}"` : "You haven't applied to any jobs yet."}
                        </p>
                        <Button onClick={() => navigate('/marketplace')}>
                            Find Jobs to Apply
                        </Button>
                    </div>
                )}
            </div>

            {/* Application Detail Modal */}
            <AnimatePresence>
                {selectedApp && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedApp.jobTitle}</h2>
                                    <p className="text-purple-600 font-medium">{selectedApp.jobCompany}</p>
                                </div>
                                <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                    <XCircle size={24} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <MessageSquare size={20} /> Communication History
                                </h3>

                                <div className="space-y-4">
                                    {selectedApp.messages && selectedApp.messages.length > 0 ? (
                                        selectedApp.messages.map(msg => (
                                            <div key={msg.id} className={`p-4 rounded-xl ${msg.from === 'company'
                                                    ? 'bg-purple-50 dark:bg-purple-900/20 ml-8 border border-purple-100 dark:border-purple-800'
                                                    : 'bg-gray-50 dark:bg-gray-700 mr-8'
                                                }`}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className={`font-bold text-sm ${msg.from === 'company' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {msg.from === 'company' ? selectedApp.jobCompany : 'You'}
                                                        <span className="font-normal opacity-70 ml-2 text-xs uppercase bg-white dark:bg-black/20 px-1.5 py-0.5 rounded">{msg.type}</span>
                                                    </span>
                                                    <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
                                                </div>
                                                <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{msg.text}</div>

                                                {msg.attachmentName && msg.attachmentBase64 && (
                                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600/50">
                                                        <button
                                                            onClick={() => viewAttachment(msg.attachmentBase64!)}
                                                            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg transition-colors w-full"
                                                        >
                                                            <Download size={16} /> Download {msg.attachmentName}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                            No messages or updates yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end">
                                <Button onClick={() => setSelectedApp(null)}>Close</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ApplicationsPage;
