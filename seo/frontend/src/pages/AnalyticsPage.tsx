import React, { useState } from 'react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, ScatterChart as RechartsScatterChart, Scatter
} from 'recharts';
import {
  Upload, FileText, Activity, AlertCircle, Database, Zap,
  Filter, Download, Plus, X, BarChart3, LineChart, Target,
  RefreshCw, CheckCircle2, Shield, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/Layout/DashboardLayout';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];


interface ChartConfig {
  id: number;
  title: string;
  type: 'area' | 'bar' | 'pie' | 'scatter' | 'bar_vertical' | 'line';
  xKey?: string;
  dataKey: string;
  nameKey?: string; // For pie
  data: any[];
}



const AnalyticsPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [biResults, setBiResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // BI Builder State
  const [selectedX, setSelectedX] = useState('');
  const [selectedY, setSelectedY] = useState('');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  const [limit, setLimit] = useState(10);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:5001/api/upload-csv', { method: 'POST', body: formData });
      const data = await res.json();

      if (res.ok) {
        setAnalysis(data.insights);
        setBiResults(data.bi_results);
        // Default chart builder selections
        // Auto-select best columns for visualization
        if (data.bi_results.columns) {
          const numericCols = data.bi_results.columns.filter((c: any) => c.type.includes('int') || c.type.includes('float'));
          const catCols = data.bi_results.columns.filter((c: any) => c.type.includes('object') || c.type.includes('string'));

          if (catCols.length > 0) setSelectedX(catCols[0].name);
          else if (data.bi_results.columns.length > 0) setSelectedX(data.bi_results.columns[0].name);

          if (numericCols.length > 0) setSelectedY(numericCols[0].name);
          else if (data.bi_results.columns.length > 1) setSelectedY(data.bi_results.columns[1].name);
        }
      } else {
        setError(data.error || "Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const renderChart = (chart: ChartConfig) => {
    switch (chart.type) {
      case 'area':
        return (
          <AreaChart data={chart.data}>
            <defs>
              <linearGradient id={`color${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[chart.id % COLORS.length]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={COLORS[chart.id % COLORS.length]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey={chart.xKey} stroke="#888" fontSize={12} tickFormatter={(val) => val.toString().substring(0, 10)} />
            <YAxis stroke="#888" fontSize={12} />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
            <Area type="monotone" dataKey={chart.dataKey} stroke={COLORS[chart.id % COLORS.length]} fill={`url(#color${chart.id})`} fillOpacity={1} />
          </AreaChart>
        );
      case 'bar':
      case 'bar_vertical':
        return (
          <BarChart data={chart.data} layout={chart.type === 'bar_vertical' ? 'vertical' : 'horizontal'}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            {chart.type === 'bar_vertical' ? (
              <>
                <XAxis type="number" stroke="#888" />
                <YAxis dataKey={chart.xKey} type="category" width={100} stroke="#888" fontSize={12} />
              </>
            ) : (
              <>
                <XAxis dataKey={chart.xKey} stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
              </>
            )}

            <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
            <Bar dataKey={chart.dataKey} radius={[4, 4, 0, 0]}>
              {chart.data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chart.data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey={chart.dataKey}
              nameKey={chart.nameKey}
            >
              {chart.data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
          </PieChart>
        );
      case 'line':
        return (
          <AreaChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey={chart.xKey} stroke="#888" fontSize={12} />
            <YAxis stroke="#888" fontSize={12} />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
            <Area type="monotone" dataKey={chart.dataKey} stroke={COLORS[chart.id % COLORS.length]} fill="transparent" />
          </AreaChart>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsScatterChart>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey={chart.xKey} type="category" name={chart.xKey} stroke="#888" fontSize={12} />
              <YAxis dataKey={chart.dataKey} type="number" name={chart.dataKey} stroke="#888" fontSize={12} />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
              <Scatter name={chart.title} data={chart.data} fill="#8884d8">
                {chart.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Scatter>
            </RechartsScatterChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl mr-4 shadow-inner">
                <BarChart3 className="w-8 h-8 text-primary-600" />
              </div>
              BI Suite & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-lg">
              Enterprise-grade business intelligence with anomaly detection,
              trend forecasting, and automatic data cleaning.
            </p>
          </motion.div>
          {!analysis && (
            <div className="flex gap-3">
              {/* Time-Travel Simulator CTA (Legacy) */}
              <a
                href="/analytics/time-travel-simulator"
                className="px-6 py-3 bg-white/10 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl flex items-center transition-all border border-gray-200 dark:border-gray-700 font-bold hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span className="mr-2 text-xl">🌐</span>
                <span>Time-Travel</span>
              </a>

              <label
                className={`cursor-pointer px-6 py-3 rounded-2xl flex items-center transition-all shadow-lg font-bold border-2 ${file ? 'bg-white text-gray-900 border-gray-200' : 'bg-primary-600 border-primary-600 text-white hover:bg-primary-700'}`}
              >
                <Plus className="w-5 h-5 mr-2" />
                <span>{file ? 'Change Dataset' : 'Upload Data'}</span>
                <input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileChange} />
              </label>
              {file && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-2xl flex items-center transition-all shadow-lg font-bold shadow-green-200 dark:shadow-none disabled:opacity-50"
                >
                  {uploading ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Zap className="w-5 h-5 mr-2" />}
                  {uploading ? 'Analyzing...' : 'Execute AI Audit'}
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-8 flex items-center border border-red-100 dark:border-red-800"
          >
            <AlertCircle className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">{error}</span>
          </motion.div>
        )}

        {/* Initial Empty State / Upload Zone */}
        {!analysis && !uploading && (
          <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            whileHover={{ scale: 1.01 }}
            className={`border-4 border-dashed rounded-[2.5rem] p-24 text-center transition-all duration-300 ${isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 scale-102'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50'
              }`}
          >
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8 transition-colors ${isDragging ? 'bg-primary-200' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <Upload className={`w-16 h-16 ${isDragging ? 'text-primary-600' : 'text-gray-300 dark:text-gray-600'}`} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
              Drag & Drop Business Data
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-10 text-lg leading-relaxed">
              Analyze your CSV or Excel files instantly. We'll handle the cleaning,
              segmentation, and forecasting automatically.
            </p>
            {file ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 bg-primary-50 dark:bg-primary-900/20 px-6 py-3 rounded-2xl border border-primary-100 dark:border-primary-800"
              >
                <FileText className="w-5 h-5 text-primary-600" />
                <span className="text-primary-700 dark:text-primary-300 font-bold">{file.name}</span>
                <button onClick={() => setFile(null)} className="p-1 hover:bg-primary-100 rounded-full">
                  <X className="w-4 h-4 text-primary-400" />
                </button>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center gap-8 text-sm font-bold text-gray-400 uppercase tracking-widest">
                <span>Supports CSV</span>
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                <span>Excel</span>
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                <span>JSON</span>
              </div>
            )}
          </motion.div>
        )}

        {uploading && (
          <div className="py-32 text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-primary-100 dark:border-gray-800" />
              <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Database className="w-8 h-8 text-primary-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Architecting Your Dashboard</h3>
            <p className="text-gray-500 text-lg">Our AI is running statistical models and detecting anomalies...</p>
          </div>
        )}

        {/* ANALYSIS RESULTS */}
        {analysis && biResults && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">Audit Completed: {analysis.filename}</h2>
                  <p className="text-sm text-gray-500 font-medium">Precision: High | Models: Statistics, KMeans, Regression</p>
                </div>
              </div>
              <div className="flex gap-3">
                <a
                  href={analysis.pdf_url || '#'}
                  download={!!analysis.pdf_url}
                  className={`px-6 py-3 rounded-2xl flex items-center text-sm font-black transition-all ${analysis.pdf_url
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-200 dark:shadow-none'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Insights
                </a>
                <button onClick={() => { setAnalysis(null); setBiResults(null); setFile(null); }} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-all">
                  <X className="w-4 h-4" /> Reset
                </button>
              </div>
            </div>

            {/* 1. Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Total Records", value: biResults.summary.rows, icon: Database, color: "blue" },
                { title: "Anomalies", value: analysis.summary_cards.find((c: any) => c.title === "Anomalies Detected")?.value || 0, icon: AlertCircle, color: "red" },
                { title: "Correlations", value: biResults.correlations.length, icon: Zap, color: "yellow" },
                { title: "Health", value: `${Math.max(0, 100 - (biResults.data_health.duplicates * 5) - (biResults.data_health.missing * 2))}%`, icon: Shield, color: "green" }
              ].map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 group hover:border-primary-500 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 bg-${card.color}-50 dark:bg-${card.color}-900/20 rounded-2xl`}>
                      <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Live Metric</span>
                  </div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{card.title}</p>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white">{card.value}</h3>
                </motion.div>
              ))}
            </div>

            {/* 2. AUTO-GENERATED CHARTS - MAIN FOCUS */}
            {biResults.auto_charts && biResults.auto_charts.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <Sparkles className="w-8 h-8 text-primary-600 animate-pulse" />
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                      AI-Generated Insights
                    </h3>
                    <p className="text-gray-500 mt-1">
                      Automatically detected and visualized the most important patterns in your data.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {biResults.auto_charts.map((chart: any, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl hover:border-primary-500 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{chart.title}</h4>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      </div>
                      <div className="h-[280px] w-full bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          {renderChart(chart)}
                        </ResponsiveContainer>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. DYNAMIC CHART BUILDER */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl mt-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <Filter className="w-7 h-7 text-primary-600" />
                    Interactive BI Builder
                  </h3>
                  <p className="text-gray-500 mt-1">Map any dimension to visualize complex correlations.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
                    {[
                      { id: 'area', icon: Activity },
                      { id: 'bar', icon: BarChart3 },
                      { id: 'line', icon: LineChart },
                      { id: 'scatter', icon: Target }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setChartType(t.id as any)}
                        className={`p-2 rounded-lg transition-all ${chartType === t.id ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-gray-900'}`}
                      >
                        <t.icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                  <select
                    value={selectedX}
                    onChange={(e) => setSelectedX(e.target.value)}
                    className="bg-transparent text-sm font-bold text-gray-700 dark:text-gray-300 outline-none border-r border-gray-200 px-3 py-1"
                  >
                    <option value="" disabled>Select X-Axis</option>
                    {biResults.columns?.map((col: any) => (
                      <option key={col.name} value={col.name}>{col.name} ({col.type.includes('int') || col.type.includes('float') ? '123' : 'ABC'})</option>
                    ))}
                  </select>
                  <select
                    value={selectedY}
                    onChange={(e) => setSelectedY(e.target.value)}
                    className="bg-transparent text-sm font-bold text-gray-700 dark:text-gray-300 outline-none px-3 py-1"
                  >
                    <option value="" disabled>Select Y-Axis</option>
                    {biResults.columns?.map((col: any) => (
                      <option key={col.name} value={col.name}>{col.name}</option>
                    ))}
                  </select>
                  <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="bg-transparent text-xs font-black text-gray-400 outline-none px-3"
                  >
                    <option value={10}>Top 10</option>
                    <option value={50}>Top 50</option>
                    <option value={100}>Top 100</option>
                    <option value={500}>Top 500</option>
                    <option value={1000}>Top 1000</option>
                  </select>
                </div>
              </div>

              <div className="h-[450px] w-full bg-gray-50/50 dark:bg-gray-900/20 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800">
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart({
                    id: 99,
                    title: 'Dynamic BI View',
                    type: chartType as any,
                    dataKey: selectedY,
                    xKey: selectedX,
                    data: biResults.raw_data?.slice(0, limit) || []
                  })}
                </ResponsiveContainer>
              </div>
            </div>
            {/* 5. DATA QUALITY INSIGHTS */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 rounded-[2.5rem] border border-green-100 dark:border-green-800 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl">
                  <Shield className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-gray-900 dark:text-white">Data Quality Score</h4>
                  <p className="text-gray-600 dark:text-gray-400">Overall health and integrity metrics</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-green-100 dark:border-gray-700">
                  <p className="text-sm font-bold text-gray-500 mb-2">Missing Values</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">{biResults.data_health.missing}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-green-100 dark:border-gray-700">
                  <p className="text-sm font-bold text-gray-500 mb-2">Duplicates</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">{biResults.data_health.duplicates}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-green-100 dark:border-gray-700">
                  <p className="text-sm font-bold text-gray-500 mb-2">Quality Score</p>
                  <p className="text-3xl font-black text-green-600">{Math.max(0, 100 - (biResults.data_health.duplicates * 5) - (biResults.data_health.missing * 2))}%</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </DashboardLayout >
  );
};

export default AnalyticsPage;
