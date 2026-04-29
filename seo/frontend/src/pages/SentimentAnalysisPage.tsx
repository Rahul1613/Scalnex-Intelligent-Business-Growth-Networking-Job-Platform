import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MessageSquare, RefreshCw,
    Activity, ShieldAlert, Download, AlertTriangle, Zap,
    User, Heart, BarChart3, PieChart as PieIcon,
    Layers, Target, ExternalLink, ArrowRight
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';

/**
 * Simplified YouTube Sentiment Analysis
 * Focuses on functionality with a clean, standard interface.
 */
const SentimentAnalysisPage: React.FC = () => {
    const [url, setUrl] = useState('');
    const [commentsText, setCommentsText] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'All' | 'Positive' | 'Negative' | 'Neutral'>('All');

    const handleAnalyze = async () => {
        if (!url && !commentsText.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://127.0.0.1:5001/api/sentiment/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, commentsText })
            });
            const result = await response.json();
            if (result.success) {
                setData(result);
                setFilter('All');
            } else {
                setError(result.error || 'Analysis failed. Please try again.');
            }
        } catch (err: any) {
            console.error('Analysis failed:', err);
            setError('Could not connect to analysis server. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const downloadExcel = () => {
        if (!data?.analysis?.files?.excel) return;
        window.open(`http://127.0.0.1:5001/uploads/${data.analysis.files.excel}`, '_blank');
    };

    const filteredComments = data?.comments ? data.comments.filter((cmt: any) =>
        filter === 'All' ? true : cmt.Sentiment === filter
    ) : [];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-transparent text-gray-900 dark:text-white font-outfit relative transition-colors duration-500">
                <div className="relative p-0 max-w-7xl mx-auto space-y-10">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-black dark:text-white">
                                YouTube Sentiment AI
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                                Analyze video comments for audience sentiment.
                            </p>
                        </div>

                        {data && (
                            <button
                                onClick={downloadExcel}
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center gap-2 text-white font-bold transition-all shadow-lg shadow-emerald-500/20"
                            >
                                <Download className="w-5 h-5" />
                                <span>Export XLSX</span>
                            </button>
                        )}
                    </div>

                    {/* Search Field */}
                    <div className="max-w-3xl">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-1 relative w-full group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Enter YouTube URL..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full h-14 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-black dark:text-white"
                                />
                            </div>
                            <button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="w-full md:w-auto h-14 px-8 bg-black dark:bg-emerald-600 hover:opacity-90 disabled:opacity-50 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-xl"
                            >
                                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <span>Analyze</span>}
                            </button>
                        </div>
                        <div className="mt-4">
                            <textarea
                                value={commentsText}
                                onChange={(e) => setCommentsText(e.target.value)}
                                placeholder="Optional: paste comments here (one comment per line). This works even when YouTube blocks scraping."
                                className="w-full min-h-[120px] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-black dark:text-white"
                            />
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Tip: If the URL fails due to YouTube bot-check, leave URL empty and paste 20–200 comments here.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-3 font-bold">
                            <AlertTriangle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <AnimatePresence>
                        {data && (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-12 pb-24"
                            >
                                {/* Results Stats */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { title: 'Comments', val: data.analysis.stats.total, icon: MessageSquare, color: 'emerald' },
                                        { title: 'Positive', val: `${Math.round(data.analysis.sentiment_score)}%`, icon: Target, color: 'blue' },
                                        { title: 'Reputation', val: Math.round(data.analysis.reputation_score), icon: ShieldAlert, color: 'purple' },
                                        { title: 'System', val: 'VADER', icon: Activity, color: 'amber' },
                                    ].map((stat, i) => (
                                        <motion.div
                                            key={i}
                                            variants={itemVariants}
                                            className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-6 rounded-2xl shadow-sm"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className={`p-2 rounded-lg bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                                    <stat.icon className="w-5 h-5" />
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{stat.title}</span>
                                            </div>
                                            <p className="text-3xl font-black text-black dark:text-white">{stat.val}</p>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Visualizations */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {data.analysis.files.graphs.map((imgName: string, idx: number) => (
                                        <motion.div
                                            key={idx}
                                            variants={itemVariants}
                                            className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6 shadow-sm"
                                        >
                                            <h3 className="font-bold text-black dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                                                {imgName.includes('pie') ? <PieIcon className="w-4 h-4 text-emerald-600" /> : <BarChart3 className="w-4 h-4 text-emerald-600" />}
                                                {imgName.includes('pie') ? 'Sentiment Split' : 'Engagement Analysis'}
                                            </h3>
                                            <div className="aspect-video rounded-xl overflow-hidden bg-gray-50 dark:bg-black border border-gray-50 dark:border-white/5">
                                                <img
                                                    src={`http://127.0.0.1:5001/uploads/${imgName}`}
                                                    alt="Analysis Chart"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Comments List */}
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-black text-black dark:text-white">Audience Feedback</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredComments.slice(0, 10).map((cmt: any, idx: number) => (
                                            <motion.div
                                                key={idx}
                                                className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-6 rounded-2xl shadow-sm flex flex-col gap-4"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold">
                                                            {cmt.Author[0]}
                                                        </div>
                                                        <h4 className="font-bold text-black dark:text-white text-sm truncate max-w-[120px]">{cmt.Author}</h4>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cmt.Sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-600' :
                                                            cmt.Sentiment === 'Negative' ? 'bg-red-500/10 text-red-600' :
                                                                'bg-gray-500/10 text-gray-500'
                                                        }`}>
                                                        {cmt.Sentiment}
                                                    </div>
                                                </div>
                                                <p className="text-black dark:text-gray-300 text-sm leading-relaxed italic">
                                                    "{cmt.Comment}"
                                                </p>
                                                <div className="pt-4 border-t border-gray-50 dark:border-white/5 flex gap-4 text-gray-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Heart className="w-3.5 h-3.5 text-emerald-500" />
                                                        <span className="text-[10px] font-bold">{cmt.Likes}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                                                        <span className="text-[10px] font-bold">{cmt.ReplyCount}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Floating Filter Menu */}
                                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-sm">
                                    <div className="bg-black/90 dark:bg-emerald-950/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl flex items-center justify-between">
                                        {(['All', 'Positive', 'Negative', 'Neutral'] as const).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setFilter(type)}
                                                className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === type
                                                        ? 'bg-emerald-500 text-white shadow-lg'
                                                        : 'text-white/40 hover:text-white'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!data && !loading && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6">
                                <Zap className="w-10 h-10 text-emerald-500 opacity-40" />
                            </div>
                            <h2 className="text-2xl font-black text-black dark:text-white">Start Analysis</h2>
                            <p className="text-gray-500 max-w-xs font-medium italic mt-2">
                                Enter a YouTube URL above to retrieve sentiment data.
                            </p>
                        </div>
                    )}

                    {loading && (
                        <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-[100] p-8">
                            <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                            <p className="text-emerald-600 font-black uppercase tracking-widest text-sm animate-pulse">
                                Extracting Comments...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SentimentAnalysisPage;
