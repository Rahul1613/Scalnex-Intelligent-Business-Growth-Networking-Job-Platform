import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Brain, Activity, X, Send, Loader, Zap, Eye, Clock, Play, Pause, RotateCcw } from 'lucide-react';

// Website Section with Time-Based Behavior
function TimeBasedSection({ 
  section, 
  performance, 
  issues, 
  timeSpeed,
  isSimulating,
  simulationProgress 
}: { 
  section: {
    type: 'header' | 'hero' | 'content' | 'card' | 'footer';
    content: string;
    style: React.CSSProperties;
  };
  performance: number;
  issues: string[];
  timeSpeed: number;
  isSimulating: boolean;
  simulationProgress: number;
}) {
  const [loadTime, setLoadTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [layoutShift, setLayoutShift] = useState(0);
  const [scrollJank, setScrollJank] = useState(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Continuous time-based behavior
    const animate = () => {
      setLoadTime(prev => {
        const newTime = prev + (0.016 * timeSpeed); // 60fps * timeSpeed
        
        // Loading behavior based on performance
        const loadDelay = performance < 50 ? 3 : performance < 80 ? 1.5 : 0.5;
        setIsLoaded(newTime >= loadDelay);
        
        return newTime;
      });

      // Layout shifts for poor performance
      if (performance < 70) {
        setLayoutShift(prev => {
          const shift = Math.sin(Date.now() / 1000) * 2;
          return prev + (shift - prev) * 0.1;
        });
      }

      // Scroll jank for poor UX
      if (performance < 60) {
        setScrollJank(prev => {
          const jank = Math.sin(Date.now() / 500) * 3;
          return prev + (jank - prev) * 0.1;
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [timeSpeed, performance]);

  // Simulation improvements
  const getSimulationStyle = () => {
    if (!isSimulating) return {};
    
    const improvementFactor = simulationProgress / 100;
    
    return {
      transform: `translateY(${layoutShift * (1 - improvementFactor)}px) translateX(${scrollJank * (1 - improvementFactor)}px)`,
      transition: 'all 0.3s ease-out'
    };
  };

  // Performance-based visual behavior
  const getPerformanceBehavior = () => {
    if (!isLoaded) return { opacity: 0 };
    
    let behavior = {};
    
    if (performance < 50) {
      // Poor performance - continuous jitter
      behavior = {
        animation: 'shake 0.5s infinite',
        filter: 'blur(0.5px)',
        transform: `translateY(${layoutShift}px) translateX(${scrollJank}px)`
      };
    } else if (performance < 80) {
      // Medium performance - subtle issues
      behavior = {
        animation: 'pulse 2s infinite',
        transform: `translateY(${layoutShift * 0.5}px)`
      };
    }
    // Good performance - stable
    
    return behavior;
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
        opacity: isLoaded ? 1 : 0, 
        y: isLoaded ? 0 : 20 
      }}
      style={{ ...getPerformanceBehavior(), ...getSimulationStyle() }}
      className="relative"
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
          relative overflow-hidden
        `}
        style={section.style}
      >
        {/* Loading overlay with progress */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center z-10">
            <div className="text-white text-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <div className="text-sm">Loading... {Math.round((loadTime / 3) * 100)}%</div>
            </div>
          </div>
        )}

        {/* Layout shift indicator */}
        {isLoaded && layoutShift > 0.5 && (
          <div className="absolute inset-0 border-2 border-red-500 rounded-lg pointer-events-none animate-pulse"></div>
        )}

        {/* Content */}
        <div className={section.type === 'content' || section.type === 'card' ? 'text-gray-800' : 'text-white'}>
          {section.type === 'header' && (
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{section.content}</h1>
              <nav className="flex space-x-4">
                <span className="hover:text-cyan-400 cursor-pointer transition-colors">Home</span>
                <span className="hover:text-cyan-400 cursor-pointer transition-colors">About</span>
                <span className="hover:text-cyan-400 cursor-pointer transition-colors">Services</span>
                <span className="hover:text-cyan-400 cursor-pointer transition-colors">Contact</span>
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
              <div className="mt-4 flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-500">Loading content...</span>
              </div>
            </div>
          )}
          
          {section.type === 'card' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">{section.content}</h3>
              <p className="text-gray-600 text-sm">Professional service with guaranteed results</p>
              <div className="mt-3 flex justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
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
        {hasIssues && isLoaded && (
          <div className="absolute -top-2 -right-2">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
        )}

        {/* Performance indicator */}
        {isLoaded && (
          <div className="absolute top-2 left-2">
            <div className={`w-3 h-3 rounded-full ${
              performance >= 80 ? 'bg-green-500' : 
              performance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Time-Based Website Simulation
function TimeBasedWebsite({ websiteData, timeSpeed, isSimulating, simulationProgress }: { 
  websiteData: any; 
  timeSpeed: number;
  isSimulating: boolean;
  simulationProgress: number;
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [engagementMetrics, setEngagementMetrics] = useState({
    visitors: 0,
    bounceRate: 100,
    conversions: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(prev => prev + timeSpeed);
      
      // Update engagement metrics over time
      setEngagementMetrics(prev => {
        const basePerformance = websiteData?.performance || 50;
        const growthRate = basePerformance / 100;
        
        return {
          visitors: Math.floor(prev.visitors + (growthRate * 10 * timeSpeed)),
          bounceRate: Math.max(20, prev.bounceRate - (growthRate * 2 * timeSpeed)),
          conversions: Math.floor(prev.conversions + (growthRate * 2 * timeSpeed))
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeSpeed, websiteData?.performance]);

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
      {/* Time Display */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-lg p-3 border border-cyan-500/30">
        <div className="text-cyan-400 font-semibold text-sm">Time Simulation</div>
        <div className="text-cyan-200 text-xs mt-1">Day {Math.floor(currentTime / 24)}, {Math.floor(currentTime % 24)}:00</div>
        <div className="text-xs text-cyan-300 mt-1">Speed: {timeSpeed}x</div>
      </div>

      {/* Engagement Metrics */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-lg p-3 border border-cyan-500/30">
        <div className="text-cyan-400 font-semibold text-sm">Live Metrics</div>
        <div className="text-cyan-200 text-xs mt-1">Visitors: {engagementMetrics.visitors}</div>
        <div className="text-cyan-200 text-xs">Bounce Rate: {engagementMetrics.bounceRate}%</div>
        <div className="text-cyan-200 text-xs">Conversions: {engagementMetrics.conversions}</div>
      </div>

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
            <div className="text-white text-sm mt-2">
              {simulationProgress < 50 ? 'Rewinding timeline...' : 
               simulationProgress < 80 ? 'Recalculating...' : 'Applying improvements...'}
            </div>
          </div>
        </div>
      )}
      
      {/* Website Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
        {sections.map((section, index) => (
          <TimeBasedSection
            key={index}
            section={section}
            performance={section.performance}
            issues={section.issues}
            timeSpeed={timeSpeed}
            isSimulating={isSimulating}
            simulationProgress={simulationProgress}
          />
        ))}
      </div>
    </div>
  );
}

// Main Component
const TimeBasedWebsiteSimulation: React.FC = () => {
  const [isEntering, setIsEntering] = useState(true);
  const [url, setUrl] = useState('');
  const [websiteData, setWebsiteData] = useState(null);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const analyzeWebsite = async () => {
    if (!url) return;
    
    try {
      // Simulate website analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
    }
  };

  const handleSimulationQuestion = async (question: string) => {
    setIsSimulating(true);
    setSimulationProgress(0);
    
    try {
      // Phase 1: Rewind timeline
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSimulationProgress(30);
      
      // Phase 2: Recalculate
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSimulationProgress(60);
      
      // Phase 3: Apply improvements
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSimulationProgress(90);
      
      // Update website data based on simulation
      if (question.toLowerCase().includes('speed') || question.toLowerCase().includes('performance')) {
        setWebsiteData(prev => ({
          ...prev,
          performance: Math.min(100, prev.performance + 25),
          headerPerformance: Math.min(100, prev.headerPerformance + 20),
          heroPerformance: Math.min(100, prev.heroPerformance + 30),
          contentPerformance: Math.min(100, prev.contentPerformance + 20),
          cardPerformance: Math.min(100, prev.cardPerformance + 15),
          footerPerformance: Math.min(100, prev.footerPerformance + 10),
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
      
      setSimulationProgress(100);
      
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setTimeout(() => {
        setIsSimulating(false);
        setSimulationProgress(0);
      }, 1000);
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
          <h1 className="text-4xl font-bold text-cyan-400 mb-4">Time-Based Website Simulation</h1>
          <p className="text-cyan-200 mb-8">Loading continuous behavior simulation...</p>
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
      {/* Main Website Simulation */}
      <div className="flex items-center justify-center min-h-screen p-8">
        {websiteData ? (
          <TimeBasedWebsite 
            websiteData={websiteData} 
            timeSpeed={timeSpeed}
            isSimulating={isSimulating}
            simulationProgress={simulationProgress}
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
                    if (e.key === 'Enter') {
                      analyzeWebsite();
                    }
                  }}
                />
                <button
                  onClick={analyzeWebsite}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Simulate
                </button>
              </div>
              <p className="text-white/70 text-sm">
                Watch your website behave over time with continuous animation
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Time Controls */}
      {websiteData && (
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md rounded-lg p-3 border border-cyan-500/30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimeSpeed(prev => prev === 1 ? 0 : 1)}
              className={`p-2 ${timeSpeed === 0 ? 'bg-red-600' : 'bg-green-600'} text-white rounded`}
            >
              {timeSpeed === 0 ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setTimeSpeed(prev => prev === 1 ? 2 : prev === 2 ? 5 : prev === 5 ? 10 : 1)}
              className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded"
            >
              {timeSpeed}x
            </button>
            <button
              onClick={() => setTimeSpeed(1)}
              className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
            Enter a website URL to see continuous behavior simulation
          </div>
          <div className="text-xs text-cyan-400">
            Watch performance issues as real-time behavior • Ask AI to simulate future improvements
          </div>
        </div>
      )}

      {/* AI Chat Interface */}
      {showChat && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50"
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
                    handleSimulationQuestion((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  handleSimulationQuestion(input.value);
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
    </div>
  );
};

export default TimeBasedWebsiteSimulation;
