import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, Cell
} from 'recharts';
import {
    TrendingUp, AlertTriangle, Search,
    Target, BarChart3, Info,
    Zap, Shield, MousePointer2
} from 'lucide-react';

interface SEOGrowthDashboardProps {
    data: any;
}

const SEOGrowthDashboard: React.FC<SEOGrowthDashboardProps> = ({ data }) => {
    if (!data) return null;

    const {
        overall_score = 0,
        niche = 'General',
        country = 'Global',
        on_page_seo = {},
        technical_seo = {},
        keyword_research = {},
        backlinks = {},
        keyword_gap = [],
        growth_estimates = {},
        recommendations = []
    } = data;

    const scoreColor = overall_score >= 80 ? 'text-emerald-500' : overall_score >= 50 ? 'text-amber-500' : 'text-rose-500';
    const scoreBg = overall_score >= 80 ? 'bg-emerald-500/10' : overall_score >= 50 ? 'bg-amber-500/10' : 'bg-rose-500/10';

    const categoryScores = [
        { name: 'On-Page', value: on_page_seo.score || 0, icon: <Search className="w-4 h-4" />, color: '#3B82F6' },
        { name: 'Technical', value: technical_seo.score || 0, icon: <Shield className="w-4 h-4" />, color: '#10B981' },
        { name: 'Keywords', value: keyword_research.score || 0, icon: <Target className="w-4 h-4" />, color: '#F59E0B' },
        { name: 'Backlinks', value: backlinks.quality_score || 0, icon: <Zap className="w-4 h-4" />, color: '#8B5CF6' },
        { name: 'UX', value: data.user_experience?.score || 0, icon: <MousePointer2 className="w-4 h-4" />, color: '#EC4899' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Overall SEO Health</p>
                            <h3 className={`text-4xl font-bold mt-1 ${scoreColor}`}>{overall_score}%</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${scoreBg}`}>
                            <BarChart3 className={`w-6 h-6 ${scoreColor}`} />
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${overall_score >= 80 ? 'bg-emerald-500' : overall_score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${overall_score}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                        <Info className="w-3 h-3" /> Average for {niche} in {country} is 68%
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Growth Potential</p>
                            <h3 className="text-4xl font-bold mt-1 text-emerald-500">+{growth_estimates.potential_6m_growth || '0%'}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10">
                            <TrendingUp className="w-6 h-6 text-emerald-500" />
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Estimated traffic increase in 6 months after fixing high-priority issues.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Critical Issues</p>
                            <h3 className="text-4xl font-bold mt-1 text-rose-500">
                                {recommendations.filter((r: any) => r.priority === 'critical' || r.priority === 'high').length}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-rose-500/10">
                            <AlertTriangle className="w-6 h-6 text-rose-500" />
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Fix these immediately to improve rankings and user experience.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Competitor Gap</p>
                            <h3 className="text-4xl font-bold mt-1 text-indigo-500">{keyword_gap.length}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-500/10">
                            <Target className="w-6 h-6 text-indigo-500" />
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">High-volume keywords used by competitors that you're missing.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Category Breakdown */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        SEO Category Performance
                    </h4>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryScores} layout="vertical" margin={{ left: 20, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                    {categoryScores.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-5 gap-2 mt-6">
                        {categoryScores.map((cat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-xs text-slate-400 mb-1">{cat.name}</div>
                                <div className="font-bold" style={{ color: cat.color }}>{cat.value}%</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Traffic Projection */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        Growth Forecast
                    </h4>
                    <p className="text-sm text-slate-500 mb-6">Traffic projection based on implemented SEO optimizations.</p>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growth_estimates.projection_data || []}>
                                <defs>
                                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" hide />
                                <YAxis hide />
                                <Tooltip />
                                <Area type="monotone" dataKey="traffic" stroke="#10B981" fillOpacity={1} fill="url(#colorTraffic)" strokeWidth={3} />
                                <Area type="monotone" dataKey="potential" stroke="#6366f1" fill="transparent" strokeDasharray="5 5" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Current Monthly Traffic</span>
                            <span className="font-bold">{growth_estimates.current_monthly_est || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Projected (6 Months)</span>
                            <span className="font-bold text-emerald-500">
                                {growth_estimates.projection_data?.[5]?.traffic || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Keyword Gap Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h4 className="text-lg font-bold flex items-center gap-2">
                            <Target className="w-5 h-5 text-indigo-500" />
                            Keyword Gap Analysis
                        </h4>
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg uppercase">Opportunities</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-semibold uppercase">
                                    <th className="px-6 py-4">Keyword</th>
                                    <th className="px-6 py-4">Volume</th>
                                    <th className="px-6 py-4">Difficulty</th>
                                    <th className="px-6 py-4">Source</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {keyword_gap.length > 0 ? keyword_gap.map((gap: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium">{gap.keyword}</td>
                                        <td className="px-6 py-4 text-slate-500">{gap.volume}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full">
                                                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${gap.difficulty}%` }} />
                                                </div>
                                                <span className="text-xs">{gap.difficulty}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                                                {gap.source}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No keyword gaps found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Action Priority List */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="text-lg font-bold flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            Priority Action Items
                        </h4>
                    </div>
                    <div className="p-6 space-y-4">
                        {recommendations.slice(0, 5).map((rec: any, i: number) => (
                            <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 group hover:border-blue-200 transition-all">
                                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${rec.priority === 'critical' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
                                        rec.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                                    }`} />
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm">{rec.message}</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${rec.priority === 'critical' ? 'bg-rose-100 text-rose-600' :
                                                rec.priority === 'high' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {rec.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 leading-relaxed">{rec.action}</p>
                                </div>
                            </div>
                        ))}
                        {recommendations.length > 5 && (
                            <button className="w-full py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl border border-dashed border-blue-200 dark:border-blue-800/50 transition-colors">
                                View all {recommendations.length} recommendations
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SEOGrowthDashboard;
