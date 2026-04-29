import React, { useState, useEffect } from 'react';
import {
    Sparkles,
    Download, CheckCircle2,
    Eye, Edit3, FileText,
    RefreshCw, Bold,
    Italic, List, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIContentStudioProps {
    initialContent?: string;
    topic: string;
    data?: any;
}

const AIContentStudio: React.FC<AIContentStudioProps> = ({ initialContent = '', topic, data }) => {
    const [content, setContent] = useState(initialContent);
    const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit');
    const [isImproving, setIsImproving] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (data?.content) setContent(data.content);
    }, [data]);

    const handleImprove = async (type: string) => {
        setIsImproving(true);
        try {
            const API_BASE = (import.meta as any)?.env?.VITE_API_URL || 'http://127.0.0.1:5001';
            const res = await fetch(`${API_BASE}/api/content/improve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: content, topic, type })
            });
            const result = await res.json();
            setContent(result.improved);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (e) {
            console.error("Improvement failed", e);
        } finally {
            setIsImproving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 h-[750px]">
            {/* EDITOR SECTION */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden relative">
                {/* Editor Toolbar */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-xl">
                            <button
                                onClick={() => setActiveView('edit')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeView === 'edit' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
                            >
                                <div className="flex items-center gap-2"><Edit3 className="w-4 h-4" /> Edit</div>
                            </button>
                            <button
                                onClick={() => setActiveView('preview')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeView === 'preview' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
                            >
                                <div className="flex items-center gap-2"><Eye className="w-4 h-4" /> Preview</div>
                            </button>
                        </div>
                        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
                        <div className="flex items-center gap-1">
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"><Bold className="w-4 h-4" /></button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"><Italic className="w-4 h-4" /></button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"><List className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleImprove('general')}
                            disabled={isImproving}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition-colors text-sm font-bold border border-blue-100 dark:border-blue-800"
                        >
                            {isImproving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            AI Boost
                        </button>
                        <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-500 hover:text-gray-900"><Download className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {activeView === 'edit' ? (
                            <motion.div
                                key="editor"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full"
                            >
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-full p-8 bg-transparent resize-none outline-none text-gray-800 dark:text-gray-200 font-serif text-lg leading-relaxed placeholder:text-gray-300"
                                    placeholder="Start writing or let AI generate content for you..."
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="h-full p-8 overflow-y-auto bg-gray-50 dark:bg-gray-900/30"
                            >
                                <div className="max-w-3xl mx-auto prose dark:prose-invert">
                                    {content.split('\n').map((line: string, i: number) => (
                                        <p key={i} className={line.startsWith('#') ? 'font-bold text-3xl' : ''}>
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Status Bar */}
                <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center text-xs text-gray-500 font-medium">
                    <div className="flex gap-4">
                        <span>Words: {content.trim().split(/\s+/).filter(Boolean).length}</span>
                        <span>Characters: {content.length}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-500">
                        <CheckCircle2 className="w-3 h-3" /> Auto-saved
                    </div>
                </div>

                {/* AI Toast */}
                <AnimatePresence>
                    {showToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="absolute bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 z-50 border border-white/10"
                        >
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                            Content optimized by AI
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="w-full lg:w-80 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to Publish?</h3>
                    <p className="text-sm text-gray-500 mb-6">Your content is ready for the world. Download or copy to use on your platform.</p>
                    <button className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl">
                        Publish Content <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIContentStudio;
