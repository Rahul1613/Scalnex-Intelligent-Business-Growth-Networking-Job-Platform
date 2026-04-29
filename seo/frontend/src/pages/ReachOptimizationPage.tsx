import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cpu, Target, DollarSign, Users, MessageSquare, Hash,
    BarChart2, TrendingUp, AlertCircle, CheckCircle, Smartphone
} from 'lucide-react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar
} from 'recharts';
import DashboardLayout from '../components/Layout/DashboardLayout';

const ML_API_URL = import.meta.env.VITE_ML_API_URL ?? 'http://127.0.0.1:8000';

interface PredictionResult {
    estimated_reach: number;
    estimated_impressions: number;
    engagement_rate: number;
    ctr: number;
    confidence_score: number;
    reach_trend_graph: any[];
    budget_reach_graph: any[];
    platform_comparison_graph: any[];
    insights: string[];
    optimization_suggestions: { category: string; suggestion: string; impact: string }[];
}

const ReachOptimizationPage = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [formData, setFormData] = useState({
        platform: 'Instagram',
        budget: 500,
        industry: 'Tech',
        audience_size: 'Medium',
        ad_type: 'Image',
        caption: '',
        hashtags: ''
    });

    const handlePredict = async () => {
        if (!formData.caption) {
            alert("Please enter a caption to analyze.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${ML_API_URL}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Prediction failed');

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            alert("Failed to connect to ML Service. Make sure uvicorn is running on port 8000.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <Cpu className="w-8 h-8 text-indigo-500" />
                            AI Reach Optimization Engine
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">Predict reach & optimize ad performance with XGBoost & NLP.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Input Panel */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-500" /> Campaign Parameters
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Platform</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Instagram', 'Facebook', 'LinkedIn', 'Google', 'Twitter', 'YouTube'].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setFormData({ ...formData, platform: p })}
                                                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${formData.platform === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" /> Budget ($)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.budget}
                                            onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                            <Users className="w-3 h-3" /> Audience
                                        </label>
                                        <select
                                            value={formData.audience_size}
                                            onChange={(e) => setFormData({ ...formData, audience_size: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option>Small</option>
                                            <option>Medium</option>
                                            <option>Large</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Industry</label>
                                    <select
                                        value={formData.industry}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {['Tech', 'Fashion', 'Real Estate', 'Healthcare', 'Finance', 'Education'].map(i => (
                                            <option key={i}>{i}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3" /> Caption (for TF-IDF Analysis)
                                    </label>
                                    <textarea
                                        value={formData.caption}
                                        onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                                        placeholder="Enter your ad copy here..."
                                        rows={4}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                        <Hash className="w-3 h-3" /> Hashtags
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.hashtags}
                                        onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                                        placeholder="#growth #marketing"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <button
                                    onClick={handlePredict}
                                    disabled={loading}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <span className="animate-pulse">Optimizing...</span>
                                    ) : (
                                        <>
                                            <Cpu className="w-5 h-5" /> Predict Reach
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="lg:col-span-8 space-y-6">
                        {!result ? (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
                                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                                    <BarChart2 className="w-10 h-10 text-indigo-500" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Ready to Optimize</h3>
                                <p className="text-gray-500 max-w-md">Enter your campaign details to get AI-powered predictions on reach, engagement, and budget efficiency.</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Key Metrics */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                                            <div className="text-indigo-500 mb-2"><Users className="w-6 h-6" /></div>
                                            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Est. Reach</div>
                                            <div className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mt-1">
                                                {result.estimated_reach.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                                            <div className="text-purple-500 mb-2"><Smartphone className="w-6 h-6" /></div>
                                            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Impressions</div>
                                            <div className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mt-1">
                                                {result.estimated_impressions.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                                            <div className="text-green-500 mb-2"><TrendingUp className="w-6 h-6" /></div>
                                            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Engagement Output</div>
                                            <div className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mt-1">
                                                {result.engagement_rate}%
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                                            <div className="text-orange-500 mb-2"><Target className="w-6 h-6" /></div>
                                            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Est. CTR</div>
                                            <div className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mt-1">
                                                {result.ctr}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Graphs */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Reach Trend (7 Days)</h3>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={result.reach_trend_graph}>
                                                        <defs>
                                                            <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }}
                                                            itemStyle={{ color: '#fff' }}
                                                        />
                                                        <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorReach)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Budget Impact Analysis</h3>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={result.budget_reach_graph}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                                        <Tooltip
                                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }}
                                                        />
                                                        <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Insights & Suggestions */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl">
                                            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5" /> AI Insights
                                            </h3>
                                            <ul className="space-y-3">
                                                {result.insights.map((insight, idx) => (
                                                    <li key={idx} className="flex gap-3 text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed bg-white/50 dark:bg-indigo-900/50 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/30">
                                                        <span className="font-bold text-indigo-500">{idx + 1}.</span>
                                                        {insight}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-3xl">
                                            <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100 mb-4 flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5" /> Optimization Suggestions
                                            </h3>
                                            <div className="space-y-3">
                                                {result.optimization_suggestions.length > 0 ? result.optimization_suggestions.map((sug, idx) => (
                                                    <div key={idx} className="bg-white/50 dark:bg-orange-900/50 p-3 rounded-xl border border-orange-100 dark:border-orange-500/30">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs font-bold uppercase text-orange-600 dark:text-orange-300 tracking-wider">{sug.category}</span>
                                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${sug.impact === 'High' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>{sug.impact} Impact</span>
                                                        </div>
                                                        <p className="text-sm text-orange-900 dark:text-orange-100">{sug.suggestion}</p>
                                                    </div>
                                                )) : (
                                                    <p className="text-sm text-orange-800 dark:text-orange-200 italic">No critical improvements found. Your ad setup looks solid!</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReachOptimizationPage;
