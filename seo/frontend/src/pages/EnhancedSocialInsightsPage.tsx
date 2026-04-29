import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Video,
  Image,
  Download,
  Loader2,
  Instagram,
  Facebook,
  Youtube,
  AlertCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const EnhancedSocialInsightsPage: React.FC = () => {
  const API_BASE = (import.meta as any)?.env?.VITE_API_URL || 'http://127.0.0.1:5001';
  const SOCIAL_API_KEY = (import.meta as any)?.env?.VITE_SOCIAL_API_KEY as string | undefined;
  const YT_API_KEY = (import.meta as any)?.env?.VITE_YT_API_KEY as string | undefined;
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  const handleAnalyze = async () => {
    setError(null);
    setData(null);
    if (!url.trim()) {
      setError('Please enter a social media profile URL');
      return;
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (SOCIAL_API_KEY) headers['X-API-Key'] = SOCIAL_API_KEY;
      if (YT_API_KEY) headers['X-YT-API-Key'] = YT_API_KEY;

      console.log('Making API call to:', `${API_BASE}/social-media/analyze`);
      console.log('Request body:', { url: url.trim() });

      const resp = await fetch(`${API_BASE}/social-media/analyze`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          url: url.trim()
        })
      });

      console.log('Response status:', resp.status);
      console.log('Response headers:', resp.headers);

      const payload = await resp.json();
      console.log('Response payload:', payload);

      // Check if there's an error in the response
      if (payload.error && !payload.success) {
        const errorMsg = payload.error || 'Failed to fetch insights';
        const details = payload.details || '';
        const fullError = details ? `${errorMsg}\n\nDetails: ${details}` : errorMsg;
        throw new Error(fullError);
      }

      // Set data even if there are warnings (like scraping limitations)
      console.log('Setting data:', payload);
      console.log('Data structure:', JSON.stringify(payload, null, 2));
      console.log('Channel data:', payload.channel_data);
      console.log('Final score:', payload.final_score);
      setData(payload);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  };

  const renderExplainableAnalysis = (payload: any) => {
    const analysis = payload?.analysis || {};
    const fetchedAt = payload?.fetched_at ? new Date(payload.fetched_at).toLocaleString() : null;
    const sections = [
      { key: 'activity', title: 'Activity Level', what: 'Presence and gaps of recent content' },
      { key: 'content_quality', title: 'Content Quality', what: 'Length, CTA words, topic clarity' },
      { key: 'consistency', title: 'Consistency', what: 'Upload/posting interval stability' },
      { key: 'optimization', title: 'Profile Optimization', what: 'Description, links, keywords/niche clarity' },
      { key: 'engagement_potential', title: 'Engagement Potential', what: 'CTAs, questions, content variety' },
      { key: 'audience_insights', title: 'Audience Insights', what: 'Demographics and interests inferred from content' },
      { key: 'content_strategy', title: 'Content Strategy', what: 'Recommended pillars and themes' },
    ] as const;

    const recs: string[] = [
      ...(analysis.activity?.improvements || []),
      ...(analysis.content_quality?.improvements || []),
      ...(analysis.consistency?.improvements || []),
      ...(analysis.optimization?.improvements || []),
      ...(analysis.engagement_potential?.improvements || []),
      ...(analysis.audience_insights?.improvements || []),
      ...(analysis.content_strategy?.improvements || []),
    ].filter(Boolean);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">Final Social Score</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{analysis?.scores?.final ?? '—'}</div>
            {fetchedAt && <div className="text-[10px] text-gray-500 mt-1">Fetched: {fetchedAt}</div>}
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">Activity</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{analysis?.activity?.classification ?? '—'}</div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">Engagement Potential</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{analysis?.engagement_potential?.classification ?? '—'}</div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">Platform</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{payload?.platform || '—'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((sec) => (
            <div key={sec.key} className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">{sec.title}</h3>
              <div className="text-xs text-gray-500 mb-2">What: {sec.what}</div>
              <div className="text-sm text-gray-800 dark:text-gray-200">Score: {analysis?.[sec.key]?.score ?? '—'}</div>
              {analysis?.[sec.key]?.why && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">Why: {analysis?.[sec.key]?.why}</div>
              )}
              {Array.isArray(analysis?.[sec.key]?.improvements) && (analysis?.[sec.key]?.improvements?.length > 0) && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500">How to improve</div>
                  <ul className="list-disc pl-5 text-sm text-emerald-700 dark:text-emerald-300">
                    {analysis?.[sec.key]?.improvements?.slice(0, 4).map((it: string, idx: number) => (
                      <li key={idx}>🛠 {it}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Non-measurable Limitations</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
              {(analysis?.activity?.limitations || []).length ? analysis.activity.limitations.map((l: string, i: number) => (
                <li key={i}>⚠️ {l}</li>
              )) : (
                <li className="text-gray-500">No limitations reported.</li>
              )}
            </ul>
            {payload?.notes && <div className="text-[11px] text-gray-500 mt-2">Note: {payload.notes}</div>}
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Recommendations</h3>
            <ul className="list-disc pl-5 text-sm text-emerald-700 dark:text-emerald-300">
              {recs.slice(0, 8).map((r, i) => (
                <li key={i}>🛠 {r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const handleRefresh = () => {
    if (url.trim()) {
      handleAnalyze();
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platformLower = platform?.toLowerCase() || '';
    switch (platformLower) {
      case 'instagram': return <Instagram className="w-6 h-6" />;
      case 'facebook': return <Facebook className="w-6 h-6" />;
      case 'youtube': return <Youtube className="w-6 h-6" />;
      default: return <BarChart3 className="w-6 h-6" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    const platformLower = platform?.toLowerCase() || '';
    switch (platformLower) {
      case 'instagram': return 'from-pink-500 to-purple-600';
      case 'facebook': return 'from-blue-500 to-blue-700';
      case 'youtube': return 'from-red-500 to-red-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const renderMetricCard = (icon: React.ReactNode, label: string, value: string | number, color: string) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  const renderInstagramInsights = (insights: any) => {
    const engagement = insights.engagement || {};
    const recentPosts = insights.recent_posts || [];

    // Engagement chart data
    const engagementData = {
      labels: recentPosts.slice(0, 5).map((_: any, idx: number) => `Post ${idx + 1}`),
      datasets: [
        {
          label: 'Likes',
          data: recentPosts.slice(0, 5).map((p: any) => p.likes || 0),
          backgroundColor: 'rgba(236, 72, 153, 0.6)',
          borderColor: 'rgb(236, 72, 153)',
          borderWidth: 2
        },
        {
          label: 'Comments',
          data: recentPosts.slice(0, 5).map((p: any) => p.comments || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2
        }
      ]
    };

    return (
      <div className="space-y-6">
        {/* Profile Header */}
        {insights.profile_image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 flex items-center gap-6"
          >
            <img
              src={insights.profile_image}
              alt={insights.username}
              className="w-24 h-24 rounded-full border-4 border-pink-500"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {insights.full_name || `@${insights.username}`}
                {insights.is_verified && <span className="ml-2 text-blue-500">✓</span>}
              </h2>
              {insights.username && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">@{insights.username}</p>
              )}
              {insights.bio && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{insights.bio}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderMetricCard(
            <Users className="w-6 h-6 text-white" />,
            'Followers',
            insights.followers ? formatNumber(insights.followers) : 'N/A',
            'from-pink-500 to-purple-600'
          )}
          {renderMetricCard(
            <Image className="w-6 h-6 text-white" />,
            'Total Posts',
            insights.post_count ? formatNumber(insights.post_count) : 'N/A',
            'from-blue-500 to-purple-600'
          )}
          {renderMetricCard(
            <Heart className="w-6 h-6 text-white" />,
            'Engagement Rate',
            engagement.engagement_rate ? `${engagement.engagement_rate.toFixed(2)}%` : 'N/A',
            'from-red-500 to-pink-600'
          )}
          {renderMetricCard(
            <TrendingUp className="w-6 h-6 text-white" />,
            'Following',
            insights.following ? formatNumber(insights.following) : 'N/A',
            'from-green-500 to-teal-600'
          )}
        </div>

        {/* Charts and Recent Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Posts Engagement</h3>
            <Bar
              data={engagementData}
              options={{
                responsive: true,
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Posts</h3>
            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {recentPosts.length > 0 ? (
                recentPosts.map((post: any, idx: number) => (
                  <div key={idx} className="relative group">
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt={post.caption || 'Post'}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 text-white text-xs text-center p-2">
                        <div className="flex items-center gap-2 justify-center">
                          <Heart className="w-3 h-3" /> {formatNumber(post.likes || 0)}
                          <MessageCircle className="w-3 h-3 ml-2" /> {formatNumber(post.comments || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 col-span-2">No recent posts available</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const renderFacebookInsights = (insights: any) => {
    const engagement = insights.engagement || {};
    const recentPosts = insights.recent_posts || [];

    const engagementData = {
      labels: ['Reactions', 'Comments', 'Shares'],
      datasets: [{
        data: [
          engagement.avg_likes || 0,
          engagement.avg_comments || 0,
          recentPosts.reduce((sum: number, p: any) => sum + (p.shares || 0), 0) / (recentPosts.length || 1)
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(249, 115, 22, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(249, 115, 22)'
        ],
        borderWidth: 2
      }]
    };

    return (
      <div className="space-y-6">
        {/* Profile Header */}
        {insights.profile_image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 flex items-center gap-6"
          >
            {insights.cover_image && (
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-blue-500 to-blue-700 rounded-t-xl" />
            )}
            <div className="relative flex items-center gap-6">
              <img
                src={insights.profile_image}
                alt={insights.page_name}
                className="w-24 h-24 rounded-full border-4 border-blue-500 relative z-10"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{insights.page_name}</h2>
                {insights.about && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{insights.about}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderMetricCard(
            <Users className="w-6 h-6 text-white" />,
            'Page Followers',
            insights.followers ? formatNumber(insights.followers) : 'N/A',
            'from-blue-500 to-blue-700'
          )}
          {renderMetricCard(
            <Heart className="w-6 h-6 text-white" />,
            'Page Likes',
            insights.likes ? formatNumber(insights.likes) : 'N/A',
            'from-pink-500 to-red-600'
          )}
          {renderMetricCard(
            <MessageCircle className="w-6 h-6 text-white" />,
            'Avg Comments',
            engagement.avg_comments ? formatNumber(Math.round(engagement.avg_comments)) : 'N/A',
            'from-green-500 to-teal-600'
          )}
          {renderMetricCard(
            <TrendingUp className="w-6 h-6 text-white" />,
            'Engagement Rate',
            engagement.engagement_rate ? `${engagement.engagement_rate.toFixed(2)}%` : 'N/A',
            'from-purple-500 to-indigo-600'
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Average Engagement Distribution</h3>
            <Doughnut data={engagementData} options={{ plugins: { legend: { position: 'bottom' } } }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Posts</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentPosts.length > 0 ? (
                recentPosts.map((post: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{post.text || post.message || post.caption || 'No content'}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {formatNumber(post.reactions || post.likes || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> {formatNumber(post.comments || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" /> {formatNumber(post.shares || 0)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent posts available</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const renderYouTubeInsights = (insights: any) => {
    const engagement = insights.engagement || {};
    // Handle both old and new response structures
    const recentVideos = insights.recent_videos || insights.channel_data?.recent_videos || [];
    const subscribers = insights.subscribers || insights.channel_data?.subscribers || 0;

    const videoStatsData = {
      labels: recentVideos.slice(0, 5).map((_: any, idx: number) => `Video ${idx + 1}`),
      datasets: [
        {
          label: 'Views',
          data: recentVideos.slice(0, 5).map((v: any) => v.views || 0),
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2
        }
      ]
    };

    const avgViewsPerVideo = subscribers > 0 && recentVideos.length > 0
      ? recentVideos.reduce((sum: number, v: any) => sum + (v.views || 0), 0) / recentVideos.length
      : 0;

    return (
      <div className="space-y-6">
        {/* Profile Header */}
        {insights.profile_image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 flex items-center gap-6"
          >
            {insights.banner_image && (
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-red-500 to-red-700 rounded-t-xl" />
            )}
            <div className="relative flex items-center gap-6">
              <img
                src={insights.profile_image}
                alt={insights.channel_name}
                className="w-24 h-24 rounded-full border-4 border-red-500 relative z-10"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{insights.channel_name || insights.channel_data?.channel_name || insights.channel_id}</h2>
                {(insights.description || insights.channel_data?.description) && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{insights.description || insights.channel_data?.description}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderMetricCard(
            <Users className="w-6 h-6 text-white" />,
            'Subscribers',
            (insights.subscribers || insights.channel_data?.subscribers) ? formatNumber(insights.subscribers || insights.channel_data?.subscribers) : 'N/A',
            'from-red-500 to-red-700'
          )}
          {renderMetricCard(
            <Eye className="w-6 h-6 text-white" />,
            'Total Views',
            (insights.total_views || insights.channel_data?.total_views) ? formatNumber(insights.total_views || insights.channel_data?.total_views) : 'N/A',
            'from-purple-500 to-pink-600'
          )}
          {renderMetricCard(
            <Video className="w-6 h-6 text-white" />,
            'Total Videos',
            (insights.video_count || insights.channel_data?.video_count) ? formatNumber(insights.video_count || insights.channel_data?.video_count) : 'N/A',
            'from-blue-500 to-cyan-600'
          )}
          {renderMetricCard(
            <TrendingUp className="w-6 h-6 text-white" />,
            'Avg Views/Video',
            (insights.avg_views_per_video || insights.channel_data?.avg_views_per_video) ? formatNumber(insights.avg_views_per_video || insights.channel_data?.avg_views_per_video) : 'N/A',
            'from-green-500 to-emerald-600'
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Videos Performance</h3>
            <Bar
              data={videoStatsData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Latest Videos</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentVideos.length > 0 ? (
                recentVideos.map((video: any, idx: number) => (
                  <div key={idx} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => video.video_url && window.open(video.video_url, '_blank')}
                  >
                    {video.thumbnail && (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-24 h-16 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{video.title || 'Untitled Video'}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {formatNumber(video.views || 0)}
                        </span>
                        {video.likes > 0 && (
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {formatNumber(video.likes)}
                          </span>
                        )}
                        {video.comments > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> {formatNumber(video.comments)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent videos available</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Social Media Analytics
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Analyze Instagram, Facebook, and YouTube profiles with real-time data
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="Enter social media profile URL (Instagram, Facebook, or YouTube)"
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5" />
                  Analyze
                </>
              )}
            </button>
          </div>

          {/* Platform Examples */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">✅ Try These Examples:</span>
            <button
              onClick={() => setUrl('https://www.youtube.com/channel/UCbRP3c757lWg9M-U7TyEkXA')}
              className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors cursor-pointer"
            >
              YouTube (Click to try)
            </button>
            <button
              onClick={() => setUrl('https://www.instagram.com/nasa/')}
              className="text-xs px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors cursor-pointer"
            >
              Instagram (Click to try)
            </button>
            <button
              onClick={() => setUrl('https://www.facebook.com/facebookapp')}
              className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
            >
              Facebook (Click to try)
            </button>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Analysis Failed</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1 whitespace-pre-line">{error}</p>
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1">✅ Try These Working Examples:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      onClick={() => {
                        setUrl('https://www.youtube.com/channel/UCbRP3c757lWg9M-U7TyEkXA');
                        setError(null);
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      YouTube Channel
                    </button>
                    <button
                      onClick={() => {
                        setUrl('https://www.instagram.com/nasa/');
                        setError(null);
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Instagram Profile
                    </button>
                    <button
                      onClick={() => {
                        setUrl('https://www.facebook.com/facebookapp');
                        setError(null);
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Facebook Page
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && !data && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400">Fetching social media insights...</p>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Platform Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gradient-to-r ${getPlatformColor(data.platform || '')} rounded-xl shadow-lg p-6 text-white`}
              >
                <div className="flex items-center gap-4">
                  {getPlatformIcon(data.platform || '')}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold capitalize">{data.platform || 'Social Media'} Profile Analysis</h2>
                    <p className="text-white/90 text-sm mt-1">{data.url || data.base_url || url}</p>
                  </div>
                  {data.success !== false && !data.error && (
                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Data Loaded</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Error/Warning Display */}
              {data.error && (
                <div className="mb-6 rounded-lg border border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <div>
                      <p className="font-semibold">Warning: {data.error}</p>
                      <p className="text-sm mt-1">Note: Web scraping may be limited by platform restrictions. Some data may not be available.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Prefer explainable analysis if available; else fallback to legacy platform UI */}
              {data.analysis ? (
                <div className="space-y-8">
                  {renderExplainableAnalysis(data)}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* INSTAGRAM SECTION */}
                  {(data.platform === 'Instagram' || data.platform?.toLowerCase() === 'instagram') && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Instagram Header */}
                      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center gap-4">
                          <Instagram className="w-8 h-8" />
                          <div>
                            <h2 className="text-2xl font-bold">Instagram Analytics</h2>
                            <p className="text-white/90 text-sm">Comprehensive Instagram profile insights</p>
                          </div>
                        </div>
                      </div>

                      {/* Instagram Content */}
                      {renderInstagramInsights(data)}

                      {/* Instagram Audience & Engagement */}
                      {data.engagement && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Engagement & Audience Insights</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                              <p className="text-sm text-pink-600 dark:text-pink-400">Engagement Rate</p>
                              <p className="text-2xl font-bold text-pink-800 dark:text-pink-200">
                                {data.engagement.engagement_rate ? `${data.engagement.engagement_rate.toFixed(2)}%` : 'N/A'}
                              </p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <p className="text-sm text-purple-600 dark:text-purple-400">Avg Likes</p>
                              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                                {formatNumber(data.engagement.avg_likes || 0)}
                              </p>
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-sm text-blue-600 dark:text-blue-400">Avg Comments</p>
                              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                {formatNumber(data.engagement.avg_comments || 0)}
                              </p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <p className="text-sm text-green-600 dark:text-green-400">Total Engagement</p>
                              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                                {formatNumber(data.engagement.total_engagement || 0)}
                              </p>
                            </div>
                          </div>
                          {data.audience && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                              {data.audience.age_distribution && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Age Distribution</h4>
                                  <div className="space-y-2">
                                    {Object.entries(data.audience.age_distribution).map(([age, pct]: any) => (
                                      <div key={age}>
                                        <div className="flex justify-between text-sm mb-1">
                                          <span className="text-gray-600 dark:text-gray-400">{age}</span>
                                          <span className="font-bold text-gray-900 dark:text-white">{pct}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                          <div className="h-full bg-pink-500" style={{ width: `${pct}%` }} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {data.audience.gender_split && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Gender Split</h4>
                                  <div className="flex gap-4">
                                    <div className="flex-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                                      <p className="text-xs text-blue-600 dark:text-blue-400">Male</p>
                                      <p className="text-xl font-bold text-blue-800 dark:text-blue-200">{data.audience.gender_split.Male}%</p>
                                    </div>
                                    <div className="flex-1 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg text-center">
                                      <p className="text-xs text-pink-600 dark:text-pink-400">Female</p>
                                      <p className="text-xl font-bold text-pink-800 dark:text-pink-200">{data.audience.gender_split.Female}%</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* FACEBOOK SECTION */}
                  {(data.platform === 'Facebook' || data.platform?.toLowerCase() === 'facebook') && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Facebook Header */}
                      <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center gap-4">
                          <Facebook className="w-8 h-8" />
                          <div>
                            <h2 className="text-2xl font-bold">Facebook Page Analytics</h2>
                            <p className="text-white/90 text-sm">Comprehensive Facebook page insights</p>
                          </div>
                        </div>
                      </div>

                      {/* Facebook Content */}
                      {renderFacebookInsights(data)}

                      {/* Facebook Audience & Engagement */}
                      {data.engagement && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Engagement & Audience Insights</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-sm text-blue-600 dark:text-blue-400">Engagement Rate</p>
                              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                {data.engagement.engagement_rate ? `${data.engagement.engagement_rate.toFixed(2)}%` : 'N/A'}
                              </p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <p className="text-sm text-green-600 dark:text-green-400">Avg Reactions</p>
                              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                                {formatNumber(data.engagement.avg_likes || 0)}
                              </p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <p className="text-sm text-purple-600 dark:text-purple-400">Avg Comments</p>
                              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                                {formatNumber(data.engagement.avg_comments || 0)}
                              </p>
                            </div>
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                              <p className="text-sm text-orange-600 dark:text-orange-400">Total Engagement</p>
                              <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                                {formatNumber(data.engagement.total_engagement || 0)}
                              </p>
                            </div>
                          </div>
                          {data.audience && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                              {data.audience.age_distribution && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Age Distribution</h4>
                                  <div className="space-y-2">
                                    {Object.entries(data.audience.age_distribution).map(([age, pct]: any) => (
                                      <div key={age}>
                                        <div className="flex justify-between text-sm mb-1">
                                          <span className="text-gray-600 dark:text-gray-400">{age}</span>
                                          <span className="font-bold text-gray-900 dark:text-white">{pct}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                          <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {data.audience.gender_split && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Gender Split</h4>
                                  <div className="flex gap-4">
                                    <div className="flex-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                                      <p className="text-xs text-blue-600 dark:text-blue-400">Male</p>
                                      <p className="text-xl font-bold text-blue-800 dark:text-blue-200">{data.audience.gender_split.Male}%</p>
                                    </div>
                                    <div className="flex-1 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg text-center">
                                      <p className="text-xs text-pink-600 dark:text-pink-400">Female</p>
                                      <p className="text-xl font-bold text-pink-800 dark:text-pink-200">{data.audience.gender_split.Female}%</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* YOUTUBE SECTION */}
                  {(data.platform === 'YouTube' || data.platform?.toLowerCase() === 'youtube') && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* YouTube Header */}
                      <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center gap-4">
                          <Youtube className="w-8 h-8" />
                          <div>
                            <h2 className="text-2xl font-bold">YouTube Channel Analytics</h2>
                            <p className="text-white/90 text-sm">Comprehensive YouTube channel insights</p>
                          </div>
                        </div>
                      </div>

                      {/* YouTube Content - Handle new response structure */}
                      {renderYouTubeInsights(data.data || data)}

                      {/* YouTube Audience & Engagement */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Channel Metrics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">Subscribers</p>
                            <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                              {(data.data?.subscribers || data.channel_data?.subscribers || data.subscribers) ? formatNumber(data.data?.subscribers || data.channel_data?.subscribers || data.subscribers) : 'N/A'}
                            </p>
                          </div>
                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <p className="text-sm text-purple-600 dark:text-purple-400">Total Views</p>
                            <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                              {(data.data?.total_views || data.channel_data?.total_views || data.total_views) ? formatNumber(data.data?.total_views || data.channel_data?.total_views || data.total_views) : 'N/A'}
                            </p>
                          </div>
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-blue-600 dark:text-blue-400">Total Videos</p>
                            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                              {(data.data?.video_count || data.channel_data?.video_count || data.video_count) ? formatNumber(data.data?.video_count || data.channel_data?.video_count || data.video_count) : 'N/A'}
                            </p>
                          </div>
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-sm text-green-600 dark:text-green-400">Avg Views/Video</p>
                            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                              {(data.data?.avg_views_per_video || data.channel_data?.avg_views_per_video || data.avgViewsPerVideo) ? formatNumber(data.data?.avg_views_per_video || data.channel_data?.avg_views_per_video || data.avgViewsPerVideo) : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Recent Videos */}
                        {(data.data?.recent_videos || data.channel_data?.recent_videos || data.recentVideos) && (
                          <div className="mt-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Videos</h4>
                            <div className="space-y-3">
                              {(data.data?.recent_videos || data.channel_data?.recent_videos || data.recentVideos).slice(0, 5).map((video: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white truncate">{video.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{video.published_time}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatNumber(video.views || 0)} views</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Score and Grade */}
                        {(data.final_score || data.scores) && (
                          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Score</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.final_score}/100</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Grade</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.grade}</p>
                              </div>
                            </div>
                            {data.classification && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{data.classification}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Export Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700"
              >
                <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Download className="w-5 h-5" />
                  Export Report PDF
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default EnhancedSocialInsightsPage;
