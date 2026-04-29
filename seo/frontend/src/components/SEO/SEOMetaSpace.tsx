import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Line, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle, CheckCircle, X, Loader, Globe, BarChart3, Target, Zap, Activity, Layers, Eye } from 'lucide-react';

// Holographic Page Node Component
function HolographicPageNode({ page, position, onClick, onHover, isSelected, isHovered, worldStability }: {
  page: any;
  position: [number, number, number];
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  isSelected: boolean;
  isHovered: boolean;
  worldStability: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const pulseRef = useRef(0);

  // Calculate holographic color based on SEO score
  const getHoloColor = (score: number) => {
    if (score >= 80) return new THREE.Color(0x00ff88); // Green hologram
    if (score >= 60) return new THREE.Color(0xffaa00); // Amber hologram
    if (score >= 40) return new THREE.Color(0xff4444); // Red hologram
    return new THREE.Color(0x8888ff); // Blue hologram
  };

  // Calculate size based on word count and importance
  const getNodeSize = (wordCount: number, depth: number) => {
    const baseSize = 0.8;
    const contentScale = Math.min(wordCount / 1500, 0.4);
    const depthScale = Math.max(0.6, 1 - depth * 0.15);
    return baseSize + contentScale * depthScale;
  };

  useFrame((state) => {
    if (meshRef.current) {
      pulseRef.current += 0.02;
      
      // Orbital floating motion
      const time = state.clock.elapsedTime;
      const orbitRadius = 0.3;
      meshRef.current.position.x = position[0] + Math.sin(time + position[0]) * orbitRadius;
      meshRef.current.position.y = position[1] + Math.cos(time * 1.3 + position[1]) * orbitRadius * 0.5;
      meshRef.current.position.z = position[2] + Math.sin(time * 0.7 + position[2]) * orbitRadius;
      
      // Gentle rotation
      meshRef.current.rotation.y = time * 0.5;
      
      // Pulse effect based on SEO health
      const pulseIntensity = page.seo_score / 100;
      const scale = 1 + Math.sin(pulseRef.current * 2) * 0.05 * pulseIntensity;
      
      // Hover and selection effects
      const targetScale = (hovered || isHovered) ? 1.3 : (isSelected ? 1.15 : 1) * scale;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Glitch effect for low SEO scores
      if (page.seo_score < 50 && worldStability < 0.7) {
        const glitchAmount = (1 - page.seo_score / 50) * (1 - worldStability) * 0.1;
        meshRef.current.position.x += (Math.random() - 0.5) * glitchAmount;
        meshRef.current.position.y += (Math.random() - 0.5) * glitchAmount;
      }
    }
  });

  return (
    <group position={position}>
      {/* Holographic Card */}
      <Box
        ref={meshRef}
        args={[getNodeSize(page.word_count, page.depth || 0), 0.1, getNodeSize(page.word_count, page.depth || 0)]}
        onClick={onClick}
        onPointerOver={() => {
          setHovered(true);
          onHover(true);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(false);
        }}
      >
        <meshStandardMaterial
          color={getHoloColor(page.seo_score)}
          emissive={getHoloColor(page.seo_score)}
          emissiveIntensity={isSelected ? 0.6 : 0.3}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.8}
        />
      </Box>
      
      {/* Holographic Glow */}
      <Sphere args={[getNodeSize(page.word_count, page.depth || 0) * 0.7, 16, 16]}>
        <meshBasicMaterial
          color={getHoloColor(page.seo_score)}
          transparent
          opacity={0.1}
        />
      </Sphere>
      
      {/* SEO Score Hologram */}
      <Text
        position={[0, 0.4, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/holographic.woff"
      >
        {page.seo_score}%
      </Text>
      
      {/* Page URL Hologram */}
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.15}
        color="rgba(255,255,255,0.8)"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {page.url}
      </Text>
    </group>
  );
}

// Website Core Component
function WebsiteCore({ siteData, worldStability }: { siteData: any; worldStability: number }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef(0);

  useFrame((state) => {
    if (coreRef.current) {
      pulseRef.current += 0.03;
      
      // Core pulsing based on overall SEO health
      const avgScore = siteData.pages?.reduce((sum: number, p: any) => sum + p.seo_score, 0) / (siteData.pages?.length || 1);
      const pulseIntensity = avgScore / 100;
      
      const scale = 1 + Math.sin(pulseRef.current) * 0.2 * pulseIntensity * worldStability;
      coreRef.current.scale.set(scale, scale, scale);
      
      // Core rotation
      coreRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      
      // Glitch effect for poor overall health
      if (avgScore < 60 && worldStability < 0.7) {
        const glitchAmount = (1 - avgScore / 60) * (1 - worldStability) * 0.05;
        coreRef.current.rotation.x += (Math.random() - 0.5) * glitchAmount;
        coreRef.current.rotation.z += (Math.random() - 0.5) * glitchAmount;
      }
    }
  });

  const avgScore = siteData.pages?.reduce((sum: number, p: any) => sum + p.seo_score, 0) / (siteData.pages?.length || 1);
  const coreColor = avgScore >= 80 ? 0x00ff88 : avgScore >= 60 ? 0xffaa00 : avgScore >= 40 ? 0xff4444 : 0x8888ff;

  return (
    <group position={[0, 0, 0]}>
      {/* Central Core */}
      <Sphere ref={coreRef} args={[1.5, 32, 32]}>
        <meshStandardMaterial
          color={new THREE.Color(coreColor)}
          emissive={new THREE.Color(coreColor)}
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.9}
        />
      </Sphere>
      
      {/* Energy Waves */}
      {[...Array(3)].map((_, i) => (
        <Sphere key={i} args={[1.5 + i * 0.5, 32, 32]}>
          <meshBasicMaterial
            color={new THREE.Color(coreColor)}
            transparent
            opacity={0.1 - i * 0.03}
          />
        </Sphere>
      ))}
    </group>
  );
}

