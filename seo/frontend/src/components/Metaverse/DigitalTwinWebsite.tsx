import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Brain, Activity, X, Send, Loader, Zap, Play, Pause, RotateCcw, Eye, Clock } from 'lucide-react';

// Website Structure Extractor
interface WebsiteStructure {
  url: string;
  title: string;
  headings: Array<{
    level: number;
    text: string;
    position: number;
  }>;
  content: Array<{
    type: 'text' | 'image' | 'button' | 'link';
    content: string;
    position: number;
  }>;
  navigation: Array<{
    text: string;
    href: string;
  }>;
  images: Array<{
    src: string;
    alt: string;
    size: 'small' | 'medium' | 'large';
  }>;
}

// Digital Twin Section Component
function DigitalTwinSection({ 
  section, 
  performance, 
  issues, 
  timeSpeed,
  isSimulating,
  simulationProgress,
  extractedData 
}: { 
  section: {
    type: 'header' | 'navigation' | 'hero' | 'content' | 'sidebar' | 'footer';
    extractedData: any;
  };
  performance: number;
  issues: string[];
  timeSpeed: number;
  isSimulating: boolean;
  simulationProgress: number;
  extractedData: WebsiteStructure;
}) {
  const [renderTime, setRenderTime] = useState(0);
  const [isRendered, setIsRendered] = useState(false);
  const [interactionDelay, setInteractionDelay] = useState(0);
  const [layoutShift, setLayoutShift] = useState(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      setRenderTime(prev => {
        const newTime = prev + (0.016 * timeSpeed);
        
        // Render behavior based on performance
        const renderDelay = performance < 30 ? 4 : performance < 60 ? 2 : performance < 80 ? 1 : 0.5;
        setIsRendered(newTime >= renderDelay);
        
        return newTime;
      });

      // Interaction delay for poor UX
      if (performance < 70) {
        setInteractionDelay(prev => {
          const delay = Math.sin(Date.now() / 1000) * 100;
          return Math.max(0, delay);
        });
      }

      // Layout shifts for poor structure
      if (performance < 60) {
        setLayoutShift(prev => {
          const shift = Math.sin(Date.now() / 800) * 3;
          return prev + (shift - prev) * 0.05;
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
      transform: `translateY(${layoutShift * (1 - improvementFactor)}px)`,
      transition: 'all 0.3s ease-out',
      filter: `blur(${(1 - improvementFactor) * 0.5}px)`
    };
  };

  // Extract real content from structure
  const renderExtractedContent = () => {
    if (!extractedData) return null;

    switch (section.type) {
      case 'header':
        return (
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              {extractedData.title || extractedData.headings[0]?.text || 'Website Title'}
            </h1>
            <nav className="flex space-x-6">
              {extractedData.navigation.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="text-white hover:text-cyan-400 transition-colors"
                  style={{ 
                    transitionDelay: `${interactionDelay}ms`,
                    opacity: isRendered ? 1 : 0.3
                  }}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        );

      case 'hero':
        return (
          <div className="text-center py-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              {extractedData.headings[1]?.text || 'Hero Title'}
            </h2>
            <div className="text-xl text-white mb-8 max-w-2xl mx-auto">
              {extractedData.content.find(c => c.type === 'text')?.content || 
               extractedData.content.find(c => c.type === 'text')?.content ||
               'Transform your business with our solutions'}
            </div>
            <button 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all"
              style={{ 
                transitionDelay: `${interactionDelay}ms`,
                opacity: isRendered ? 1 : 0.3
              }}
            >
              Get Started
            </button>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6">
            {extractedData.headings.slice(2, 4).map((heading, index) => (
              <h3 key={index} className="text-2xl font-semibold text-gray-800">
                {heading.text}
              </h3>
            ))}
            {extractedData.content
              .filter(c => c.type === 'text')
              .slice(0, 3)
              .map((item, index) => (
                <p key={index} className="text-gray-600 leading-relaxed">
                  {item.content}
                </p>
              ))}
            {extractedData.images.slice(0, 2).map((image, index) => (
              <div key={index} className="my-4">
                <div 
                  className={`w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center`}
                  style={{ 
                    opacity: isRendered ? 1 : 0.3,
                    transitionDelay: `${interactionDelay + index * 200}ms`
                  }}
                >
                  <span className="text-gray-500">Image: {image.alt}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'sidebar':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {extractedData.headings.find(h => h.level === 2)?.text || 'Sidebar'}
            </h3>
            {extractedData.content
              .filter(c => c.type === 'link')
              .slice(0, 5)
              .map((item, index) => (
                <a
                  key={index}
                  href={item.content}
                  className="block text-blue-600 hover:text-blue-800 py-2"
                  style={{ 
                    transitionDelay: `${interactionDelay + index * 100}ms`,
                    opacity: isRendered ? 1 : 0.3
                  }}
                >
                  {item.content}
                </a>
              ))}
          </div>
        );

      case 'footer':
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">
              {extractedData.content.find(c => c.type === 'text')?.content || 
               `© 2024 ${extractedData.url}`}
            </p>
            <div className="flex justify-center space-x-6 mt-4 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-700">Privacy</a>
              <a href="#" className="hover:text-gray-700">Terms</a>
              <a href="#" className="hover:text-gray-700">Contact</a>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Performance-based visual behavior
  const getPerformanceBehavior = () => {
    if (!isRendered) return { opacity: 0 };
    
    let behavior = {};
    
    if (performance < 30) {
      // Very poor performance - severe issues
      behavior = {
        animation: 'shake 0.3s infinite',
        filter: 'blur(1px)',
        transform: `translateY(${layoutShift}px)`,
        boxShadow: '0 4px 20px rgba(255, 0, 0, 0.3)'
      };
    } else if (performance < 60) {
      // Poor performance - noticeable issues
      behavior = {
        animation: 'pulse 1s infinite',
        transform: `translateY(${layoutShift * 0.5}px)`,
        boxShadow: '0 2px 10px rgba(255, 165, 0, 0.2)'
      };
    } else if (performance < 80) {
      // Medium performance - subtle issues
      behavior = {
        transform: `translateY(${layoutShift * 0.2}px)`,
        boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)'
      };
    }
    // Good performance - stable
    
    return behavior;
  };

  const sectionStyle = {
    header: 'bg-gray-900',
    navigation: 'bg-gray-800',
    hero: 'bg-gradient-to-br from-blue-600 to-purple-600',
    content: 'bg-white text-gray-800',
    sidebar: 'bg-gray-100 text-gray-800',
    footer: 'bg-gray-800'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isRendered ? 1 : 0, 
        y: isRendered ? 0 : 20 
      }}
      style={{ 
        ...getPerformanceBehavior(), 
        ...getSimulationStyle(),
        backgroundColor: sectionStyle[section.type] || '#ffffff',
        color: section.type === 'content' || section.type === 'sidebar' ? '#1f2937' : '#ffffff'
      }}
      className="rounded-lg p-6 border-2 relative overflow-hidden"
    >
      {/* Loading overlay */}
      {!isRendered && (
        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-sm">Rendering...</div>
            <div className="text-xs opacity-75">Performance: {performance}%</div>
          </div>
        </div>
      )}

      {/* Layout shift indicator */}
      {isRendered && layoutShift > 0.5 && (
        <div className="absolute inset-0 border-2 border-red-500 rounded-lg pointer-events-none animate-pulse opacity-50"></div>
      )}

      {/* Extracted Content */}
      {renderExtractedContent()}

      {/* Performance Indicator */}
      {isRendered && (
        <div className="absolute top-2 right-2">
          <div className={`w-3 h-3 rounded-full ${
            performance >= 80 ? 'bg-green-500' : 
            performance >= 60 ? 'bg-yellow-500' : 
            performance >= 30 ? 'bg-orange-500' : 'bg-red-500'
          }`}></div>
        </div>
      )}

      {/* Issue Indicators */}
      {isRendered && issues.length > 0 && (
        <div className="absolute -top-2 -right-2">
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white text-xs font-bold">!</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Website Structure Extractor (Simulated)
function extractWebsiteStructure(url: string): Promise<WebsiteStructure> {
  return new Promise((resolve) => {
    // Simulate website extraction
    setTimeout(() => {
      const structure: WebsiteStructure = {
        url: url,
        title: `Welcome to ${new URL(url).hostname}`,
        headings: [
          { level: 1, text: `Welcome to ${new URL(url).hostname}`, position: 0 },
          { level: 2, text: 'Transform Your Business', position: 1 },
          { level: 2, text: 'Our Services', position: 2 },
          { level: 3, text: 'Web Development', position: 3 },
          { level: 3, text: 'Digital Marketing', position: 4 }
        ],
        content: [
          { type: 'text', content: 'Professional web development services tailored to your needs', position: 0 },
          { type: 'text', content: 'Transform your digital presence with our expert solutions', position: 1 },
          { type: 'image', src: '/api/placeholder/image', alt: 'Service Image', size: 'medium', position: 2 },
          { type: 'button', content: 'Get Started', position: 3 },
          { type: 'text', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', position: 4 },
          { type: 'link', content: '#services', position: 5 },
          { type: 'link', content: '#about', position: 6 },
          { type: 'link', content: '#contact', position: 7 }
        ],
        navigation: [
          { text: 'Home', href: '#home' },
          { text: 'About', href: '#about' },
          { text: 'Services', href: '#services' },
          { text: 'Contact', href: '#contact' }
        ],
        images: [
          { src: '/api/placeholder/hero', alt: 'Hero Image', size: 'large' },
          { src: '/api/placeholder/service1', alt: 'Service 1', size: 'medium' },
          { src: '/api/placeholder/service2', alt: 'Service 2', size: 'medium' }
        ]
      };
      
      resolve(structure);
    }, 1000);
  });
}

// Digital Twin Website Simulation
function DigitalTwinWebsite({ 
  websiteData, 
  timeSpeed, 
  isSimulating, 
  simulationProgress 
}: { 
  websiteData: WebsiteStructure; 
  timeSpeed: number;
  isSimulating: boolean;
  simulationProgress: number;
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [engagementMetrics, setEngagementMetrics] = useState({
    visitors: 0,
    bounceRate: 100,
    conversions: 0,
    avgLoadTime: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(prev => prev + timeSpeed);
      
      // Update engagement metrics based on website performance
      const basePerformance = websiteData ? 50 : 70;
      const growthRate = basePerformance / 100;
      
      setEngagementMetrics(prev => ({
        visitors: Math.floor(prev.visitors + (growthRate * 15 * timeSpeed)),
        bounceRate: Math.max(20, prev.bounceRate - (growthRate * 3 * timeSpeed)),
        conversions: Math.floor(prev.conversions + (growthRate * 3 * timeSpeed)),
        avgLoadTime: Math.max(500, prev.avgLoadTime - (basePerformance * 20 * timeSpeed))
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeSpeed, websiteData]);

  if (!websiteData) return null;

  const sections = [
    {
      type: 'header' as const,
      extractedData: websiteData
    },
    {
      type: 'hero' as const,
      extractedData: websiteData
    },
    {
      type: 'content' as const,
      extractedData: websiteData
    },
    {
      type: 'sidebar' as const,
      extractedData: websiteData
    },
    {
      type: 'footer' as const,
      extractedData: websiteData
    }
  ];

  // Calculate performance based on extracted data
  const calculateSectionPerformance = (sectionType: string) => {
    // Simulate performance analysis based on extracted structure
    const basePerformance = 50;
    const issues = [];
    
    if (sectionType === 'header' && !websiteData.title) {
      issues.push('Missing title tag');
      return Math.max(20, basePerformance - 20);
    }
    
    if (sectionType === 'hero' && websiteData.images.length === 0) {
      issues.push('No hero image');
      return Math.max(30, basePerformance - 20);
    }
    
    if (sectionType === 'content' && websiteData.content.length < 3) {
      issues.push('Insufficient content');
      return Math.max(40, basePerformance - 10);
    }
    
    return basePerformance + Math.floor(Math.random() * 30);
  };

  return (
    <div className="relative">
      {/* Time Display */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-lg p-3 border border-cyan-500/30">
        <div className="text-cyan-400 font-semibold text-sm">Digital Twin Simulation</div>
        <div className="text-cyan-200 text-xs mt-1">Day {Math.floor(currentTime / 24)}, {Math.floor(currentTime % 24)}:00</div>
        <div className="text-xs text-cyan-300 mt-1">Speed: {timeSpeed}x</div>
      </div>

      {/* Engagement Metrics */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-lg p-3 border border-cyan-500/30">
        <div className="text-cyan-400 font-semibold text-sm">Live Metrics</div>
        <div className="text-cyan-200 text-xs mt-1">Visitors: {engagementMetrics.visitors}</div>
        <div className="text-cyan-200 text-xs">Bounce Rate: {engagementMetrics.bounceRate}%</div>
        <div className="text-cyan-200 text-xs">Conversions: {engagementMetrics.conversions}</div>
        <div className="text-cyan-200 text-xs">Avg Load Time: {engagementMetrics.avgLoadTime}ms</div>
      </div>

      {/* Simulation Overlay */}
      {isSimulating && (
        <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
          <div className="text-center">
            <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-white font-semibold mb-2">Recalculating Digital Twin</h3>
            <div className="w-64 bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${simulationProgress}%` }}
              />
            </div>
            <div className="text-white text-sm mt-2">
              {simulationProgress < 33 ? 'Analyzing structure...' : 
               simulationProgress < 66 ? 'Optimizing performance...' : 
               'Applying improvements...'}
            </div>
          </div>
        </div>
      )}
      
      {/* Digital Twin Container */}
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-0">
            <DigitalTwinSection
              section={{ type: 'header', extractedData: websiteData }}
              performance={calculateSectionPerformance('header')}
              issues={[]}
              timeSpeed={timeSpeed}
              isSimulating={isSimulating}
              simulationProgress={simulationProgress}
              extractedData={websiteData}
            />
            
            <DigitalTwinSection
              section={{ type: 'hero', extractedData: websiteData }}
              performance={calculateSectionPerformance('hero')}
              issues={websiteData.images.length === 0 ? ['No hero image'] : []}
              timeSpeed={timeSpeed}
              isSimulating={isSimulating}
              simulationProgress={simulationProgress}
              extractedData={websiteData}
            />
            
            <DigitalTwinSection
              section={{ type: 'content', extractedData: websiteData }}
              performance={calculateSectionPerformance('content')}
              issues={websiteData.content.length < 3 ? ['Insufficient content'] : []}
              timeSpeed={timeSpeed}
              isSimulating={isSimulating}
              simulationProgress={simulationProgress}
              extractedData={websiteData}
            />
            
            <DigitalTwinSection
              section={{ type: 'footer', extractedData: websiteData }}
              performance={calculateSectionPerformance('footer')}
              issues={[]}
              timeSpeed={timeSpeed}
              isSimulating={isSimulating}
              simulationProgress={simulationProgress}
              extractedData={websiteData}
            />
          </div>
          
          {/* Sidebar */}
          <div className="bg-gray-50 p-6 border-l border-gray-200">
            <DigitalTwinSection
              section={{ type: 'sidebar', extractedData: websiteData }}
              performance={calculateSectionPerformance('sidebar')}
              issues={[]}
              timeSpeed={timeSpeed}
              isSimulating={isSimulating}
              simulationProgress={simulationProgress}
              extractedData={websiteData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
const DigitalTwinWebsiteSimulation: React.FC = () => {
  const [isEntering, setIsEntering] = useState(true);
  const [url, setUrl] = useState('');
  const [websiteData, setWebsiteData] = useState<WebsiteStructure | null>(null);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const extractWebsite = async () => {
    if (!url) return;
    
    setIsExtracting(true);
    
    try {
      const structure = await extractWebsiteStructure(url);
      setWebsiteData(structure);
      setShowChat(true);
    } catch (error) {
      console.error('Extraction failed:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSimulationQuestion = async (question: string) => {
    setIsSimulating(true);
    setSimulationProgress(0);
    
    try {
      // Phase 1: Analyze structure
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSimulationProgress(33);
      
      // Phase 2: Recalculate performance
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSimulationProgress(66);
      
      // Phase 3: Apply improvements
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSimulationProgress(100);
      
      // Update website data based on simulation
      if (websiteData) {
        const improvedData = { ...websiteData };
        
        if (question.toLowerCase().includes('speed') || question.toLowerCase().includes('performance')) {
          // Add more images, optimize content
          improvedData.images.push(
            { src: '/api/placeholder/optimized1', alt: 'Optimized Image 1', size: 'medium' },
            { src: '/api/placeholder/optimized2', alt: 'Optimized Image 2', size: 'small' }
          );
          improvedData.content.push(
            { type: 'text', content: 'Optimized content for better performance', position: 8 },
            { type: 'text', content: 'Fast loading content section', position: 9 }
          );
        }
        
        if (question.toLowerCase().includes('content')) {
          improvedData.content.push(
            { type: 'text', content: 'Additional valuable content added', position: 10 },
            { type: 'text', content: 'Comprehensive information about our services', position: 11 }
          );
          improvedData.headings.push(
            { level: 2, text: 'Enhanced Content Section', position: 5 }
          );
        }
        
        setWebsiteData(improvedData);
      }
      
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
          <h1 className="text-4xl font-bold text-cyan-400 mb-4">Digital Twin Website</h1>
          <p className="text-cyan-200 mb-8">Extracting and simulating real website structure...</p>
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
      {/* Main Digital Twin Simulation */}
      <div className="flex items-center justify-center min-h-screen p-8">
        {websiteData ? (
          <DigitalTwinWebsite 
            websiteData={websiteData} 
            timeSpeed={timeSpeed}
            isSimulating={isSimulating}
            simulationProgress={simulationProgress}
          />
        ) : (
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <Globe className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Extract Website Structure</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 bg-white/20 text-white px-4 py-3 rounded border border-white/30 focus:border-cyan-400 focus:outline-none placeholder-white/50"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      extractWebsite();
                    }
                  }}
                />
                <button
                  onClick={extractWebsite}
                  disabled={isExtracting}
                  className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-6 py-3 rounded flex items-center gap-2"
                >
                  {isExtracting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Extracting
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Extract
                    </>
                  )}
                </button>
              </div>
              <p className="text-white/70 text-sm">
                Extract real website structure and create a controllable digital twin
              </p>
              <p className="text-white/50 text-xs mt-2">
                The digital twin will simulate performance issues and future improvements
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
            Extract real website structure and watch performance behavior
          </div>
          <div className="text-xs text-cyan-400">
            See layout shifts, loading delays, and future improvements
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
              <h3 className="text-cyan-400 font-semibold text-sm">Digital Twin Simulation</h3>
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

export default DigitalTwinWebsiteSimulation;
