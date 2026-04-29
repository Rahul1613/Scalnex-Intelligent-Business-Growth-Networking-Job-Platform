import React, { useState } from 'react';
import { Upload, MapPin, Target, Building2, TrendingUp, AlertCircle, Map, Loader2, Globe, Map as MapIcon, Navigation } from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';

interface GeoData {
  customers_count?: number;
  competitors_count?: number;
  competitors?: {name: string; distance_km: number; category: string; address?: string}[];
  density_per_sq_km?: number;
  opportunity_score?: number;
  competition_level?: string;
  best_area?: string;
  top_areas?: {name: string, count: number}[];
  map_url: string;
}

const GeoBusinessAnalyzerPage: React.FC = () => {
  const [mode, setMode] = useState<'competitor' | 'customer'>('competitor');
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState<number>(5);
  const [file, setFile] = useState<File | null>(null);
  
  // Custom Customer Filters
  const [country, setCountry] = useState('');
  const [stateName, setStateName] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GeoData | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
        setError('Please upload a valid CSV or Excel file.');
        setFile(null);
      } else {
        setError('');
        setFile(selectedFile);
      }
    }
  };

  const handleAnalyze = async () => {
    setError('');
    
    if (mode === 'competitor' && (!businessType || !location)) {
      setError('Please fill in business type and location for competitor analysis.');
      return;
    }
    if (mode === 'customer' && !file) {
      setError('Please upload a customer data file.');
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append('mode', mode);
    formData.append('radius', radius.toString());
    
    if (location) formData.append('location', location);
    if (businessType) formData.append('business_type', businessType);
    if (country) formData.append('country', country);
    if (stateName) formData.append('state', stateName);
    if (city) formData.append('city', city);
    if (area) formData.append('area', area);
    if (file) formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:5001/api/geo/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to analyze geo data');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm mt-4">
      {/* HEADER */}
      <div className="flex-none bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-5 z-10 flex flex-col sm:flex-row justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <MapIcon className="w-6 h-6 text-blue-500" />
             AI Geo Analyzer
           </h1>
           <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Discover high-opportunity zones using AI-powered geographic clustering and competitor density analysis.</p>
        </div>
        {/* TABS */}
        <div className="flex mt-4 sm:mt-0 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
           <button
             onClick={() => { setMode('competitor'); setResult(null); setError(''); }}
             className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'competitor' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
           >
              Competitor Analysis
           </button>
           <button
             onClick={() => { setMode('customer'); setResult(null); setError(''); }}
             className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'customer' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
           >
              Customer Analysis
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* LEFT PANEL: INPUTS */}
        <div className="w-full lg:w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-none overflow-y-auto z-10">
          <div className="p-6 space-y-6">
            
            {/* Competitor Inputs */}
            {mode === 'competitor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Business Type
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Retail, Grocery, Gym"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location Center
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Downtown Chicago"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Customer Inputs */}
            {mode === 'customer' && (
              <>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Customer Data (CSV/Excel) *
                  </label>
                  <div className="mt-1 flex justify-center px-4 pt-4 pb-4 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="flex flex-col items-center text-sm text-gray-600 dark:text-gray-300">
                        <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input type="file" accept=".csv,.xlsx" className="sr-only" onChange={handleFileChange} />
                        </label>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {file ? file.name : "CSV max 10MB"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                   <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Location Filters (Optional)</h3>
                   <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Country" className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500" value={country} onChange={(e) => setCountry(e.target.value)} />
                      <input type="text" placeholder="State" className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500" value={stateName} onChange={(e) => setStateName(e.target.value)} />
                      <input type="text" placeholder="City" className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500" value={city} onChange={(e) => setCity(e.target.value)} />
                      <input type="text" placeholder="Area" className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500" value={area} onChange={(e) => setArea(e.target.value)} />
                   </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Map Center (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. New York (for map focus)"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-blue-500 sm:text-sm"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Radius (Common) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Radius Filter
                </label>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">{radius} km</span>
              </div>
              <input
                type="range" min="5" max="100" step="1"
                aria-label="Radius filter in kilometers"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                 <span>5 km</span>
                 <span>100 km</span>
              </div>
            </div>

            {error && (
               <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded-md">
                 <div className="flex items-center text-sm text-red-700 dark:text-red-400">
                   <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                   <p>{error}</p>
                 </div>
               </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Generating Insights...
                </>
              ) : (
                `Analyze ${mode === 'competitor' ? 'Competitors' : 'Customers'}`
              )}
            </button>
          </div>
        </div>

        {/* CENTER PANEL: MAP */}
        <div className="flex-1 bg-gray-100 dark:bg-[#0a0a0a] relative">
          {!result && !loading ? (
            <div className="h-full flex items-center justify-center flex-col text-gray-400 dark:text-gray-600 p-6 text-center">
              <Globe className="w-20 h-20 mb-4 opacity-20" />
              <p className="text-lg font-medium opacity-80 mb-2">Ready for Analysis</p>
              <p className="text-sm max-w-sm">Configure your parameters on the left and hit Analyze to generate an interactive geographic visualization.</p>
            </div>
          ) : loading ? (
             <div className="h-full flex items-center justify-center flex-col text-gray-400">
                <Loader2 className="w-16 h-16 mb-4 animate-spin text-blue-500" />
                <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Processing geospatial data...</p>
             </div>
          ) : (
            <iframe 
               src={result?.map_url} 
               className="w-full h-full border-none"
               title="Geo Analysis Map"
            />
          )}
        </div>

        {/* RIGHT PANEL: INSIGHTS */}
        <div className="w-full lg:w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-none overflow-y-auto shadow-sm z-10">
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
               <Target className="w-5 h-5 text-indigo-500" />
               Overview Insights
            </h2>
            
            {!result ? (
               <div className="text-center text-gray-400 mt-10 text-sm">
                  Run analysis to generate AI insights
               </div>
            ) : (
                <div className="space-y-6">
                  
                  {mode === 'competitor' && (
                     <>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-xl p-4 text-center">
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Found</p>
                              <p className="text-3xl font-black text-gray-900 dark:text-white">{result.competitors_count}</p>
                           </div>
                           <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-xl p-4 text-center">
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Density/km²</p>
                              <p className="text-3xl font-black text-gray-900 dark:text-white">{result.density_per_sq_km}</p>
                           </div>
                        </div>

                        <div className={`p-4 rounded-xl border ${
                           result.competition_level === 'High Competition' ? 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800' :
                           result.competition_level === 'Medium Competition' ? 'bg-yellow-50 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800' :
                           'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800'
                        }`}>
                           <p className="text-sm font-semibold opacity-80 mb-1">Competition Level</p>
                           <p className={`text-xl font-bold ${
                              result.competition_level === 'High Competition' ? 'text-red-700 dark:text-red-400' :
                              result.competition_level === 'Medium Competition' ? 'text-yellow-700 dark:text-yellow-400' :
                              'text-green-700 dark:text-green-400'
                           }`}>{result.competition_level}</p>
                        </div>

                        {result.competitors && result.competitors.length > 0 && (
                          <div className="mt-4">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                              Exact Competitor Matches
                            </h3>
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                              {result.competitors.map((comp, idx) => (
                                <div key={`${comp.name}-${idx}`} className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={comp.name}>{comp.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {comp.category} • {comp.distance_km} km
                                  </p>
                                  {comp.address && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={comp.address}>
                                      {comp.address}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                     </>
                  )}

                  {mode === 'customer' && (
                     <>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 text-center">
                              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Customers</p>
                              <p className="text-3xl font-black text-blue-700 dark:text-blue-300">{result.customers_count}</p>
                           </div>
                           <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4 text-center">
                              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Density/km²</p>
                              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{result.density_per_sq_km}</p>
                           </div>
                        </div>

                        {result.best_area && result.best_area !== 'Data insufficient' && (
                           <div className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                              <div className="flex items-start gap-3">
                                 <Navigation className="w-5 h-5 text-indigo-500 mt-0.5" />
                                 <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Optimal Focus Area</h3>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{result.best_area}</p>
                                 </div>
                              </div>
                           </div>
                        )}

                        {result.top_areas && result.top_areas.length > 0 && (
                           <div className="mt-4">
                              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Area Distribution</h3>
                              <div className="space-y-2">
                                 {result.top_areas.map((area, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                       <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[150px]" title={area.name}>{area.name}</span>
                                       <span className="font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-700 px-2 py-0.5 rounded shadow-sm">{area.count}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}
                     </>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                     <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">AI Recommendation</h3>
                     <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                        {mode === 'competitor' ? 
                           "Based on the radius, high competition implies you need strong differentiators. Low competition areas are ripe for market capture." :
                           "Focus marketing and sales efforts on the top-ranking areas to maximize ROI. Consider targeted localized ads matching these geo hotspots."
                        }
                     </p>
                  </div>

                </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default GeoBusinessAnalyzerPage;