// Energy Stream Component
function EnergyStream({ start, end, isBroken, strength }: {
  start: [number, number, number];
  end: [number, number, number];
  isBroken: boolean;
  strength: number;
}) {
  const streamRef = useRef<THREE.Line>(null);
  
  useFrame((state) => {
    if (streamRef.current) {
      // Animated flow effect
      const time = state.clock.elapsedTime;
      const flowSpeed = strength * 2;
      
      if (isBroken) {
        // Glitch effect for broken links
        streamRef.current.material.opacity = 0.3 + Math.sin(time * 10) * 0.2;
      } else {
        // Smooth energy flow
        streamRef.current.material.opacity = 0.6 + Math.sin(time * flowSpeed) * 0.2;
      }
    }
  });

  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const streamColor = isBroken ? 0xff4444 : 0x00ffff;

  return (
    <Line
      ref={streamRef}
      points={points}
      color={new THREE.Color(streamColor)}
      lineWidth={isBroken ? 3 : 2}
      transparent
      opacity={0.6}
    />
  );
}

// Scanner Wave Effect
function ScannerWave({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const waveRef = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState(-10);

  useFrame((state) => {
    if (active && waveRef.current) {
      setPosition(prev => {
        const newPos = prev + 0.3;
        if (newPos > 10) {
          onComplete();
          return -10;
        }
        return newPos;
      });
      
      waveRef.current.position.y = position;
    }
  });

  if (!active) return null;

  return (
    <mesh ref={waveRef} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial color={0x00ffff} transparent opacity={0.3} />
    </mesh>
  );
}

// Main Meta-Space Scene
function SEOMetaSpaceScene({ data, selectedPage, hoveredPage, onPageClick, onPageHover, isScanning, worldStability }: {
  data: any;
  selectedPage: any;
  hoveredPage: any;
  onPageClick: (page: any) => void;
  onPageHover: (page: any) => void;
  isScanning: boolean;
  worldStability: number;
}) {
  const { camera } = useThree();

  useEffect(() => {
    // Set cinematic camera position
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  if (!data || !data.pages) return null;

  // Calculate positions for pages in orbital pattern
  const pagePositions = new Map<string, [number, number, number]>();
  const maxDepth = Math.max(...data.pages.map((p: any) => p.depth || 0));

  data.pages.forEach((page: any, index: number) => {
    const depth = page.depth || 0;
    const angle = (index / data.pages.length) * Math.PI * 2;
    const radius = 2.5 + depth * 1.5;
    
    pagePositions.set(page.id, [
      Math.cos(angle) * radius,
      depth * 1.5 - maxDepth * 0.75,
      Math.sin(angle) * radius
    ] as [number, number, number]);
  });

  return (
    <>
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} color={0x00ffff} />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color={0xff00ff} />
      <pointLight position={[0, 0, 0]} intensity={0.6} color={worldStability > 0.7 ? 0x00ff88 : 0xff4444} />

      {/* Scanner Wave */}
      <ScannerWave active={isScanning} onComplete={() => {}} />

      {/* Website Core */}
      <WebsiteCore siteData={data} worldStability={worldStability} />

      {/* Holographic Page Nodes */}
      {data.pages.map((page: any) => (
        <HolographicPageNode
          key={page.id}
          page={page}
          position={pagePositions.get(page.id) || [0, 0, 0]}
          onClick={() => onPageClick(page)}
          onHover={(hovered) => onPageHover(hovered ? page : null)}
          isSelected={selectedPage?.id === page.id}
          isHovered={hoveredPage?.id === page.id}
          worldStability={worldStability}
        />
      ))}

      {/* Energy Streams */}
      {data.pages.map((page: any) => {
        const startPos = pagePositions.get(page.id);
        if (!startPos) return null;

        return page.links_to?.map((targetUrl: string, index: number) => {
          const targetPage = data.pages.find((p: any) => p.url === targetUrl);
          if (!targetPage) return null;

          const endPos = pagePositions.get(targetPage.id);
          if (!endPos) return null;

          const isBroken = page.issues?.includes('broken_links');
          const strength = Math.max(0.3, (page.seo_score / 100) * (targetPage.seo_score / 100));

          return (
            <EnergyStream
              key={`${page.id}-${targetPage.id}`}
              start={startPos}
              end={endPos}
              isBroken={isBroken}
              strength={strength}
            />
          );
        });
      })}
    </>
  );
}

// Main Component
const SEOMetaSpace: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [data, setData] = useState<any>(null);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [hoveredPage, setHoveredPage] = useState<any>(null);
  const [error, setError] = useState('');
  const [worldStability, setWorldStability] = useState(1.0);
  const [showAfterState, setShowAfterState] = useState(false);

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setScanning(true);
    setError('');
    setSelectedPage(null);
    setHoveredPage(null);
    setShowAfterState(false);

    try {
      // Ensure URL has protocol
      let targetUrl = url.trim();
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      console.log('🔍 Analyzing URL:', targetUrl);
      
      const response = await fetch(`http://127.0.0.1:5001/api/seo/3d-structure?url=${encodeURIComponent(targetUrl)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
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
      
      // Calculate world stability based on overall SEO health
      const avgScore = result.pages.reduce((sum: number, p: any) => sum + (p.seo_score || 0), 0) / result.pages.length;
      setWorldStability(avgScore / 100);
      
      console.log('🌍 World stability:', avgScore / 100);
      
      // Stop scanning after data arrives
      setTimeout(() => setScanning(false), 2000);
      
    } catch (err: any) {
      console.error('❌ Analysis error:', err);
      setError(err.message || 'Failed to analyze website');
      setData(null);
      setScanning(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleWorldState = () => {
    setShowAfterState(!showAfterState);
    if (showAfterState) {
      // Reset to original state
      const avgScore = data?.pages?.reduce((sum: number, p: any) => sum + p.seo_score, 0) / (data?.pages?.length || 1);
      setWorldStability(avgScore / 100);
    } else {
      // Show optimized state
      setWorldStability(1.0);
    }
  };

  const getIssueIcon = (issue: string) => {
    switch (issue) {
      case 'missing_title':
      case 'missing_meta_description':
      case 'missing_h1':
        return <X className="w-4 h-4 text-red-400" />;
      case 'title_length_issue':
      case 'meta_description_length_issue':
      case 'multiple_h1_tags':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-purple-400" />;
    }
  };

  const testConnection = async () => {
    try {
      console.log('🧪 Testing API connection...');
      const response = await fetch('http://127.0.0.1:5001/api/email/log');
      console.log('📡 Test response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API connection working:', data);
      } else {
        console.log('❌ API connection failed');
      }
    } catch (error) {
      console.error('❌ API connection error:', error);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black overflow-hidden">
      {/* Animated Background */}
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
          transition={{ delay: 0.1 }}
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
                    <Suspense fallback={null}>
                      <SEOMetaSpaceScene
                        data={data}
                        selectedPage={selectedPage}
                        hoveredPage={hoveredPage}
                        onPageClick={setSelectedPage}
                        onPageHover={setHoveredPage}
                        isScanning={scanning}
                        worldStability={showAfterState ? 1.0 : worldStability}
                      />
                      <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={5}
                        maxDistance={30}
                        maxPolarAngle={Math.PI * 0.9}
                        minPolarAngle={Math.PI * 0.1}
                      />
                    </Suspense>
                  </Canvas>
                </div>
              </div>

              {/* Control Panel */}
              <div className="space-y-4">
                {/* World Stability */}
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/30">
                  <h3 className="text-xl font-semibold text-cyan-100 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    World Stability
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-cyan-200">
                      <span>Core Health:</span>
                      <span className="font-semibold">{Math.round(worldStability * 100)}%</span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          worldStability >= 0.8 ? 'bg-cyan-500' :
                          worldStability >= 0.6 ? 'bg-amber-500' :
                          worldStability >= 0.4 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${worldStability * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* World Transform Toggle */}
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/30">
                  <h3 className="text-xl font-semibold text-cyan-100 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    World Transform
                  </h3>
                  <button
                    onClick={toggleWorldState}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    {showAfterState ? 'Show Current State' : 'Show Optimized State'}
                  </button>
                </div>

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
                      {/* URL */}
                      <div>
                        <label className="text-cyan-300 text-sm">Node URL</label>
                        <p className="text-cyan-100 font-mono text-sm">{selectedPage.url}</p>
                      </div>

                      {/* SEO Score */}
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

                      {/* Title */}
                      <div>
                        <label className="text-cyan-300 text-sm">Title Data</label>
                        <p className="text-cyan-100 text-sm">{selectedPage.title || 'Not found'}</p>
                      </div>

                      {/* Meta Description */}
                      <div>
                        <label className="text-cyan-300 text-sm">Meta Description</label>
                        <p className="text-cyan-100 text-sm">{selectedPage.meta_description || 'Not found'}</p>
                      </div>

                      {/* Issues */}
                      {selectedPage.issues && selectedPage.issues.length > 0 && (
                        <div>
                          <label className="text-cyan-300 text-sm">Detected Issues</label>
                          <div className="space-y-2 mt-2">
                            {selectedPage.issues.map((issue: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-cyan-100 text-sm">
                                {getIssueIcon(issue)}
                                <span>{getIssueDescription(issue)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Hovered Node Info */}
                {hoveredPage && hoveredPage.id !== selectedPage?.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/30"
                  >
                    <div className="text-cyan-100">
                      <p className="font-semibold">{hoveredPage.url}</p>
                      <p className="text-sm text-cyan-300">SEO Health: {hoveredPage.seo_score}%</p>
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

export default SEOMetaSpace;
