import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler);

const SocialInsightsPage: React.FC = () => {
  const API_BASE = (import.meta as any)?.env?.VITE_API_URL || 'http://127.0.0.1:5001';
  const SOCIAL_API_KEY = (import.meta as any)?.env?.VITE_SOCIAL_API_KEY as string | undefined;
  const [url, setUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<any | null>(null);

  const exportCsvHref = `${API_BASE}/api/social/export/csv?url=${encodeURIComponent(url || data?.url || '')}`;

  const handleAnalyze = async () => {
    setError(null);
    setData(null);
    if (!url.trim()) { setError('Enter a social profile URL'); return; }
    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (SOCIAL_API_KEY) headers['X-API-Key'] = SOCIAL_API_KEY;
      const resp = await fetch(`${API_BASE}/social-media/analyze`, {
        method: 'POST', headers, body: JSON.stringify({ url: url.trim() })
      });
      const ct = resp.headers.get('content-type') || '';
      const payload = ct.includes('application/json') ? await resp.json() : await resp.text();
      if (!resp.ok) {
        const msg = typeof payload === 'string' ? payload.slice(0, 200) : (payload?.error || 'Failed to fetch insights');
        throw new Error(msg);
      }
      if (typeof payload === 'string') throw new Error('Server returned non-JSON response');
      if ((payload && payload.error && payload.success === false) || payload.success === false) {
        throw new Error(payload.error || 'Unable to fetch social media data');
      }
      setData(payload);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch insights');
    } finally { setLoading(false); }
  };

  const barData = React.useMemo(() => {
    if (!data) return null;
    if (typeof data?.posts === 'number' || typeof data?.engagementRate === 'number') {
      return {
        labels: ['Posts', 'Engagement%'],
        datasets: [{ label: 'Metrics', data: [data?.posts || 0, Math.round((data?.engagementRate || 0) * 100)], backgroundColor: ['#3b82f6', '#22c55e'] }]
      };
    }
    return null;
  }, [data]);
  const barOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } } as const;

  const trendData = React.useMemo(() => {
    if (!data) return null;
    if (typeof data?.posts === 'number' || typeof data?.engagementRate === 'number') {
      const points = Array.from({ length: 7 }).map((_, i) => {
        const base = (data?.posts || 0) + i - 3;
        const e = Math.max(0, (data?.engagementRate || 0) * 100 + (i - 3));
        return { p: Math.max(0, base), e };
      });
      return {
        labels: points.map((_, i) => `D-${6 - i}`),
        datasets: [
          { label: 'Posts', data: points.map(x => x.p), yAxisID: 'y', borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.2)', fill: true, tension: 0.3 },
          { label: 'Engagement %', data: points.map(x => x.e), yAxisID: 'y1', borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.2)', fill: true, tension: 0.3 }
        ]
      };
    }
    return null;
  }, [data]);
  const trendOptions = { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true }, y1: { beginAtZero: true, position: 'right' } } } as const;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Social Insights</h1>
            <p className="text-gray-600 dark:text-gray-300">Analyze any social profile URL (Instagram, Facebook, LinkedIn, Twitter/X) and see a clean insights dashboard.</p>
          </div>
          <a href={exportCsvHref} target="_blank" rel="noreferrer" className="rounded-md border px-3 py-2 text-sm border-gray-300 dark:border-gray-700">Export CSV</a>
        </div>

        <div className="mb-6 flex gap-3">
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Enter social profile URL (e.g., https://instagram.com/username)"
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
          />
          <button onClick={handleAnalyze} disabled={loading}
            className={`rounded-md px-4 py-2 text-sm border ${loading ? 'opacity-60' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} border-gray-300 dark:border-gray-700`}>
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-4 py-3">{error}</div>
        )}

        {loading && !data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
            <div className="h-24 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800" />
            <div className="h-24 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800" />
            <div className="h-24 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800" />
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Overview Cards: platform, final score, activity, engagement potential */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white/60 dark:bg-gray-900/40">
                <div className="text-xs text-gray-500 dark:text-gray-400">Platform</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{data.platform || 'unknown'}</div>
                {data.fetched_at && <div className="text-[10px] text-gray-500 mt-1">Fetched: {new Date(data.fetched_at).toLocaleString()}</div>}
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white/60 dark:bg-gray-900/40">
                <div className="text-xs text-gray-500 dark:text-gray-400">Final Social Score</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.analysis?.scores?.final ?? '—'}</div>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white/60 dark:bg-gray-900/40">
                <div className="text-xs text-gray-500 dark:text-gray-400">Activity</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.analysis?.activity?.classification ?? '—'}</div>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white/60 dark:bg-gray-900/40">
                <div className="text-xs text-gray-500 dark:text-gray-400">Engagement Potential</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.analysis?.engagement_potential?.classification ?? '—'}</div>
              </div>
            </div>

            {barData && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/50 dark:bg-gray-900/40">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Overview</h2>
                <Bar data={barData} options={barOptions} />
              </div>
            )}

            {trendData && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/50 dark:bg-gray-900/40">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recent Trend (approx)</h2>
                <Line data={trendData} options={trendOptions} />
              </div>
            )}

            {/* Sectioned Analysis */}
            {data.analysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'activity', title: 'Activity Level', what: 'Presence and gaps of recent content' },
                  { key: 'content_quality', title: 'Content Quality', what: 'Length, CTA words, topic clarity' },
                  { key: 'consistency', title: 'Consistency', what: 'Upload/posting interval stability' },
                  { key: 'optimization', title: 'Profile Optimization', what: 'Description, links, keywords/niche clarity' },
                  { key: 'engagement_potential', title: 'Engagement Potential', what: 'CTAs, questions, content variety' },
                ].map((sec) => (
                  <div key={sec.key} className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/50 dark:bg-gray-900/40">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">{sec.title}</h3>
                    <div className="text-xs text-gray-500 mb-2">What: {sec.what}</div>
                    <div className="text-sm text-gray-800 dark:text-gray-200">Score: {data.analysis?.[sec.key]?.score ?? '—'}</div>
                    {data.analysis?.[sec.key]?.why && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">Why: {data.analysis?.[sec.key]?.why}</div>
                    )}
                    {Array.isArray(data.analysis?.[sec.key]?.improvements) && (data.analysis?.[sec.key]?.improvements?.length > 0) && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500">How to improve</div>
                        <ul className="list-disc pl-5 text-sm text-emerald-700 dark:text-emerald-300">
                          {data.analysis?.[sec.key]?.improvements?.slice(0,4).map((it: string, idx: number) => (
                            <li key={idx}>🛠 {it}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Limitations & Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/50 dark:bg-gray-900/40">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Non-measurable Limitations</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
                  {(data.analysis?.activity?.limitations || []).length ? data.analysis.activity.limitations.map((l: string, i: number) => (
                    <li key={i}>⚠️ {l}</li>
                  )) : (
                    <li className="text-gray-500">No limitations reported.</li>
                  )}
                </ul>
                {data.notes && <div className="text-[11px] text-gray-500 mt-2">Note: {data.notes}</div>}
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/50 dark:bg-gray-900/40">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Recommendations</h3>
                <ul className="list-disc pl-5 text-sm text-emerald-700 dark:text-emerald-300">
                  {(data.analysis ? [
                    ...(data.analysis.activity?.improvements || []),
                    ...(data.analysis.content_quality?.improvements || []),
                    ...(data.analysis.consistency?.improvements || []),
                    ...(data.analysis.optimization?.improvements || []),
                    ...(data.analysis.engagement_potential?.improvements || []),
                  ] : []).slice(0,8).filter(Boolean).map((r: string, i: number)=> (
                    <li key={i}>🛠 {r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SocialInsightsPage;


