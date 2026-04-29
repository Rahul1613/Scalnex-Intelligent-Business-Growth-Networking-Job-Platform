import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Brain, Activity, X, Send, Loader, Zap, Eye, Clock } from 'lucide-react';

// Website Section Component - Visual webpage elements
function WebsiteSection({ 
  section, 
  performance, 
  issues, 
  isLoading, 
  delay 
}: { 
  section: {
    type: 'header' | 'hero' | 'content' | 'card' | 'footer';
    content: string;
    style: React.CSSProperties;
  };
  performance: number;
  issues: string[];
  isLoading: boolean;
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Animate loading progress based on performance
        const progressInterval = setInterval(() => {
          setLoadProgress(prev => {
            const increment = performance < 50 ? 5 : performance < 80 ? 10 : 20;
            const newProgress = prev + increment;
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return newProgress;
          });
        }, 100);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, delay, performance]);

  // Performance-based behavior
  const getSectionBehavior = () => {
    if (!isVisible) return {};
    
    if (performance < 50) {
      // Poor performance - jittery, unstable
      return {
        animation: 'shake 0.5s infinite',
        transform: `translateY(${Math.sin(Date.now() / 200) * 2}px)`,
        opacity: loadProgress / 100
      };
    } else if (performance < 80) {
      // Medium performance - subtle issues
      return {
        animation: 'pulse 2s infinite',
        opacity: loadProgress / 100
      };
    }
    // Good performance - stable
    return {
      opacity: loadProgress / 100
    };
  };

  // Issue indicators
  const hasIssues = issues.length > 0;
  const issueColor = performance >= 80 ? 'border-green-500' : 
                   performance >= 60 ? 'border-yellow-500' : 
                   'border-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        y: isVisible ? 0 : 20 
      }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      className="relative"
      style={getSectionBehavior()}
    >
      {/* Section Content */}
      <div 
        className={`
          ${section.type === 'header' ? 'bg-gray-900' : ''}
          ${section.type === 'hero' ? 'bg-gradient-to-br from-blue-600 to-purple-600' : ''}
          ${section.type === 'content' ? 'bg-white text-gray-800' : ''}
          ${section.type === 'card' ? 'bg-white text-gray-800 border border-gray-200' : ''}
          ${section.type === 'footer' ? 'bg-gray-800' : ''}
          rounded-lg p-6 border-2 ${issueColor}
          ${hasIssues ? 'shadow-lg shadow-red-500/20' : 'shadow-lg'}
          transition-all duration-300
        `}
        style={section.style}
      >
        {/* Loading overlay */}
        {isLoading && loadProgress < 100 && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <div className="text-white text-sm">
              Loading... {Math.round(loadProgress)}%
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className={section.type === 'content' || section.type === 'card' ? 'text-gray-800' : 'text-white'}>
          {section.type === 'header' && (
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{section.content}</h1>
              <nav className="flex space-x-4">
                <span className="hover:text-cyan-400 cursor-pointer">Home</span>
                <span className="hover:text-cyan-400 cursor-pointer">About</span>
                <span className="hover:text-cyan-400 cursor-pointer">Services</span>
                <span className="hover:text-cyan-400 cursor-pointer">Contact</span>
              </nav>
            </div>
          )}
          
          {section.type === 'hero' && (
            <div className="text-center py-12">
              <h2 className="text-4xl font-bold mb-4">{section.content}</h2>
              <p className="text-xl mb-8 opacity-90">Transform your business with our solutions</p>
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Started
              </button>
            </div>
          )}
          
          {section.type === 'content' && (
            <div>
              <h3 className="text-xl font-semibold mb-3">{section.content}</h3>
              <p className="text-gray-600 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          )}
          
          {section.type === 'card' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">{section.content}</h3>
              <p className="text-gray-600 text-sm">Professional service with guaranteed results</p>
            </div>
          )}
          
          {section.type === 'footer' && (
            <div className="text-center">
              <p className="text-sm opacity-75">{section.content}</p>
              <div className="flex justify-center space-x-4 mt-4 text-xs opacity-60">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Contact</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Issue Indicators */}
        {hasIssues && isVisible && (
          <div className="absolute -top-2 -right-2">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Website Preview Container
function WebsitePreview({ websiteData, isLoading, isSimulating }: { 
  websiteData: any; 
  isLoading: boolean; 
  isSimulating: boolean; 
}) {
  const [simulationProgress, setSimulationProgress] = useState(0);

  useEffect(() => {
    if (isSimulating) {
      const interval = setInterval(() => {
        setSimulationProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
      
      return () => clearInterval(interval);
    } else {
      setSimulationProgress(0);
    }
  }, [isSimulating]);

  if (!websiteData) return null;

  const sections = [
    {
      type: 'header' as const,
      content: websiteData.header || "Welcome to " + websiteData.url,
      style: { marginBottom: '1rem' },
      performance: websiteData.headerPerformance || 70,
      issues: websiteData.headerIssues || []
    },
    {
      type: 'hero' as const,
      content: websiteData.hero || "Main Hero Section",
      style: { marginBottom: '2rem' },
      performance: websiteData.heroPerformance || 60,
      issues: websiteData.heroIssues || []
    },
    {
      type: 'content' as const,
      content: websiteData.content1 || "Content Area 1",
      style: { marginBottom: '1rem' },
      performance: websiteData.contentPerformance || 80,
      issues: websiteData.contentIssues || []
    },
    {
      type: 'card' as const,
      content: websiteData.card1 || "Service Card 1",
      style: { marginBottom: '1rem' },
      performance: websiteData.cardPerformance || 85,
      issues: websiteData.cardIssues || []
    },
    {
      type: 'card' as const,
      content: websiteData.card2 || "Service Card 2",
      style: { marginBottom: '1rem' },
      performance: websiteData.cardPerformance || 90,
      issues: websiteData.cardIssues || []
    },
    {
      type: 'content' as const,
      content: websiteData.content2 || "Content Area 2",
      style: { marginBottom: '2rem' },
      performance: websiteData.contentPerformance || 75,
      issues: websiteData.contentIssues || []
    },
    {
      type: 'footer' as const,
      content: websiteData.footer || "© 2024 " + websiteData.url,
      style: {},
      performance: websiteData.footerPerformance || 65,
      issues: websiteData.footerIssues || []
    }
  ];

  return (
    <div className="relative">
      {/* Simulation Overlay */}
      {isSimulating && (
        <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
          <div className="text-center">
            <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-white font-semibold mb-2">Simulating Future</h3>
            <div className="w-64 bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${simulationProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Website Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
        {sections.map((section, index) => (
          <WebsiteSection
            key={index}
            section={section}
            performance={section.performance}
            issues={section.issues}
            isLoading={isLoading}
            delay={index * 300} // Staggered loading
          />
        ))}
      </div>
    </div>
  );
}

// Minimal Side Panel
function MinimalSidePanel({ data, isVisible }: { data: any; isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="absolute top-20 right-4 z-50"
        >
          <div className="bg-black/80 backdrop-blur-md rounded-lg p-4 border border-cyan-500/30 w-64">
            <h3 className="text-cyan-400 font-semibold mb-3 text-sm">Live Analysis</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Performance</span>
                <span className={data.performance >= 80 ? 'text-green-400' : 'text-yellow-400'}>
                  {data.performance}%
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>SEO</span>
                <span className={data.seo >= 80 ? 'text-green-400' : 'text-yellow-400'}>
                  {data.seo}%
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>UX</span>
                <span className={data.ux >= 80 ? 'text-green-400' : 'text-yellow-400'}>
                  {data.ux}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// AI Chat Interface
function AIChatInterface({ 
  onQuestion, 
  isVisible 
}: { 
  onQuestion: (question: string) => void; 
  isVisible: boolean; 
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-black/80 backdrop-blur-md rounded-lg p-4 border border-cyan-500/30 w-96">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-cyan-400" />
              <h3 className="text-cyan-400 font-semibold text-sm">Future Simulation</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="What if I improve performance?"
                className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:border-cyan-500 focus:outline-none text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    onQuestion((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  onQuestion(input.value);
                  input.value = '';
                }}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Try: "What if I improve speed?" or "How will adding content help?"
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Main Component
const VisualWebsitePreview: React.FC = () => {
  const [isEntering, setIsEntering] = useState(true);
  const [url, setUrl] = useState('');
  const [websiteData, setWebsiteData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [simulationQuestion, setSimulationQuestion] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const analyzeWebsite = async () => {
    if (!url) return;
    
    setIsLoading(true);
    setShowPanel(true);
    
    try {
      // Simulate website analysis
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const mockData = {
        url: url,
        header: "Welcome to " + new URL(url).hostname,
        hero: "Transform Your Business with Our Solutions",
        content1: "Professional Services",
        content2: "Expert Solutions",
        card1: "Web Development",
        card2: "Digital Marketing",
        footer: "© 2024 " + new URL(url).hostname,
        performance: Math.floor(Math.random() * 40) + 60,
        seo: Math.floor(Math.random() * 40) + 60,
        ux: Math.floor(Math.random() * 40) + 60,
        headerPerformance: Math.floor(Math.random() * 40) + 60,
        heroPerformance: Math.floor(Math.random() * 40) + 50,
        contentPerformance: Math.floor(Math.random() * 40) + 70,
        cardPerformance: Math.floor(Math.random() * 40) + 80,
        footerPerformance: Math.floor(Math.random() * 40) + 60,
        headerIssues: ["Missing H1 tag"],
        heroIssues: ["Large image size"],
        contentIssues: [],
        cardIssues: [],
        footerIssues: ["Missing links"]
      };
      
      setWebsiteData(mockData);
      setShowChat(true);
      
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulationQuestion = async (question: string) => {
    setSimulationQuestion(question);
    setIsSimulating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update website data based on simulation
      if (question.toLowerCase().includes('speed') || question.toLowerCase().includes('performance')) {
        setWebsiteData(prev => ({
          ...prev,
          performance: Math.min(100, prev.performance + 25),
          headerPerformance: Math.min(100, prev.headerPerformance + 20),
          heroPerformance: Math.min(100, prev.heroPerformance + 30),
          headerIssues: [],
          heroIssues: []
        }));
      } else if (question.toLowerCase().includes('content')) {
        setWebsiteData(prev => ({
          ...prev,
          seo: Math.min(100, prev.seo + 20),
          contentPerformance: Math.min(100, prev.contentPerformance + 25)
        }));
      } else if (question.toLowerCase().includes('ux') || question.toLowerCase().includes('design')) {
        setWebsiteData(prev => ({
          ...prev,
          ux: Math.min(100, prev.ux + 30),
          cardPerformance: Math.min(100, prev.cardPerformance + 25)
        }));
      }
      
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
      setSimulationQuestion('');
    }
  };

  const handleExit = () => {
    window.close();
    window.location.href = '/dashboard';
  };

  if (isEntering) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center"
        >
          <Globe className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl font-bold text-cyan-400 mb-4">Website Simulation Verse</h1>
          <p className="text-cyan-200 mb-8">Loading visual website experience...</p>
          <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-400"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3 }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Main Website Preview - THE MAIN VISUAL ELEMENT */}
      <div className="flex items-center justify-center min-h-screen p-8">
        {websiteData ? (
          <WebsitePreview 
            websiteData={websiteData} 
            isLoading={isLoading}
            isSimulating={isSimulating}
          />
        ) : (
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <Globe className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Enter Website URL</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 bg-white/20 text-white px-4 py-3 rounded border border-white/30 focus:border-cyan-400 focus:outline-none placeholder-white/50"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      analyzeWebsite();
                    }
                  }}
                />
                <button
                  onClick={analyzeWebsite}
                  disabled={isLoading}
                  className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-6 py-3 rounded flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Loading
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
              <p className="text-white/70 text-sm">
                Watch how your website loads and behaves in real-time
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="absolute top-4 left-4 text-cyan-400 font-mono text-sm bg-black/60 p-3 rounded">
        <div>WSV - Visual Website Preview</div>
        <div className="text-xs text-cyan-300 mt-1">
          {websiteData ? 'Website Loaded' : 'Enter URL to begin'}
        </div>
      </div>

      {/* Exit */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={handleExit}
          className="bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Exit
        </button>
      </div>

      {/* Instructions */}
      {!websiteData && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-cyan-300 text-sm mb-2">
            Enter a website URL to see it load and behave in real-time
          </div>
          <div className="text-xs text-cyan-400">
            Watch performance issues as visual behavior • Ask AI to simulate improvements
          </div>
        </div>
      )}

      {/* Controls Help */}
      {websiteData && !isSimulating && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-cyan-300 text-sm mb-1">
            Watch website sections load based on performance
          </div>
          <div className="text-xs text-cyan-400">
            Ask AI: "What if I improve speed?" or "How will adding content help?"
          </div>
        </div>
      )}

      {/* AI Chat Interface */}
      <AIChatInterface onQuestion={handleSimulationQuestion} isVisible={showChat} />

      {/* Minimal Side Panel */}
      <MinimalSidePanel data={websiteData || {}} isVisible={showPanel} />
    </div>
  );
};

export default VisualWebsitePreview;
