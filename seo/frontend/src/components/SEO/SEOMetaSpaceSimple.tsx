import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle, Loader, Globe, BarChart3, Target, Layers, Eye } from 'lucide-react';

// Simple Page Node
function PageNode({ page, position, onClick, isSelected }: {
  page: any;
  position: [number, number, number];
  onClick: () => void;
  isSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const getColor = (score: number) => {
    if (score >= 80) return new THREE.Color(0x00ff88);
    if (score >= 60) return new THREE.Color(0xffaa00);
    if (score >= 40) return new THREE.Color(0xff4444);
    return new THREE.Color(0x8888ff);
  };

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.1;
      meshRef.current.rotation.y = time * 0.5;
      
      const scale = isSelected ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[1, 0.2, 1]}
        onClick={onClick}
      >
        <meshStandardMaterial
          color={getColor(page.seo_score)}
          emissive={getColor(page.seo_score)}
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </Box>
      
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {page.seo_score}%
      </Text>
      
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.1}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {page.url}
      </Text>
    </group>
  );
}

// Central Core
function CentralCore({ avgScore }: { avgScore: number }) {
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (coreRef.current) {
      const time = state.clock.elapsedTime;
      const scale = 1 + Math.sin(time * 2) * 0.1;
      coreRef.current.scale.set(scale, scale, scale);
      coreRef.current.rotation.y = time * 0.3;
    }
  });

  const coreColor = avgScore >= 80 ? 0x00ff88 : avgScore >= 60 ? 0xffaa00 : avgScore >= 40 ? 0xff4444 : 0x8888ff;

  return (
    <Sphere ref={coreRef} args={[1, 32, 32]}>
      <meshStandardMaterial
        color={new THREE.Color(coreColor)}
        emissive={new THREE.Color(coreColor)}
        emissiveIntensity={0.8}
        roughness={0.1}
        metalness={0.9}
      />
    </Sphere>
  );
}

// Connection Line
function ConnectionLine({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  return (
    <Line
      points={points}
      color={new THREE.Color(0x00ffff)}
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  );
}

// Main Scene
function MetaSpaceScene({ data, selectedPage, onPageClick }: {
  data: any;
  selectedPage: any;
  onPageClick: (page: any) => void;
}) {
  if (!data || !data.pages) return null;

  const pagePositions = new Map<string, [number, number, number]>();
  data.pages.forEach((page: any, index: number) => {
    const angle = (index / data.pages.length) * Math.PI * 2;
    const radius = 3 + (page.depth || 0) * 1.5;
    
    pagePositions.set(page.id, [
      Math.cos(angle) * radius,
      (page.depth || 0) * 1.5,
      Math.sin(angle) * radius
    ] as [number, number, number]);
  });

  const avgScore = data.pages.reduce((sum: number, p: any) => sum + p.seo_score, 0) / data.pages.length;

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} color={0x00ffff} />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color={0xff00ff} />
      <pointLight position={[0, 0, 0]} intensity={0.6} color={avgScore >= 60 ? 0x00ff88 : 0xff4444} />

      <CentralCore avgScore={avgScore} />

      {data.pages.map((page: any) => (
        <PageNode
          key={page.id}
          page={page}
          position={pagePositions.get(page.id) || [0, 0, 0]}
          onClick={() => onPageClick(page)}
          isSelected={selectedPage?.id === page.id}
        />
      ))}

      {data.pages.map((page: any) => {
        const startPos = pagePositions.get(page.id);
        if (!startPos) return null;

        return page.links_to?.map((targetUrl: string, index: number) => {
          const targetPage = data.pages.find((p: any) => p.url === targetUrl);
          if (!targetPage) return null;

          const endPos = pagePositions.get(targetPage.id);
          if (!endPos) return null;

          return (
            <ConnectionLine
              key={`${page.id}-${targetPage.id}`}
              start={startPos}
              end={endPos}
            />
          );
        });
      })}
    </>
  );
}

