import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WebsiteStructure } from './WebsiteExtractor';

interface WebsiteDigitalTwinProps {
  websiteData: WebsiteStructure;
  timePeriod: 'past_6m' | 'past_3m' | 'present' | 'future_3m' | 'future_6m';
  timeSpeed: number;
  isSimulating: boolean;
  simulationProgress: number;
}

interface TimeBasedPerformance {
  loadTime: number;
  renderTime: number;
  layoutShifts: number;
  bounceRate: number;
  contentDensity: number;
  seoScore: number;
  uxScore: number;
  accessibilityScore: number;
}

const WebsiteDigitalTwin: React.FC<WebsiteDigitalTwinProps> = ({ 
  websiteData, 
  timePeriod, 
  timeSpeed, 
  isSimulating, 
  simulationProgress 
}) => {
  const [renderTime, setRenderTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [layoutShift, setLayoutShift] = useState(0);
  const [interactionDelay, setInteractionDelay] = useState(0);
  const [contentOpacity, setContentOpacity] = useState(0);
  const animationRef = useRef<number>();

  // Calculate time-based performance
  const getTimeBasedPerformance = (): TimeBasedPerformance => {
    const basePerformance = websiteData.performance;
    
    switch (timePeriod) {
      case 'past_6m':
        return {
          loadTime: basePerformance.loadTime * 2.5,
          renderTime: basePerformance.renderTime * 3,
          layoutShifts: basePerformance.layoutShifts * 4,
          bounceRate: Math.min(95, basePerformance.bounceRate + 30),
          contentDensity: Math.max(10, basePerformance.contentDensity - 20),
          seoScore: Math.max(20, basePerformance.seoScore - 30),
          uxScore: Math.max(20, basePerformance.uxScore - 25),
          accessibilityScore: Math.max(20, basePerformance.accessibilityScore - 20)
        };
      
      case 'past_3m':
        return {
          loadTime: basePerformance.loadTime * 1.8,
          renderTime: basePerformance.renderTime * 2,
          layoutShifts: basePerformance.layoutShifts * 2.5,
          bounceRate: Math.min(85, basePerformance.bounceRate + 20),
          contentDensity: Math.max(15, basePerformance.contentDensity - 10),
          seoScore: Math.max(30, basePerformance.seoScore - 20),
          uxScore: Math.max(30, basePerformance.uxScore - 15),
          accessibilityScore: Math.max(30, basePerformance.accessibilityScore - 10)
        };
      
      case 'present':
        return basePerformance;
      
      case 'future_3m':
        return {
          loadTime: Math.max(50, basePerformance.loadTime * 0.6),
          renderTime: Math.max(50, basePerformance.renderTime * 0.5),
          layoutShifts: Math.max(0, basePerformance.layoutShifts * 0.3),
          bounceRate: Math.max(20, basePerformance.bounceRate - 25),
          contentDensity: Math.min(100, basePerformance.contentDensity + 20),
          seoScore: Math.min(100, basePerformance.seoScore + 20),
          uxScore: Math.min(100, basePerformance.uxScore + 25),
          accessibilityScore: Math.min(100, basePerformance.accessibilityScore + 15)
        };
      
      case 'future_6m':
        return {
          loadTime: Math.max(30, basePerformance.loadTime * 0.4),
          renderTime: Math.max(30, basePerformance.renderTime * 0.3),
          layoutShifts: Math.max(0, basePerformance.layoutShifts * 0.1),
          bounceRate: Math.max(15, basePerformance.bounceRate - 35),
          contentDensity: Math.min(100, basePerformance.contentDensity + 40),
          seoScore: Math.min(100, basePerformance.seoScore + 30),
          uxScore: Math.min(100, basePerformance.uxScore + 35),
          accessibilityScore: Math.min(100, basePerformance.accessibilityScore + 25)
        };
      
      default:
        return basePerformance;
    }
  };

  const performance = getTimeBasedPerformance();

  useEffect(() => {
    const animate = () => {
      setRenderTime(prev => {
        const newTime = prev + (0.016 * timeSpeed);
        
        // Loading behavior based on performance
        const loadDelay = performance.loadTime / 100;
        setIsLoaded(newTime >= loadDelay);
        
        return newTime;
      });

      // Content opacity based on render time
      setContentOpacity(prev => {
        const renderDelay = performance.renderTime / 100;
        const targetOpacity = renderTime >= renderDelay ? 1 : 0.3;
        return prev + (targetOpacity - prev) * 0.1;
      });

      // Layout shifts for poor performance
      if (performance.layoutShifts > 2) {
        setLayoutShift(prev => {
          const shift = Math.sin(Date.now() / 800) * performance.layoutShifts;
          return prev + (shift - prev) * 0.05;
        });
      }

      // Interaction delay for poor UX
      if (performance.uxScore < 60) {
        setInteractionDelay(prev => {
          const delay = Math.sin(Date.now() / 1000) * (100 - performance.uxScore);
          return Math.max(0, delay);
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

  // Performance-based visual behavior
  const getPerformanceBehavior = () => {
    if (!isLoaded) return { opacity: 0 };
    
    let behavior = {};
    
    if (performance.loadTime > 200) {
      // Very poor performance - severe issues
      behavior = {
        animation: 'shake 0.3s infinite',
        filter: 'blur(1px)',
        transform: `translateY(${layoutShift}px)`,
        boxShadow: '0 4px 20px rgba(255, 0, 0, 0.3)'
      };
    } else if (performance.loadTime > 100) {
      // Poor performance - noticeable issues
      behavior = {
        animation: 'pulse 1s infinite',
        transform: `translateY(${layoutShift * 0.5}px)`,
        boxShadow: '0 2px 10px rgba(255, 165, 0, 0.2)'
      };
    } else if (performance.loadTime > 50) {
      // Medium performance - subtle issues
      behavior = {
        transform: `translateY(${layoutShift * 0.2}px)`,
        boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)'
      };
    }
    // Good performance - stable
    
    return behavior;
  };

  // Render extracted content
  const renderExtractedContent = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {websiteData.title || websiteData.headings[0]?.text || 'Website Title'}
            </h1>
            <nav className="flex space-x-6">
              {websiteData.navigation.slice(0, 5).map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="text-white hover:text-cyan-400 transition-colors"
                  style={{ 
                    transitionDelay: `${interactionDelay}ms`,
                    opacity: contentOpacity
                  }}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-12 rounded-lg text-center">
          <h2 className="text-4xl font-bold mb-6">
            {websiteData.headings[1]?.text || 'Hero Title'}
          </h2>
          <div className="text-xl mb-8 max-w-2xl mx-auto">
            {websiteData.content.find(c => c.type === 'text')?.content || 
             'Transform your business with our solutions'}
          </div>
          <button 
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all"
            style={{ 
              transitionDelay: `${interactionDelay}ms`,
              opacity: contentOpacity
            }}
          >
            {websiteData.content.find(c => c.type === 'button')?.content || 'Get Started'}
          </button>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {websiteData.headings.slice(2, 4).map((heading, index) => (
            <div key={index} className="bg-white text-gray-800 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">
                {heading.text}
              </h3>
              {websiteData.content
                .filter(c => c.type === 'text')
                .slice(index * 2, (index + 1) * 2)
                .map((item, contentIndex) => (
                  <p key={contentIndex} className="text-gray-600 leading-relaxed mb-3">
                    {item.content}
                  </p>
                ))}
            </div>
          ))}
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {websiteData.images.slice(0, 3).map((image, index) => (
            <div key={index} className="relative">
              <div 
                className={`w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center`}
                style={{ 
                  opacity: contentOpacity,
                  transitionDelay: `${interactionDelay + index * 200}ms`
                }}
              >
                <span className="text-gray-500 text-sm">{image.alt}</span>
              </div>
              {performance.loadTime > 100 && (
                <div className="absolute inset-0 border-2 border-red-500 rounded-lg animate-pulse opacity-50"></div>
              )}
            </div>
          ))}
        </div>

        {/* Forms */}
        {websiteData.forms.length > 0 && (
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              {websiteData.headings.find(h => h.level === 2)?.text || 'Contact Form'}
            </h3>
            <div className="space-y-4">
              {websiteData.forms[0].fields.slice(0, 3).map((field, index) => (
                <div key={index}>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    style={{ 
                      transitionDelay: `${interactionDelay + index * 100}ms`,
                      opacity: contentOpacity
                    }}
                  />
                </div>
              ))}
              <button 
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                style={{ 
                  transitionDelay: `${interactionDelay + 300}ms`,
                  opacity: contentOpacity
                }}
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-800 text-white p-8 rounded-lg text-center">
          <p className="text-gray-300">
            {websiteData.content.find(c => c.type === 'text')?.content || 
             `© 2024 ${websiteData.url}`}
          </p>
          <div className="flex justify-center space-x-6 mt-4 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-300">Privacy</a>
            <a href="#" className="hover:text-gray-300">Terms</a>
            <a href="#" className="hover:text-gray-300">Contact</a>
          </div>
        </div>
      </div>
    );
  };

  // Performance indicator
  const getPerformanceColor = () => {
    if (performance.loadTime > 200) return 'bg-red-500';
    if (performance.loadTime > 100) return 'bg-orange-500';
    if (performance.loadTime > 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isLoaded ? 1 : 0, 
        y: isLoaded ? 0 : 20 
      }}
      style={{ 
        ...getPerformanceBehavior(), 
        ...getSimulationStyle()
      }}
      className="relative"
    >
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-sm">Loading...</div>
            <div className="text-xs opacity-75">Load Time: {Math.round(performance.loadTime)}ms</div>
          </div>
        </div>
      )}

      {/* Layout shift indicator */}
      {isLoaded && layoutShift > 0.5 && (
        <div className="absolute inset-0 border-2 border-red-500 rounded-lg pointer-events-none animate-pulse opacity-50"></div>
      )}

      {/* Performance indicator */}
      <div className="absolute top-4 right-4">
        <div className={`w-4 h-4 rounded-full ${getPerformanceColor()}`}></div>
      </div>

      {/* Time period indicator */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-lg p-2 text-white text-xs">
        <div className="font-semibold">{timePeriod.replace('_', ' ').toUpperCase()}</div>
        <div className="text-xs opacity-75">Load: {Math.round(performance.loadTime)}ms</div>
        <div className="text-xs opacity-75">UX: {Math.round(performance.uxScore)}%</div>
      </div>

      {/* Website Content */}
      {renderExtractedContent()}
    </motion.div>
  );
};

export default WebsiteDigitalTwin;
