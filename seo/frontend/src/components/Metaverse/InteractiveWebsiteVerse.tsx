import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Brain, Activity, X, Send, Loader, MessageCircle, Zap, Eye, Clock } from 'lucide-react';

// Website Section - Visual representation of actual webpage sections
function VisualWebsiteSection({ 
  position, 
  size, 
  content, 
  type, 
  performance, 
  issues,
  isLoading,
  isSimulating
}: { 
  position: [number, number, number]; 
  size: [number, number]; 
  content: string; 
  type: 'header' | 'hero' | 'content' | 'card' | 'footer';
  performance: number; // 0-100
  issues: string[];
  isLoading: boolean;
  isSimulating: boolean;
}) {
  const sectionRef = useRef<THREE.Mesh>(null);
  const [loaded, setLoaded] = useState(false);

  useFrame((state) => {
    if (sectionRef.current) {
      const time = state.clock.elapsedTime;
      
      // Loading behavior - sections load based on performance
      if (isLoading && !loaded) {
        const loadDelay = performance < 50 ? 3 : performance < 80 ? 1.5 : 0.5;
        if (time > loadDelay) {
          setLoaded(true);
        }
        // Fade in effect during loading
        sectionRef.current.material.opacity = Math.min(time / loadDelay, 1);
      }
      
      // Performance-based behavior
      if (loaded && !isLoading) {
        if (performance < 50) {
          // Poor performance - jittery, unstable
          sectionRef.current.rotation.x = Math.sin(time * 4) * 0.02;
          sectionRef.current.rotation.z = Math.cos(time * 4) * 0.02;
          sectionRef.current.position.y = position[1] + Math.sin(time * 6) * 0.1;
        } else if (performance < 80) {
          // Medium performance - subtle issues
          sectionRef.current.rotation.x = Math.sin(time * 2) * 0.005;
          sectionRef.current.position.y = position[1] + Math.sin(time * 1) * 0.02;
        }
        // Good performance - stable
      }
      
      // Simulation transformation
      if (isSimulating) {
        const targetScale = 1.1;
        sectionRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.02);
        sectionRef.current.rotation.y = time * 0.5;
      }
    }
  });

  // Section styling based on type
  const getSectionStyle = () => {
    switch (type) {
      case 'header':
        return { color: 0x1a1a2e, height: 1.5, opacity: loaded ? 0.9 : 0.1 };
      case 'hero':
        return { color: 0x2d3748, height: 3, opacity: loaded ? 0.8 : 0.1 };
      case 'content':
        return { color: 0x4a5568, height: 2, opacity: loaded ? 0.7 : 0.1 };
      case 'card':
        return { color: 0x718096, height: 1.5, opacity: loaded ? 0.6 : 0.1 };
      case 'footer':
        return { color: 0x2d3748, height: 1, opacity: loaded ? 0.8 : 0.1 };
      default:
        return { color: 0x4a5568, height: 2, opacity: loaded ? 0.7 : 0.1 };
    }
  };

  const style = getSectionStyle();
  
  // Color based on performance and issues
  const sectionColor = performance >= 80 ? 0x00ff88 : 
                      performance >= 60 ? 0xffaa00 : 
                      performance >= 40 ? 0xff6600 : 0xff4444;

  return (
    <group position={position}>
      {/* Section Background */}
      <Box
        ref={sectionRef}
        args={[size[0], style.height, size[1]]}
      >
        <meshStandardMaterial
          color={new THREE.Color(style.color)}
          transparent
          opacity={style.opacity}
          roughness={0.3}
          metalness={0.1}
        />
      </Box>

      {/* Content Text - only visible when loaded */}
      {loaded && (
        <Text
          position={[0, 0, size[1] / 2 + 0.01]}
          fontSize={0.3}
          color={performance >= 60 ? "white" : "#666666"}
          anchorX="center"
          anchorY="middle"
          maxWidth={size[0] - 0.5}
        >
          {content}
        </Text>
      )}

      {/* Issue Indicators - visual problems */}
      {loaded && issues.length > 0 && (
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

      {/* Performance Glow - visual feedback */}
      {loaded && performance >= 80 && (
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

// Website Viewport - The actual website container
function WebsiteViewport({ websiteData, isLoading, isSimulating }: { 
  websiteData: any; 
  isLoading: boolean; 
  isSimulating: boolean; 
}) {
  const viewportRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (viewportRef.current) {
      const time = state.clock.elapsedTime;
      
      // Subtle floating effect
      viewportRef.current.position.y = Math.sin(time * 0.3) * 0.05;
      
      // Simulation transformation
      if (isSimulating) {
        viewportRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
        viewportRef.current.scale.lerp(new THREE.Vector3(1.05, 1.05, 1.05), 0.01);
      }
    }
  });

  if (!websiteData) return null;

  return (
    <group ref={viewportRef} position={[0, 0, 0]}>
      {/* Website Container */}
      <Box args={[10, 8, 0.5]} position={[0, 0, -0.3]}>
        <meshStandardMaterial
          color={new THREE.Color(0x1a1a2e)}
          transparent
          opacity={0.8}
        />
      </Box>

      {/* Header Section */}
      <VisualWebsiteSection
        position={[0, 3, 0]}
        size={[9, 0.5]}
        content={websiteData.header || "Website Header"}
        type="header"
        performance={websiteData.headerPerformance || 70}
        issues={websiteData.headerIssues || []}
        isLoading={isLoading}
        isSimulating={isSimulating}
      />

      {/* Hero Section */}
      <VisualWebsiteSection
        position={[0, 1.5, 0]}
        size={[9, 0.5]}
        content={websiteData.hero || "Hero Section - Main Content"}
        type="hero"
        performance={websiteData.heroPerformance || 60}
        issues={websiteData.heroIssues || []}
        isLoading={isLoading}
        isSimulating={isSimulating}
      />

      {/* Content Sections */}
      <VisualWebsiteSection
        position={[-3, -0.5, 0]}
        size={[4, 0.5]}
        content={websiteData.content1 || "Content Area 1"}
        type="content"
        performance={websiteData.contentPerformance || 80}
        issues={websiteData.contentIssues || []}
        isLoading={isLoading}
        isSimulating={isSimulating}
      />

      <VisualWebsiteSection
        position={[3, -0.5, 0]}
        size={[4, 0.5]}
        content={websiteData.content2 || "Content Area 2"}
        type="content"
        performance={websiteData.contentPerformance || 75}
        issues={websiteData.contentIssues || []}
        isLoading={isLoading}
        isSimulating={isSimulating}
      />

      {/* Card Sections */}
      <VisualWebsiteSection
        position={[-3, -2.5, 0]}
        size={[4, 0.5]}
        content={websiteData.card1 || "Feature Card 1"}
        type="card"
        performance={websiteData.cardPerformance || 85}
        issues={websiteData.cardIssues || []}
        isLoading={isLoading}
        isSimulating={isSimulating}
      />

      <VisualWebsiteSection
        position={[3, -2.5, 0]}
        size={[4, 0.5]}
        content={websiteData.card2 || "Feature Card 2"}
        type="card"
        performance={websiteData.cardPerformance || 90}
        issues={websiteData.cardIssues || []}
        isLoading={isLoading}
        isSimulating={isSimulating}
      />

      {/* Footer */}
      <VisualWebsiteSection
        position={[0, -4, 0]}
        size={[9, 0.5]}
        content={websiteData.footer || "Website Footer"}
        type="footer"
        performance={websiteData.footerPerformance || 65}
        issues={websiteData.footerIssues || []}
        isLoading={isLoading}
        isSimulating={isSimulating}
      />
    </group>
  );
}

// Main Scene
function InteractiveWebsiteScene({ 
  websiteData, 
  isLoading, 
  isSimulating 
}: { 
  websiteData: any; 
  isLoading: boolean; 
  isSimulating: boolean; 
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
      
      <WebsiteViewport 
        websiteData={websiteData} 
        isLoading={isLoading}
        isSimulating={isSimulating}
      />
      
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

// Minimal Side Panel - NOT the main focus
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
          <div className="bg-black/60 backdrop-blur-md rounded-lg p-4 border border-cyan-500/30 w-64">
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

// AI Chat Interface - Floating input
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
const InteractiveWebsiteVerse: React.FC = () => {
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
      // Simulate website analysis with visual loading
      await new Promise(resolve => setTimeout(resolve, 4000));
      
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
      // Simulate backend calculation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update website data based on simulation - VISUAL IMPROVEMENTS
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
          <p className="text-cyan-200 mb-8">Entering interactive website experience...</p>
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
      {/* 3D Canvas - MAIN VISUAL ELEMENT */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
          <Suspense fallback={null}>
            <InteractiveWebsiteScene
              websiteData={websiteData}
              isLoading={isLoading}
              isSimulating={isSimulating}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* URL Input - ONLY when no website loaded */}
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
                  if (e.key === 'Enter' && !isLoading) {
                    analyzeWebsite();
                  }
                }}
              />
              <button
                onClick={analyzeWebsite}
                disabled={isLoading}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Loading
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Load
                  </>
                )}
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-3 text-center">
              Watch how your website loads and behaves in real-time
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="absolute top-4 left-4 text-cyan-400 font-mono text-sm bg-black/60 p-3 rounded">
        <div>WSV - Interactive Website Verse</div>
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
            Recalculating website behavior...
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3 }}
              />
            </div>
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
            Enter a website URL to watch it load and behave in real-time
          </div>
          <div className="text-xs text-cyan-400">
            See performance issues as visual behavior • Ask AI to simulate improvements
          </div>
        </div>
      )}

      {/* Controls Help */}
      {websiteData && !isSimulating && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-cyan-300 text-sm mb-1">
            🖱️ Drag to rotate • Scroll to zoom • Watch website behavior
          </div>
          <div className="text-xs text-cyan-400">
            Ask AI: "What if I improve speed?" or "How will adding content help?"
          </div>
        </div>
      )}

      {/* AI Chat Interface */}
      <AIChatInterface onQuestion={handleSimulationQuestion} isVisible={showChat} />

      {/* Minimal Side Panel - SECONDARY */}
      <MinimalSidePanel data={websiteData || {}} isVisible={showPanel} />
    </div>
  );
};

export default InteractiveWebsiteVerse;
