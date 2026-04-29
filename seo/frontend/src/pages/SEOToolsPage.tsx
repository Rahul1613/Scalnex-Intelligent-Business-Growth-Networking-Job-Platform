import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, RadialBarChart, RadialBar, Tooltip } from 'recharts';
import { Search, Zap, Shield, FileText, Lightbulb, ExternalLink, Globe, BarChart, Link as LinkIcon, Download, Key, Gauge, Target, Users, Code2, Plus, X, TrendingUp, Box } from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import SEOGrowthDashboard from '../components/SEO/SEOGrowthDashboard';
import SEO3DVisualizer from '../components/SEO/SEO3DVisualizer';

interface AdvancedSEOReport {
    overall_score: number;
    url: string;
    domain: string;
    timestamp: number;
    on_page_seo: {
        score: number;
        title?: { text: string; length: number; optimal: boolean };
        meta_description?: { text: string; length: number; optimal: boolean };
        headings: { [key: string]: number };
        images: { total: number; missing_alt: number };
        internal_links: number;
        external_links: number;
    };
    technical_seo: {
        score: number;
        core_web_vitals: any;
        mobile_optimization: any;
        crawlability: any;
        indexability: any;
        site_structure: any;
        structured_data: any;
        issues: any[];
        passed: string[];
    };
    keyword_research: {
        score: number;
        extracted_keywords: { [key: string]: number };
        top_keywords: Array<{
            keyword: string;
            difficulty: number;
            estimated_volume: number;
            competition: string;
        }>;
        keyword_density: any;
    };
    backlinks: {
        total_backlinks: number;
        referring_domains: number;
        domain_authority: number;
        spam_score: number;
        quality_score: number;
        backlink_types: any;
        anchor_texts: any[];
        top_referring_domains: any[];
        recommendations: Array<{ priority: string; message: string; action: string }>;
    };
    internal_links: {
        total_internal_links: number;
        total_external_links: number;
        unique_internal_links: number;
        anchor_text_diversity: any;
        link_distribution: any;
        navigation_links: any;
        orphan_page_risk: any;
        score: number;
    };
    content_quality: {
        user_intent: any;
        content_quality: any;
        readability: any;
        structure: any;
        topic_coverage: any;
        score: number;
    };
    user_experience: {
        mobile_ux: any;
        layout_stability: any;
        engagement_potential: any;
        navigation: any;
        accessibility: any;
        score: number;
    };
    structured_data: {
        json_ld_count: number;
        schema_types: string[];
        open_graph_tags: number;
        twitter_card_tags: number;
        has_breadcrumbs: boolean;
        has_faq_schema: boolean;
        score: number;
    };
    performance: {
        score: number;
        load_time_ms: number;
        page_size_kb: number;
        compression: boolean;
    };
    security: {
        score: number;
        https: boolean;
        hsts: boolean;
    };
    recommendations: Array<{ priority: string; message: string; action: string }>;
    pdf_url?: string;
    error?: string;
}

