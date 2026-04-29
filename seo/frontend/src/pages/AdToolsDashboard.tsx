import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

type HealthGaugeProps = { score: number };
const HealthGauge: React.FC<HealthGaugeProps> = ({ score }) => {
  const s = Math.max(0, Math.min(100, score || 0));
  const color = s >= 85 ? '#22c55e' : s >= 60 ? '#f59e0b' : '#ef4444';
  const data = {
    labels: ['Score', 'Remaining'],
    datasets: [{ data: [s, 100 - s], backgroundColor: [color, '#e5e7eb'], borderWidth: 0 }]
  };
  const options = { cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } } as const;
  return (
    <div className="w-24 h-24 relative">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">{s}%</div>
      </div>
    </div>
  );
};

const AdToolsDashboard: React.FC = () => {
  const API_BASE = (import.meta as any)?.env?.VITE_SERVER_URL || 'http://127.0.0.1:5001/api';
  const [url, setUrl] = React.useState('');

  // Google Ads Analyzer state
  const [gaLoading, setGaLoading] = React.useState(false);
  const [gaData, setGaData] = React.useState<any | null>(null);
  const [gaError, setGaError] = React.useState<string | null>(null);

  // Ads.txt Validator state
  const [atLoading, setAtLoading] = React.useState(false);
  const [atData, setAtData] = React.useState<any | null>(null);
  const [atError, setAtError] = React.useState<string | null>(null);

  // Network Detection state
  const [ndLoading, setNdLoading] = React.useState(false);
  const [ndData, setNdData] = React.useState<any | null>(null);
  const [ndError, setNdError] = React.useState<string | null>(null);

  // Meta Ads Analyzer (stub)
  const [maLoading, setMaLoading] = React.useState(false);
  const [maData, setMaData] = React.useState<any | null>(null);
  const [maError, setMaError] = React.useState<string | null>(null);

  const runGoogleAdsAnalyzer = async () => {
    setGaError(null); setGaData(null);
    if (!url.trim()) { setGaError('Enter a valid URL'); return; }
    setGaLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/tools/google-ads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url.trim() }) });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || 'Failed');
      setGaData(json);
    } catch (e: any) {
      setGaError(e?.message || 'Failed to analyze');
    } finally { setGaLoading(false); }
  };

  const runAdsTxtValidator = async () => {
    setAtError(null); setAtData(null);
    if (!url.trim()) { setAtError('Enter a valid URL'); return; }
    setAtLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/tools/ads-txt?url=${encodeURIComponent(url.trim())}`);
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || 'Failed');
      setAtData(json);
    } catch (e: any) {
      setAtError(e?.message || 'Failed to validate');
    } finally { setAtLoading(false); }
  };

  const runNetworkDetection = async () => {
    setNdError(null); setNdData(null);
    if (!url.trim()) { setNdError('Enter a valid URL'); return; }
    setNdLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/tools/networks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url.trim() }) });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || 'Failed');
      setNdData(json);
    } catch (e: any) {
      setNdError(e?.message || 'Failed to detect networks');
    } finally { setNdLoading(false); }
  };

  const runMetaAdsAnalyzer = async () => {
    setMaError(null); setMaData(null);
    if (!url.trim()) { setMaError('Enter a valid URL'); return; }
    setMaLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/tools/meta-ads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url.trim() }) });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || 'Failed');
      setMaData(json);
    } catch (e: any) {
      setMaError(e?.message || 'Failed to analyze Meta ads');
    } finally { setMaLoading(false); }
  };

  const healthScore = Number(gaData?.healthScore || 0);
  const adsTxtStatus = gaData?.adsTxtInfo?.status || (gaData?.adsTxt ? 'Warning' : '');

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ad Tools</h1>
            <p className="text-gray-600 dark:text-gray-300">Quickly run focused ad analytics tools: Google Ads Analyzer, Meta Analyzer, Ads.txt Validator, and Network Detection.</p>
          </div>
        </div>

        <div className="mb-6 flex gap-3">
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Enter any website URL (e.g., https://example.com)"
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Google Ads Analyzer */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-gray-900/40 shadow-sm hover:shadow-lg transition-shadow duration-200 backdrop-blur">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">Google Ads Analyzer</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Deep scan + Health Score + AI tips</div>
              </div>
              <button onClick={runGoogleAdsAnalyzer} disabled={gaLoading}
                className={`rounded-md px-3 py-2 text-sm border ${gaLoading ? 'opacity-60' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} border-gray-300 dark:border-gray-700 transition-colors`}>
                {gaLoading ? 'Running…' : 'Run'}
              </button>
            </div>
            {gaError && <div className="text-sm text-red-600 dark:text-red-400">{gaError}</div>}
            {gaLoading && !gaData && (
              <div className="mt-3 grid grid-cols-3 gap-3 animate-pulse">
                <div className="h-20 rounded-md bg-gray-100 dark:bg-gray-800" />
                <div className="h-20 rounded-md bg-gray-100 dark:bg-gray-800" />
                <div className="h-20 rounded-md bg-gray-100 dark:bg-gray-800" />
              </div>
            )}
            {gaData && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-4">
                  <HealthGauge score={healthScore} />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400" title="Composite score based on ads.txt, rendered tags, JS weight, and heuristics">Health Score</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{healthScore}</div>
                    {adsTxtStatus && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">ads.txt: <span className={`px-2 py-0.5 rounded-full ${adsTxtStatus === 'Valid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : adsTxtStatus === 'Warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>{adsTxtStatus}</span></div>
                    )}
                  </div>
                </div>
                {gaData.networksFound?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {gaData.networksFound.map((n: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">{n}</span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 dark:text-gray-400">No networks detected.</div>
                )}
                <div className="text-sm text-gray-800 dark:text-gray-200">
                  {(gaData.issues?.length || gaData.suggestions?.length) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="font-semibold mb-1">Issues</div>
                        {gaData.issues?.length ? (
                          <ul className="list-disc pl-5">{gaData.issues.map((i: string, idx: number) => <li key={idx}>{i}</li>)}</ul>
                        ) : (<div className="text-gray-600 dark:text-gray-400">None</div>)}
                      </div>
                      <div>
                        <div className="font-semibold mb-1">Suggestions</div>
                        {gaData.suggestions?.length ? (
                          <ul className="list-disc pl-5">{gaData.suggestions.map((s: string, idx: number) => <li key={idx}>{s}</li>)}</ul>
                        ) : (<div className="text-gray-600 dark:text-gray-400">None</div>)}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Meta Ads Analyzer (stub) */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-gray-900/40 shadow-sm hover:shadow-lg transition-shadow duration-200 backdrop-blur">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">Meta/Facebook Ads Analyzer</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Simulated analyzer (free tier)</div>
              </div>
              <button onClick={runMetaAdsAnalyzer} disabled={maLoading}
                className={`rounded-md px-3 py-2 text-sm border ${maLoading ? 'opacity-60' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} border-gray-300 dark:border-gray-700 transition-colors`}>
                {maLoading ? 'Running…' : 'Run'}
              </button>
            </div>
            {maError && <div className="text-sm text-red-600 dark:text-red-400">{maError}</div>}
            {maLoading && !maData && (
              <div className="mt-3 grid grid-cols-2 gap-3 animate-pulse">
                <div className="h-16 rounded-md bg-gray-100 dark:bg-gray-800" />
                <div className="h-16 rounded-md bg-gray-100 dark:bg-gray-800" />
              </div>
            )}
            {maData && (
              <div className="mt-3 space-y-2 text-sm text-gray-800 dark:text-gray-200">
                <div><span className="font-semibold">URL:</span> {maData.url || '—'}</div>
                <div><span className="font-semibold">Status:</span> {maData.status}</div>
                <div><span className="font-semibold">Meta Pixel detected:</span> {maData.pixelDetected ? 'Yes' : 'No'}</div>
                <div className="font-semibold">Suggestions</div>
                <ul className="list-disc pl-5">{(maData.suggestions || []).map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
          </div>

          {/* Ads.txt Validator */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-gray-900/40 shadow-sm hover:shadow-lg transition-shadow duration-200 backdrop-blur">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">Ads.txt Validator</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Validate authorized sellers</div>
              </div>
              <button onClick={runAdsTxtValidator} disabled={atLoading}
                className={`rounded-md px-3 py-2 text-sm border ${atLoading ? 'opacity-60' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} border-gray-300 dark:border-gray-700 transition-colors`}>
                {atLoading ? 'Validating…' : 'Validate'}
              </button>
            </div>
            {atError && <div className="text-sm text-red-600 dark:text-red-400">{atError}</div>}
            {atLoading && !atData && (
              <div className="mt-3 grid grid-cols-3 gap-3 animate-pulse">
                <div className="h-14 rounded-md bg-gray-100 dark:bg-gray-800" />
                <div className="h-14 rounded-md bg-gray-100 dark:bg-gray-800" />
                <div className="h-14 rounded-md bg-gray-100 dark:bg-gray-800" />
              </div>
            )}
            {atData && (
              <div className="mt-3 space-y-2 text-sm text-gray-800 dark:text-gray-200">
                <div><span className="font-semibold">Status:</span> {atData.status}</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 p-2 text-emerald-800 dark:text-emerald-300 shadow-sm"><span className="font-semibold">Entries:</span> {atData.info?.entries?.length || 0}</div>
                  <div className="rounded-md bg-amber-50 dark:bg-amber-900/30 p-2 text-amber-800 dark:text-amber-300 shadow-sm"><span className="font-semibold">Warnings:</span> {atData.info?.warnings?.length || 0}</div>
                  <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-2 text-red-800 dark:text-red-300 shadow-sm"><span className="font-semibold">Errors:</span> {atData.info?.errors?.length || 0}</div>
                </div>
                <div className="max-h-40 overflow-auto rounded-md bg-gray-50 dark:bg-gray-900 p-2 text-xs whitespace-pre-wrap">
                  {atData.raw || ''}
                </div>
              </div>
            )}
          </div>

          {/* Network Detection */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/70 dark:bg-gray-900/40 shadow-sm hover:shadow-lg transition-shadow duration-200 backdrop-blur">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">Ad Network Detection</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Detect third-party networks</div>
              </div>
              <button onClick={runNetworkDetection} disabled={ndLoading}
                className={`rounded-md px-3 py-2 text-sm border ${ndLoading ? 'opacity-60' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} border-gray-300 dark:border-gray-700 transition-colors`}>
                {ndLoading ? 'Detecting…' : 'Detect'}
              </button>
            </div>
            {ndError && <div className="text-sm text-red-600 dark:text-red-400">{ndError}</div>}
            {ndLoading && !ndData && (
              <div className="mt-3 grid grid-cols-3 gap-3 animate-pulse">
                <div className="h-14 rounded-md bg-gray-100 dark:bg-gray-800" />
                <div className="h-14 rounded-md bg-gray-100 dark:bg-gray-800" />
                <div className="h-14 rounded-md bg-gray-100 dark:bg-gray-800" />
              </div>
            )}
            {ndData && (
              <div className="mt-3 space-y-2 text-sm text-gray-800 dark:text-gray-200">
                <div><span className="font-semibold">Requests captured:</span> {ndData.requestCount ?? 0}</div>
                {(ndData.networks || []).length ? (
                  <div className="flex flex-wrap gap-2">
                    {ndData.networks.map((n: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">{n}</span>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-600 dark:text-gray-400">No networks detected.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdToolsDashboard;
