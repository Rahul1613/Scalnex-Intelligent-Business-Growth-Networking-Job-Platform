import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Brain, Activity, TrendingUp, X, Send, Loader, MessageCircle, Zap, Eye, Clock } from 'lucide-react';

// Loading Animation Component
function LoadingAnimation({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
        >
          <div className="text-center">
            <Loader className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-cyan-400 font-semibold mb-2">Analyzing Website</h3>
            <p className="text-cyan-200 text-sm">Extracting layout structure...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Website Section - Real webpage sections in 3D space
function WebsiteSection({ 
  position, 
  size, 
  content, 
  type, 
  performance, 
  issues 
}: { 
  position: [number, number, number]; 
  size: [number, number]; 
  content: string; 
  type: 'header' | 'hero' | 'content' | 'card' | 'footer';
  performance: number; // 0-100
  issues: string[];
}) {
  const sectionRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (sectionRef.current) {
      const time = state.clock.elapsedTime;
      
      // Floating effect
      sectionRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.05;
      
      // Performance-based behavior
      if (performance < 50) {
        // Poor performance - jittery movement
        sectionRef.current.rotation.x = Math.sin(time * 4) * 0.02;
        sectionRef.current.rotation.z = Math.cos(time * 4) * 0.02;
      } else if (performance < 80) {
        // Medium performance - subtle movement
        sectionRef.current.rotation.x = Math.sin(time * 2) * 0.01;
      }
      // Good performance - stable
      
      // Hover effect
      if (hovered) {
        const targetScale = 1.05;
        sectionRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.1);
      } else {
        sectionRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  // Section styling based on type
  const getSectionStyle = () => {
    switch (type) {
      case 'header':
        return { color: 0x1a1a2e, opacity: 0.9, height: 1.5 };
      case 'hero':
        return { color: 0x2d3748, opacity: 0.8, height: 3 };
      case 'content':
        return { color: 0x4a5568, opacity: 0.7, height: 2 };
      case 'card':
        return { color: 0x718096, opacity: 0.6, height: 1.5 };
      case 'footer':
        return { color: 0x2d3748, opacity: 0.8, height: 1 };
      default:
        return { color: 0x4a5568, opacity: 0.7, height: 2 };
    }
  };

  const style = getSectionStyle();
  
  // Color based on performance
  const sectionColor = performance >= 80 ? 0x00ff88 : 
                      performance >= 60 ? 0xffaa00 : 
                      performance >= 40 ? 0xff6600 : 0xff4444;

  return (
    <group position={position}>
      {/* Section Background */}
      <Box
        ref={sectionRef}
        args={[size[0], style.height, size[1]]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={new THREE.Color(style.color)}
          transparent
          opacity={style.opacity}
          roughness={0.3}
          metalness={0.1}
        />
      </Box>

      {/* Content Text */}
      <Text
        position={[0, 0, size[1] / 2 + 0.01]}
        fontSize={0.3}
        color={performance >= 60 ? "white" : "#cccccc"}
        anchorX="center"
        anchorY="middle"
        maxWidth={size[0] - 0.5}
      >
        {content}
      </Text>

      {/* Issue Indicators */}
      {issues.length > 0 && (
        <group>
          {issues.slice(0, 3).map((issue, index) => (
            <Box
              key={index}
              args={[0.2, 0.2, 0.1]}
              position={[
                -size[0] / 2 + 0.3 + index * 0.3,
                style.height / 2 - 0.3,
                size[1] / 2 + 0.05
              ]}
            >
              <meshBasicMaterial color={0xff4444} />
            </Box>
          ))}
        </group>
      )}

      {/* Performance Glow */}
      {performance >= 80 && (
        <Box
          args={[size[0] + 0.1, style.height + 0.1, size[1] + 0.1]}
          position={[0, 0, 0]}
        >
          <meshBasicMaterial
            color={new THREE.Color(sectionColor)}
            transparent
            opacity={0.1}
          />
        </Box>
      )}
    </group>
  );
}

// Website Layout - Complete website structure in 3D
function WebsiteLayout({ websiteData, isSimulating }: { 
  websiteData: any; 
  isSimulating: boolean; 
}) {
  const layoutRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (layoutRef.current && isSimulating) {
      const time = state.clock.elapsedTime;
      
      // Simulation transformation
      layoutRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      layoutRef.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.01);
    }
  });

  if (!websiteData) return null;

  return (
    <group ref={layoutRef} position={[0, 0, 0]}>
      {/* Header Section */}
      <WebsiteSection
        position={[0, 4, 0]}
        size={[8, 0.5]}
        content={websiteData.header || "Website Header"}
        type="header"
        performance={websiteData.headerPerformance || 70}
        issues={websiteData.headerIssues || []}
      />

      {/* Hero Section */}
      <WebsiteSection
        position={[0, 2, 0]}
        size={[8, 0.5]}
        content={websiteData.hero || "Hero Section - Main Content"}
        type="hero"
        performance={websiteData.heroPerformance || 60}
        issues={websiteData.heroIssues || []}
      />

      {/* Content Sections */}
      <WebsiteSection
        position={[-3, 0, 0]}
        size={[3.5, 0.5]}
        content={websiteData.content1 || "Content Area 1"}
        type="content"
        performance={websiteData.contentPerformance || 80}
        issues={websiteData.contentIssues || []}
      />

      <WebsiteSection
        position={[3, 0, 0]}
        size={[3.5, 0.5]}
        content={websiteData.content2 || "Content Area 2"}
        type="content"
        performance={websiteData.contentPerformance || 75}
        issues={websiteData.contentIssues || []}
      />

      {/* Card Sections */}
      <WebsiteSection
        position={[-3, -2, 0]}
        size={[3.5, 0.5]}
        content={websiteData.card1 || "Feature Card 1"}
        type="card"
        performance={websiteData.cardPerformance || 85}
        issues={websiteData.cardIssues || []}
      />

      <WebsiteSection
        position={[3, -2, 0]}
        size={[3.5, 0.5]}
        content={websiteData.card2 || "Feature Card 2"}
        type="card"
        performance={websiteData.cardPerformance || 90}
        issues={websiteData.cardIssues || []}
      />

      {/* Footer */}
      <WebsiteSection
        position={[0, -4, 0]}
        size={[8, 0.5]}
        content={websiteData.footer || "Website Footer"}
        type="footer"
        performance={websiteData.footerPerformance || 65}
        issues={websiteData.footerIssues || []}
      />
    </group>
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
              <h3 className="text-cyan-400 font-semibold">AI Simulation</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about website improvements..."
                className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:border-cyan-500 focus:outline-none"
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

// Report Panel
function ReportPanel({ data, isVisible }: { data: any; isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="absolute top-20 right-4 z-50"
        >
          <div className="bg-black/80 backdrop-blur-md rounded-lg p-6 border border-cyan-500/30 w-80">
            <h3 className="text-cyan-400 font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Website Analysis
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Performance</span>
                  <span className={data.performance >= 80 ? 'text-green-400' : 'text-yellow-400'}>
                    {data.performance}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      data.performance >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${data.performance}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">SEO Score</span>
                  <span className={data.seo >= 80 ? 'text-green-400' : 'text-yellow-400'}>
                    {data.seo}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      data.seo >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${data.seo}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">UX Quality</span>
                  <span className={data.ux >= 80 ? 'text-green-400' : 'text-yellow-400'}>
                    {data.ux}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      data.ux >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${data.ux}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-700">
                <h4 className="text-cyan-300 font-medium mb-2">Issues Found</h4>
                <div className="space-y-1">
                  {data.issues?.slice(0, 3).map((issue: string, index: number) => (
                    <div key={index} className="text-xs text-red-400 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      {issue}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Main Scene
function WebsiteSimulationScene({ 
  websiteData, 
  isSimulating, 
  onSectionClick 
}: { 
  websiteData: any; 
  isSimulating: boolean; 
  onSectionClick: (section: string) => void; 
}) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set([0, 0, 15]);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, 10, -5]} intensity={0.4} color="#00ffff" />
      
      <WebsiteLayout websiteData={websiteData} isSimulating={isSimulating} />
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={30}
        maxPolarAngle={Math.PI * 0.9}
        minPolarAngle={Math.PI * 0.1}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  );
}

// Main Component
const WebsiteSimulationVerse: React.FC = () => {
  const [isEntering, setIsEntering] = useState(true);
  const [url, setUrl] = useState('');
  const [websiteData, setWebsiteData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [simulationQuestion, setSimulationQuestion] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const analyzeWebsite = async () => {
    if (!url) return;
    
    setIsAnalyzing(true);
    
    try {
      // Simulate website analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock website data (in real app, this would be from backend)
      const mockData = {
        url: url,
        header: "Welcome to " + new URL(url).hostname,
        hero: "Main hero section with call-to-action",
        content1: "Feature description and benefits",
        content2: "Product information and details",
        card1: "Service offering 1",
        card2: "Service offering 2",
        footer: "© 2024 " + new URL(url).hostname,
        performance: Math.floor(Math.random() * 40) + 60,
        seo: Math.floor(Math.random() * 40) + 60,
        ux: Math.floor(Math.random() * 40) + 60,
        issues: [
          "Slow page load time",
          "Missing meta descriptions",
          "Poor mobile optimization"
        ],
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
      setShowReport(true);
      setShowChat(true);
      
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSimulationQuestion = async (question: string) => {
    setSimulationQuestion(question);
    setIsSimulating(true);
    
    try {
      // Simulate backend calculation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update website data based on simulation
      if (question.toLowerCase().includes('speed')) {
        setWebsiteData(prev => ({
          ...prev,
          performance: Math.min(100, prev.performance + 20),
          headerPerformance: Math.min(100, prev.headerPerformance + 15),
          heroPerformance: Math.min(100, prev.heroPerformance + 25)
        }));
      } else if (question.toLowerCase().includes('content')) {
        setWebsiteData(prev => ({
          ...prev,
          seo: Math.min(100, prev.seo + 15),
          contentPerformance: Math.min(100, prev.contentPerformance + 20)
        }));
      } else if (question.toLowerCase().includes('ux') || question.toLowerCase().includes('design')) {
        setWebsiteData(prev => ({
          ...prev,
          ux: Math.min(100, prev.ux + 25),
          cardPerformance: Math.min(100, prev.cardPerformance + 20)
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
          <p className="text-cyan-200 mb-8">Entering digital intelligence space...</p>
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
          <Suspense fallback={null}>
            <WebsiteSimulationScene
              websiteData={websiteData}
              isSimulating={isSimulating}
              onSectionClick={(section) => console.log('Section clicked:', section)}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* URL Input */}
      {!websiteData && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-black/80 backdrop-blur-md rounded-lg p-6 border border-cyan-500/30 w-96">
            <h2 className="text-cyan-400 font-semibold mb-4 text-center flex items-center justify-center gap-2">
              <Globe className="w-5 h-5" />
              Enter Website URL
            </h2>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-cyan-500 focus:outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isAnalyzing) {
                    analyzeWebsite();
                  }
                }}
              />
              <button
                onClick={analyzeWebsite}
                disabled={isAnalyzing}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
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
            <div className="text-xs text-gray-400 mt-3 text-center">
              Enter any website URL to visualize and simulate its performance
            </div>
          </div>
        </div>
      )}

      {/* Loading Animation */}
      <LoadingAnimation isVisible={isAnalyzing && !websiteData} />

      {/* Status */}
      <div className="absolute top-4 left-4 text-cyan-400 font-mono text-sm bg-black/60 p-3 rounded">
        <div>WSV - Website Simulation Verse</div>
        <div className="text-xs text-cyan-300 mt-1">
          {websiteData ? 'Website Loaded' : 'Enter URL to begin'}
        </div>
      </div>

      {/* Simulation Status */}
      {isSimulating && (
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-lg p-4 border border-cyan-500/30">
          <h3 className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Simulating Future
          </h3>
          <div className="text-cyan-200 text-sm mb-1">Question: {simulationQuestion}</div>
          <div className="text-xs text-cyan-300 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Recalculating website performance...
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Website Info */}
      {websiteData && !isSimulating && (
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-lg p-4 border border-cyan-500/30">
          <h3 className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Website Analysis
          </h3>
          <div className="text-cyan-200 text-sm mb-1">{websiteData.url}</div>
          <div className="text-xs text-cyan-300">
            Performance: {websiteData.performance}% | SEO: {websiteData.seo}% | UX: {websiteData.ux}%
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
          Exit Verse
        </button>
      </div>

      {/* Instructions */}
      {!websiteData && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-cyan-300 text-sm mb-2">
            Enter a website URL to visualize and simulate its performance
          </div>
          <div className="text-xs text-cyan-400">
            Watch as real website layouts come to life in 3D space • Ask AI questions about improvements
          </div>
        </div>
      )}

      {/* Controls Help */}
      {websiteData && !isSimulating && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-cyan-300 text-sm mb-1">
            🖱️ Drag to rotate • Scroll to zoom • Click sections for details
          </div>
          <div className="text-xs text-cyan-400">
            Ask AI: "What if I improve speed?" or "How will adding content help?"
          </div>
        </div>
      )}

      {/* Version Info */}
      <div className="absolute bottom-4 left-4 text-xs text-cyan-500 font-mono">
        WSV v1.0 • Website Simulation Verse
      </div>

      {/* AI Chat Interface */}
      <AIChatInterface onQuestion={handleSimulationQuestion} isVisible={showChat} />

      {/* Report Panel */}
      <ReportPanel data={websiteData || {}} isVisible={showReport} />
    </div>
  );
};

export default WebsiteSimulationVerse;