// Main Component
const SEOMetaSpaceSimple: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setSelectedPage(null);

    try {
      let targetUrl = url.trim();
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      console.log('🔍 Analyzing URL:', targetUrl);
      
      const response = await fetch(`http://127.0.0.1:5001/api/seo/3d-structure?url=${encodeURIComponent(targetUrl)}`);
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📊 Received data:', result);
      
      if (!result || !result.pages || !Array.isArray(result.pages) || result.pages.length === 0) {
        throw new Error('No pages found or invalid data received');
      }
      
      setData(result);
      console.log('✅ Meta-Space loaded with', result.pages.length, 'pages');
      
    } catch (err: any) {
      console.error('❌ Analysis error:', err);
      setError(err.message || 'Failed to analyze website');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_70%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4 flex items-center justify-center gap-3">
            <Layers className="w-10 h-10 text-cyan-400" />
            SEO META-SPACE
          </h1>
          <p className="text-cyan-200 text-lg">
            Immersive Metaverse-Style Website Visualization Engine
          </p>
        </motion.div>

        {/* URL Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/30 shadow-2xl">
            <div className="flex gap-3">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Enter website URL to enter meta-space..."
                className="flex-1 px-4 py-3 bg-black/60 border border-cyan-500/50 rounded-xl text-cyan-100 placeholder-cyan-400/50 focus:outline-none focus:border-cyan-400 focus:bg-black/80 transition-all"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading || !url.trim()}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
                {loading ? 'Scanning...' : 'Enter Meta-Space'}
              </button>
              <button
                onClick={() => setUrl('https://example.com')}
                className="px-4 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all"
              >
                Test
              </button>
            </div>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm"
              >
                {error}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Meta-Space Visualization */}
        <AnimatePresence mode="wait">
          {data ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              {/* 3D Meta-Space */}
              <div className="lg:col-span-3">
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/30 h-[600px] shadow-2xl">
                  <Canvas camera={{ position: [8, 6, 8], fov: 60 }}>
                    <Suspense fallback={
                      <div className="flex items-center justify-center h-full">
                        <div className="text-cyan-400 text-xl">Loading Meta-Space...</div>
                      </div>
                    }>
                      <MetaSpaceScene
                        data={data}
                        selectedPage={selectedPage}
                        onPageClick={setSelectedPage}
                      />
                      <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={5}
                        maxDistance={30}
                      />
                    </Suspense>
                  </Canvas>
                </div>
              </div>

              {/* Control Panel */}
              <div className="space-y-4">
                {/* Meta-Space Stats */}
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/30">
                  <h3 className="text-xl font-semibold text-cyan-100 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    Meta-Space Data
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-cyan-200">
                      <span>Data Nodes:</span>
                      <span className="font-semibold">{data.pages?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-cyan-200">
                      <span>Avg SEO Score:</span>
                      <span className="font-semibold">
                        {data.pages?.length ? 
                          Math.round(data.pages.reduce((sum: number, p: any) => sum + p.seo_score, 0) / data.pages.length) 
                          : 0}%
                        </span>
                    </div>
                    <div className="flex justify-between text-cyan-200">
                      <span>Energy Streams:</span>
                      <span className="font-semibold">
                        {data.pages?.reduce((sum: number, p: any) => sum + (p.links_to?.length || 0), 0) || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selected Node Details */}
                {selectedPage && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/30"
                  >
                    <h3 className="text-xl font-semibold text-cyan-100 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-cyan-400" />
                      Node Analysis
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-cyan-300 text-sm">Node URL</label>
                        <p className="text-cyan-100 font-mono text-sm">{selectedPage.url}</p>
                      </div>

                      <div>
                        <label className="text-cyan-300 text-sm">SEO Health</label>
                        <div className="flex items-center gap-2">
                          <div className={`w-full bg-black/60 rounded-full h-3`}>
                            <div
                              className={`h-3 rounded-full transition-all ${
                                selectedPage.seo_score >= 80 ? 'bg-cyan-500' :
                                selectedPage.seo_score >= 60 ? 'bg-amber-500' :
                                selectedPage.seo_score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${selectedPage.seo_score}%` }}
                            />
                          </div>
                          <span className="text-cyan-100 font-semibold">{selectedPage.seo_score}%</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-cyan-300 text-sm">Title Data</label>
                        <p className="text-cyan-100 text-sm">{selectedPage.title || 'Not found'}</p>
                      </div>

                      {selectedPage.issues && selectedPage.issues.length > 0 && (
                        <div>
                          <label className="text-cyan-300 text-sm">Detected Issues</label>
                          <div className="space-y-2 mt-2">
                            {selectedPage.issues.map((issue: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-cyan-100 text-sm">
                                <AlertCircle className="w-4 h-4 text-red-400" />
                                <span>{issue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="max-w-md mx-auto">
                <Globe className="w-20 h-20 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-cyan-100 mb-2">
                  Ready to Enter Meta-Space
                </h3>
                <p className="text-cyan-200">
                  Enter a website URL above to visualize its SEO structure as an immersive digital world
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SEOMetaSpaceSimple;
