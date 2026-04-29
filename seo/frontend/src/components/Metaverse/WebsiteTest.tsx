import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, X, Zap } from 'lucide-react';

const WebsiteTest: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [websiteData, setWebsiteData] = useState(null);

  const analyzeWebsite = async () => {
    if (!url) return;
    
    setIsAnalyzing(true);
    
    try {
      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setWebsiteData({
        url: url,
        performance: 75,
        seo: 80,
        ux: 70,
        header: "Welcome to " + url,
        hero: "Main hero section",
        content: "Content area"
      });
      
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExit = () => {
    window.close();
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Globe className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">Website Simulation Verse</h1>
          <p className="text-cyan-200">Test Mode - Basic Functionality</p>
        </motion.div>

        {!websiteData ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Enter Website URL</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
              />
              <button
                onClick={analyzeWebsite}
                disabled={isAnalyzing}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Analyze
                  </>
                )}
              </button>
            </div>
            
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-cyan-300"
              >
                Analyzing website structure...
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4 text-green-400">Analysis Complete!</h2>
            <div className="space-y-2 text-left">
              <p><strong>URL:</strong> {websiteData.url}</p>
              <p><strong>Performance:</strong> {websiteData.performance}%</p>
              <p><strong>SEO:</strong> {websiteData.seo}%</p>
              <p><strong>UX:</strong> {websiteData.ux}%</p>
              <p><strong>Header:</strong> {websiteData.header}</p>
              <p><strong>Hero:</strong> {websiteData.hero}</p>
              <p><strong>Content:</strong> {websiteData.content}</p>
            </div>
            
            <button
              onClick={() => setWebsiteData(null)}
              className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Analyze Another Website
            </button>
          </motion.div>
        )}

        <button
          onClick={handleExit}
          className="mt-8 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 mx-auto"
        >
          <X className="w-4 h-4" />
          Exit
        </button>
      </div>
    </div>
  );
};

export default WebsiteTest;