const SeoToolsPage: React.FC = () => {
    const [url, setUrl] = useState('');
    const [competitors, setCompetitors] = useState<string[]>(['']);
    const [analyzing, setAnalyzing] = useState(false);
    const [report, setReport] = useState<AdvancedSEOReport | null>(null);
    const [competitorReports, setCompetitorReports] = useState<AdvancedSEOReport[]>([]);
    const [activeTab, setActiveTab] = useState<string>('growth');

    const handleAnalyze = async () => {
        if (!url) return;
        setAnalyzing(true);
        setReport(null);
        setCompetitorReports([]);

        try {
            // Prepare all URLs to analyze: Main URL + Competitors
            const validCompetitors = competitors.filter(c => c.trim() !== '');
            const urlsToAnalyze = [url, ...validCompetitors];

            // Create promise for each URL
            const analysisPromises = urlsToAnalyze.map(targetUrl =>
                fetch('http://127.0.0.1:5001/api/seo/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url: targetUrl,
                        target_url: targetUrl, // Ensure backend uses this
                        advanced: true
                    })
                }).then(res => res.json())
            );

            // Wait for all analyses to complete
            const results = await Promise.all(analysisPromises);

            // First result is main report
            const mainReport = results[0];

            if (mainReport.error) {
                alert(mainReport.error);
            } else {
                setReport(mainReport);

                // Rest are competitor reports
                if (results.length > 1) {
                    const comps = results.slice(1).filter(r => !r.error);
                    setCompetitorReports(comps);
                    // If we have competitors, maybe start on a comparison tab?
                    if (comps.length > 0) {
                        setActiveTab('comparison');
                    } else {
                        setActiveTab('overview');
                    }
                } else {
                    setActiveTab('overview');
                }
            }
        } catch (e) {
            alert("Failed to connect to analysis server. Make sure Python backend is running.");
        } finally {
            setAnalyzing(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((prev, curr) => prev ? prev[curr] : null, obj);
    };

    const tabs = [
        { id: 'comparison', label: 'Comparison', icon: Users },
        { id: '3d-visualizer', label: '3D Visualizer', icon: Box },
        { id: 'growth', label: 'Growth Engine', icon: TrendingUp },
        { id: 'overview', label: 'Overview', icon: BarChart },
        { id: 'onpage', label: 'On-Page SEO', icon: FileText },
        { id: 'technical', label: 'Technical SEO', icon: Zap },
        { id: 'content', label: 'Content Quality', icon: Target },
        { id: 'keywords', label: 'Keywords', icon: Key },
        { id: 'backlinks', label: 'Backlinks', icon: LinkIcon },
        { id: 'internal', label: 'Internal Links', icon: LinkIcon },
        { id: 'ux', label: 'User Experience', icon: Users },
        { id: 'structured', label: 'Structured Data', icon: Code2 },
        { id: 'performance', label: 'Performance', icon: Gauge },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header Section */}
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start">
                        <Search className="w-8 h-8 mr-3 text-blue-600" />
                        Advanced SEO Auditor
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto md:mx-0">
                        Comprehensive SEO analysis with content quality, user intent, backlinks, internal links, UX signals, and structured data.
                    </p>
                </div>

                {/* Advanced SEO Tool Form */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 mb-10 max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* URL and Basics */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-blue-500" /> Target Website URL
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://example.com"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                            </div>


                        </div>

                        {/* Competitors */}
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-indigo-500" /> Competitors (Optional)
                                </span>
                                <button
                                    onClick={() => setCompetitors([...competitors, ''])}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> Add More
                                </button>
                            </label>
                            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                {competitors.map((comp, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="competitor.com"
                                            className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none"
                                            value={comp}
                                            onChange={(e) => {
                                                const newCompetitors = [...competitors];
                                                newCompetitors[idx] = e.target.value;
                                                setCompetitors(newCompetitors);
                                            }}
                                        />
                                        {competitors.length > 1 && (
                                            <button
                                                onClick={() => setCompetitors(competitors.filter((_, i) => i !== idx))}
                                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 dark:shadow-none transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-3 text-lg"
                    >
                        {analyzing ? (
                            <><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> Analyzing Engine...</>
                        ) : (
                            <><Zap className="w-6 h-6" /> Start Enterprise Audit</>
                        )}
                    </button>
                </div>

                {report && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Actions Bar */}
                        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="text-sm text-gray-500">
                                Generated for: <span className="font-semibold text-gray-900 dark:text-white">{report.domain}</span>
                            </div>
                            {report.pdf_url && (
                                <a
                                    href={report.pdf_url}
                                    target="_blank"
                                    download
                                    className="inline-flex items-center px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-green-200 dark:shadow-none transition-all transform hover:scale-105"
                                >
                                    <Download className="w-4 h-4 mr-2" /> Download PDF Report
                                </a>
                            )}
                        </div>

                        {/* Overview Dashboard */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Overall Score */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between relative overflow-hidden">
                                <div>
                                    <h3 className="text-gray-500 font-medium uppercase tracking-wide text-xs mb-4">Overall SEO Score</h3>
                                    <div className="flex items-end items-baseline">
                                        <span className={`text-6xl font-black ${getScoreColor(report.overall_score)}`}>{report.overall_score}</span>
                                        <span className="text-gray-400 text-xl font-medium ml-2">/ 100</span>
                                    </div>
                                </div>
                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-32 h-32 opacity-20">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ score: 100, fill: '#e5e7eb' }, { score: report.overall_score, fill: getScoreColor(report.overall_score).includes('green') ? '#22c55e' : getScoreColor(report.overall_score).includes('yellow') ? '#eab308' : '#ef4444' }]} startAngle={90} endAngle={-270}>
                                            <RadialBar background dataKey="score" cornerRadius={10} />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Website Preview */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600" />
                                <div className="relative z-10 bg-white/90 dark:bg-black/70 backdrop-blur-sm p-4 rounded-xl">
                                    <Globe className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                    <h3 className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{report.domain}</h3>
                                    <a href={report.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center justify-center mt-1">
                                        Visit Site <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                </div>
                            </div>

                            {/* Category Scores */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="text-gray-500 font-medium uppercase tracking-wide text-xs mb-4">Category Scores</h3>
                                <div className="space-y-3">
                                    {[
                                        { name: 'On-Page SEO', score: report.on_page_seo?.score || 0 },
                                        { name: 'Technical SEO', score: report.technical_seo?.score || 0 },
                                        { name: 'Content Quality', score: report.content_quality?.score || 0 },
                                        { name: 'Keywords', score: report.keyword_research?.score || 0 },
                                        { name: 'Backlinks', score: report.backlinks?.quality_score || 0 },
                                        { name: 'Internal Links', score: report.internal_links?.score || 0 },
                                        { name: 'UX Signals', score: report.user_experience?.score || 0 },
                                        { name: 'Structured Data', score: report.structured_data?.score || 0 },
                                        { name: 'Performance', score: report.performance?.score || 0 },
                                        { name: 'Security', score: report.security?.score || 0 },
                                    ].map((cat, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{cat.name}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className={`h-full ${getScoreBgColor(cat.score)}`} style={{ width: `${Math.min(100, Math.max(0, cat.score))}%` }} />
                                                </div>
                                                <span className={`text-sm font-bold w-12 text-right ${getScoreColor(cat.score)}`}>{cat.score}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Detailed Analysis Tabs */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="border-b border-gray-200 dark:border-gray-700">
                                <div className="flex overflow-x-auto">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                                                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                                }`}
                                        >
                                            <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Comparison Tab */}
                                {activeTab === 'comparison' && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr>
                                                    <th className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 z-10">Metric</th>
                                                    <th className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/10 min-w-[200px]">
                                                        <div className="font-bold text-gray-900 dark:text-white truncate" title={report.url}>{report.domain || 'Main Site'}</div>
                                                        <div className="text-xs text-blue-600 dark:text-blue-400">Target</div>
                                                    </th>
                                                    {competitorReports.map((comp, i) => (
                                                        <th key={i} className="p-4 border-b border-gray-200 dark:border-gray-700 min-w-[200px]">
                                                            <div className="font-bold text-gray-900 dark:text-white truncate" title={comp.url}>{comp.domain || `Competitor ${i + 1}`}</div>
                                                            <div className="text-xs text-gray-500">Competitor</div>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {[
                                                    { label: 'Overall Score', key: 'overall_score', format: (v: any) => v + '/100', color: true },
                                                    { label: 'On-Page SEO', key: 'on_page_seo.score', format: (v: any) => v + '/100', color: true },
                                                    { label: 'Technical SEO', key: 'technical_seo.score', format: (v: any) => v + '/100', color: true },
                                                    { label: 'Content Quality', key: 'content_quality.score', format: (v: any) => v + '/100', color: true },
                                                    { label: 'Performance', key: 'performance.score', format: (v: any) => v + '/100', color: true },
                                                    { label: 'Load Time', key: 'performance.load_time_ms', format: (v: any) => v + 'ms' },
                                                    { label: 'Backlinks', key: 'backlinks.total_backlinks', format: (v: any) => v?.toLocaleString() || 0 },
                                                    { label: 'Referring Domains', key: 'backlinks.referring_domains', format: (v: any) => v?.toLocaleString() || 0 },
                                                    { label: 'Word Count', key: 'content_quality.content_quality.word_count', format: (v: any) => v?.toLocaleString() || 0 },
                                                    { label: 'Internal Links', key: 'internal_links.total_internal_links', format: (v: any) => v?.toLocaleString() || 0 },
                                                ].map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                        <td className="p-4 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-100 dark:border-gray-700">{row.label}</td>
                                                        <td className="p-4 font-semibold text-gray-900 dark:text-white bg-blue-50/10 dark:bg-blue-900/5">
                                                            <span className={row.color ? getScoreColor(getNestedValue(report, row.key)) : ''}>
                                                                {row.format(getNestedValue(report, row.key))}
                                                            </span>
                                                        </td>
                                                        {competitorReports.map((comp, i) => (
                                                            <td key={i} className="p-4 text-gray-600 dark:text-gray-400">
                                                                <span className={row.color ? getScoreColor(getNestedValue(comp, row.key)) : ''}>
                                                                    {row.format(getNestedValue(comp, row.key))}
                                                                </span>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* 3D Visualizer Tab */}
                                {activeTab === '3d-visualizer' && (
                                    <SEO3DVisualizer />
                                )}

                                {/* Growth Engine Tab */}
                                {activeTab === 'growth' && (
                                    <SEOGrowthDashboard data={report} />
                                )}

                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                                                <h4 className="font-bold text-gray-900 dark:text-white mb-4">On-Page SEO</h4>
                                                <div className="text-3xl font-black text-blue-600 mb-2">{report.on_page_seo?.score || 0}/100</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {report.on_page_seo?.title?.optimal ? '✓' : '✗'} Title Tag Optimized<br />
                                                    {report.on_page_seo?.meta_description?.optimal ? '✓' : '✗'} Meta Description Optimized<br />
                                                    {report.on_page_seo?.images?.missing_alt === 0 ? '✓' : '✗'} All Images Have Alt Text
                                                </div>
                                            </div>
                                            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                                                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Content Quality</h4>
                                                <div className="text-3xl font-black text-green-600 mb-2">{report.content_quality?.score || 0}/100</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Intent: {report.content_quality?.user_intent?.primary_intent || 'N/A'}<br />
                                                    Readability: {report.content_quality?.readability?.readability_level || 'N/A'}<br />
                                                    Word Count: {report.content_quality?.content_quality?.word_count?.toLocaleString() || 0}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-64 md:h-80 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart outerRadius="80%" data={[
                                                    { subject: 'On-Page', A: report.on_page_seo?.score || 0, fullMark: 100 },
                                                    { subject: 'Technical', A: report.technical_seo?.score || 0, fullMark: 100 },
                                                    { subject: 'Content', A: report.content_quality?.score || 0, fullMark: 100 },
                                                    { subject: 'Keywords', A: report.keyword_research?.score || 0, fullMark: 100 },
                                                    { subject: 'Backlinks', A: report.backlinks?.quality_score || 0, fullMark: 100 },
                                                    { subject: 'Internal', A: report.internal_links?.score || 0, fullMark: 100 },
                                                    { subject: 'UX', A: report.user_experience?.score || 0, fullMark: 100 },
                                                    { subject: 'Performance', A: report.performance?.score || 0, fullMark: 100 },
                                                ]}>
                                                    <PolarGrid stroke="#e5e7eb" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                                    <Radar name="SEO Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                                                    <Tooltip />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}

                                {/* Content Quality Tab */}
                                {activeTab === 'content' && report.content_quality && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-bold mb-4">User Intent Analysis</h4>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <div className="text-sm mb-2">
                                                        <span className="font-semibold">Primary Intent:</span> {report.content_quality.user_intent?.primary_intent || 'N/A'}
                                                    </div>
                                                    <div className="text-sm mb-2">
                                                        <span className="font-semibold">Confidence:</span> {report.content_quality.user_intent?.intent_confidence || 0}%
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="font-semibold">Matches Intent:</span> {report.content_quality.user_intent?.matches_intent ? '✓ Yes' : '✗ No'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-bold mb-4">Readability</h4>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <div className="text-sm mb-2">
                                                        <span className="font-semibold">Flesch Reading Ease:</span> {report.content_quality.readability?.flesch_reading_ease || 'N/A'}
                                                    </div>
                                                    <div className="text-sm mb-2">
                                                        <span className="font-semibold">Grade Level:</span> {report.content_quality.readability?.recommended_grade_level || 'N/A'}
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="font-semibold">Level:</span> {report.content_quality.readability?.readability_level || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold mb-4">Content Quality Metrics</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                                                    <div className="text-2xl font-bold text-blue-600">{report.content_quality.content_quality?.word_count?.toLocaleString() || 0}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Word Count</div>
                                                </div>
                                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                                                    <div className="text-2xl font-bold text-green-600">{report.content_quality.content_quality?.paragraph_count || 0}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Paragraphs</div>
                                                </div>
                                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                                                    <div className="text-2xl font-bold text-purple-600">{report.content_quality.content_quality?.list_count || 0}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Lists</div>
                                                </div>
                                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                                                    <div className="text-2xl font-bold text-orange-600">{report.content_quality.content_quality?.uniqueness_ratio || 0}%</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Uniqueness</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold mb-4">Content Structure</h4>
                                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>H1: {report.content_quality.structure?.headings?.h1 || 0}</div>
                                                    <div>H2: {report.content_quality.structure?.headings?.h2 || 0}</div>
                                                    <div>H3: {report.content_quality.structure?.headings?.h3 || 0}</div>
                                                    <div>Structure Score: {report.content_quality.structure?.structure_score || 0}/100</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Internal Links Tab */}
                                {activeTab === 'internal' && report.internal_links && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                                                <div className="text-3xl font-bold text-blue-600">{report.internal_links.total_internal_links || 0}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Total Internal Links</div>
                                            </div>
                                            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                                                <div className="text-3xl font-bold text-green-600">{report.internal_links.unique_internal_links || 0}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Unique Links</div>
                                            </div>
                                            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                                                <div className="text-3xl font-bold text-purple-600">{report.internal_links.anchor_text_diversity?.diversity_score || 0}%</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Anchor Diversity</div>
                                            </div>
                                            <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-center">
                                                <div className="text-3xl font-bold text-orange-600">{report.internal_links.total_external_links || 0}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">External Links</div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold mb-4">Link Distribution</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">Navigation Links</div>
                                                    <div className="text-2xl font-bold">{report.internal_links.link_distribution?.navigation_links || 0}</div>
                                                </div>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">Content Links</div>
                                                    <div className="text-2xl font-bold">{report.internal_links.link_distribution?.content_links || 0}</div>
                                                </div>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">Footer Links</div>
                                                    <div className="text-2xl font-bold">{report.internal_links.link_distribution?.footer_links || 0}</div>
                                                </div>
                                            </div>
                                        </div>
                                        {report.internal_links.orphan_page_risk?.is_orphan_risk && (
                                            <div className={`p-4 rounded-lg border-l-4 ${report.internal_links.orphan_page_risk.risk_level === 'High' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'}`}>
                                                <div className="font-semibold text-gray-900 dark:text-white mb-1">
                                                    ⚠ Orphan Page Risk: {report.internal_links.orphan_page_risk.risk_level}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">{report.internal_links.orphan_page_risk.recommendation}</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* User Experience Tab */}
                                {activeTab === 'ux' && report.user_experience && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-bold mb-4">Mobile UX</h4>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Viewport Meta</span>
                                                        <span className={report.user_experience.mobile_ux?.has_viewport ? 'text-green-600' : 'text-red-600'}>
                                                            {report.user_experience.mobile_ux?.has_viewport ? '✓' : '✗'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Mobile Friendly</span>
                                                        <span className={report.user_experience.mobile_ux?.mobile_friendly ? 'text-green-600' : 'text-red-600'}>
                                                            {report.user_experience.mobile_ux?.mobile_friendly ? '✓' : '✗'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Responsive Images</span>
                                                        <span className="text-gray-600 dark:text-gray-400">{report.user_experience.mobile_ux?.responsive_images || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-bold mb-4">Layout Stability (CLS)</h4>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">CLS Status</span>
                                                        <span className={report.user_experience.layout_stability?.is_stable ? 'text-green-600' : 'text-red-600'}>
                                                            {report.user_experience.layout_stability?.cls_status || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Risk Factors</span>
                                                        <span className="text-gray-600 dark:text-gray-400">{report.user_experience.layout_stability?.risk_factors?.total_risk_factors || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold mb-4">Engagement Potential</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                                                    <div className="text-2xl font-bold text-blue-600">{report.user_experience.engagement_potential?.cta_count || 0}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">CTAs</div>
                                                </div>
                                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                                                    <div className="text-2xl font-bold text-green-600">{report.user_experience.engagement_potential?.forms_count || 0}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Forms</div>
                                                </div>
                                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                                                    <div className="text-2xl font-bold text-purple-600">{report.user_experience.engagement_potential?.links_count || 0}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Links</div>
                                                </div>
                                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                                                    <div className="text-2xl font-bold text-orange-600">{report.user_experience.engagement_potential?.engagement_score || 0}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Engagement Score</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Structured Data Tab */}
                                {activeTab === 'structured' && report.structured_data && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                                                <div className="text-3xl font-bold text-blue-600">{report.structured_data.json_ld_count || 0}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">JSON-LD Blocks</div>
                                            </div>
                                            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                                                <div className="text-3xl font-bold text-green-600">{report.structured_data.open_graph_tags || 0}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Open Graph Tags</div>
                                            </div>
                                            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                                                <div className="text-3xl font-bold text-purple-600">{report.structured_data.twitter_card_tags || 0}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Twitter Cards</div>
                                            </div>
                                            <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-center">
                                                <div className={`text-3xl font-bold ${report.structured_data.has_breadcrumbs ? 'text-green-600' : 'text-red-600'}`}>
                                                    {report.structured_data.has_breadcrumbs ? '✓' : '✗'}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Breadcrumbs</div>
                                            </div>
                                        </div>
                                        {report.structured_data.schema_types && report.structured_data.schema_types.length > 0 && (
                                            <div>
                                                <h4 className="font-bold mb-4">Schema Types Detected</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {report.structured_data.schema_types.map((type: string, idx: number) => (
                                                        <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                                                            {type}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {report.structured_data.has_faq_schema && (
                                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                <div className="text-sm font-semibold text-green-600">✓ FAQ Schema detected</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Other tabs - keeping existing implementations but simplified */}
                                {activeTab === 'onpage' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-bold mb-4">Title Tag</h4>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                        {report.on_page_seo?.title?.text || 'Not found'}
                                                    </div>
                                                    <div className={`text-xs ${report.on_page_seo?.title?.optimal ? 'text-green-600' : 'text-red-600'}`}>
                                                        Length: {report.on_page_seo?.title?.length || 0} chars {report.on_page_seo?.title?.optimal ? '(Optimal)' : '(Needs optimization)'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-bold mb-4">Meta Description</h4>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                        {report.on_page_seo?.meta_description?.text || 'Not found'}
                                                    </div>
                                                    <div className={`text-xs ${report.on_page_seo?.meta_description?.optimal ? 'text-green-600' : 'text-red-600'}`}>
                                                        Length: {report.on_page_seo?.meta_description?.length || 0} chars {report.on_page_seo?.meta_description?.optimal ? '(Optimal)' : '(Needs optimization)'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Keywords Tab */}
                                {activeTab === 'keywords' && report.keyword_research && (
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-bold mb-4">Top Keyword Suggestions</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {report.keyword_research.top_keywords?.slice(0, 9).map((kw: any, idx: number) => (
                                                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                        <div className="font-semibold text-gray-900 dark:text-white mb-2">{kw.keyword}</div>
                                                        <div className="text-sm space-y-1">
                                                            <div>Difficulty: <span className="font-medium">{kw.difficulty}/100</span></div>
                                                            <div>Volume: <span className="font-medium">{kw.estimated_volume.toLocaleString()}</span></div>
                                                            <div>Competition: <span className={`font-medium ${kw.competition === 'low' ? 'text-green-600' : kw.competition === 'medium' ? 'text-yellow-600' : 'text-red-600'}`}>{kw.competition}</span></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Backlinks Tab */}
                                {activeTab === 'backlinks' && report.backlinks && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                                                <div className="text-3xl font-bold text-blue-600">{report.backlinks.total_backlinks?.toLocaleString() || 0}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Total Backlinks</div>
                                            </div>
                                            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                                                <div className="text-3xl font-bold text-green-600">{report.backlinks.referring_domains?.toLocaleString() || 0}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Referring Domains</div>
                                            </div>
                                            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                                                <div className="text-3xl font-bold text-purple-600">{report.backlinks.domain_authority || 0}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Domain Authority</div>
                                            </div>
                                            <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
                                                <div className="text-3xl font-bold text-red-600">{report.backlinks.spam_score || 0}%</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Spam Score</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Technical, Performance, Security, Recommendations tabs - keeping existing logic */}
                                {activeTab === 'technical' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-bold mb-4">Crawlability</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                        <span className="text-sm">robots.txt</span>
                                                        <span className={report.technical_seo?.crawlability?.robots_txt ? 'text-green-600' : 'text-red-600'}>
                                                            {report.technical_seo?.crawlability?.robots_txt ? '✓ Found' : '✗ Missing'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                        <span className="text-sm">Sitemap</span>
                                                        <span className={report.technical_seo?.crawlability?.sitemap ? 'text-green-600' : 'text-red-600'}>
                                                            {report.technical_seo?.crawlability?.sitemap ? '✓ Found' : '✗ Missing'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                        <span className="text-sm">Canonical Tag</span>
                                                        <span className={report.technical_seo?.crawlability?.canonical ? 'text-green-600' : 'text-red-600'}>
                                                            {report.technical_seo?.crawlability?.canonical ? '✓ Present' : '✗ Missing'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-bold mb-4">Mobile Optimization</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                        <span className="text-sm">Viewport Meta</span>
                                                        <span className={report.technical_seo?.mobile_optimization?.viewport_meta ? 'text-green-600' : 'text-red-600'}>
                                                            {report.technical_seo?.mobile_optimization?.viewport_meta ? '✓ Present' : '✗ Missing'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                        <span className="text-sm">Mobile Friendly</span>
                                                        <span className={report.technical_seo?.mobile_optimization?.mobile_friendly ? 'text-green-600' : 'text-red-600'}>
                                                            {report.technical_seo?.mobile_optimization?.mobile_friendly ? '✓ Yes' : '✗ No'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'performance' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                                                <div className="text-3xl font-bold text-blue-600">{report.performance?.load_time_ms || 0}ms</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Page Load Time</div>
                                            </div>
                                            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                                                <div className="text-3xl font-bold text-green-600">{report.performance?.page_size_kb?.toFixed(2) || 0} KB</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Page Size</div>
                                            </div>
                                            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                                                <div className={`text-3xl font-bold ${report.performance?.compression ? 'text-green-600' : 'text-red-600'}`}>
                                                    {report.performance?.compression ? '✓' : '✗'}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Compression</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="font-semibold">HTTPS</span>
                                                    <span className={report.security?.https ? 'text-green-600 text-2xl' : 'text-red-600 text-2xl'}>
                                                        {report.security?.https ? '✓' : '✗'}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {report.security?.https ? 'SSL certificate is properly configured' : 'Site is not using HTTPS'}
                                                </div>
                                            </div>
                                            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="font-semibold">HSTS</span>
                                                    <span className={report.security?.hsts ? 'text-green-600 text-2xl' : 'text-red-600 text-2xl'}>
                                                        {report.security?.hsts ? '✓' : '✗'}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {report.security?.hsts ? 'HTTP Strict Transport Security enabled' : 'HSTS header not found'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'recommendations' && (
                                    <div className="space-y-4">
                                        {report.recommendations && report.recommendations.length > 0 ? (
                                            report.recommendations.map((rec: any, idx: number) => (
                                                <div key={idx} className={`p-5 rounded-lg border-l-4 ${rec.priority === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' : rec.priority === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'}`}>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center mb-2">
                                                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase mr-2 ${rec.priority === 'critical' ? 'bg-red-100 text-red-700' : rec.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                    {rec.priority}
                                                                </span>
                                                                <span className="font-semibold text-gray-900 dark:text-white">{rec.message}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">Action: {rec.action}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-500 italic">
                                                No recommendations at this time. Great job!
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SeoToolsPage;
