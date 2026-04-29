import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Cylinder, Sphere, Line, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle, Loader, Globe, BarChart3, Target, Layers, Eye, TreePine, Zap, Activity } from 'lucide-react';

// Tree Branch Component
function TreeBranch({ page, position, parentPosition, depth, onClick, onHover, isSelected, isHovered }: {
  page: any;
  position: [number, number, number];
  parentPosition: [number, number, number];
  depth: number;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  isSelected: boolean;
  isHovered: boolean;
}) {
  const branchRef = useRef<THREE.Mesh>(null);
  const [particles, setParticles] = useState<THREE.Vector3[]>([]);

  // Calculate branch properties based on SEO data
  const getBranchThickness = (score: number, depth: number) => {
    const baseThickness = Math.max(0.1, (100 - score) / 100); // Lower score = thinner
    const depthFactor = Math.max(0.3, 1 - depth * 0.2); // Deeper pages = thinner
    return baseThickness * depthFactor;
  };

  const getBranchColor = (score: number) => {
    if (score >= 80) return new THREE.Color(0x00ff88); // Healthy green
    if (score >= 60) return new THREE.Color(0xffaa00); // Warning yellow
    if (score >= 40) return new THREE.Color(0xff6600); // Unhealthy orange
    return new THREE.Color(0x8B4513); // Dead brown
  };

  const thickness = getBranchThickness(page.seo_score, depth);
  const color = getBranchColor(page.seo_score);
  const hasIssues = page.issues && page.issues.length > 0;
  const isBroken = page.issues?.includes('broken_links');

  useFrame((state) => {
    if (branchRef.current) {
      const time = state.clock.elapsedTime;
      
      // Gentle swaying like real branches
      const swayAmount = Math.sin(time * 0.5 + position[0]) * 0.02;
      branchRef.current.rotation.z = swayAmount;
      
      // Growth animation for healthy branches
      if (page.seo_score >= 60) {
        const growthPulse = Math.sin(time * 2) * 0.02;
        branchRef.current.scale.y = 1 + growthPulse;
      }
      
      // Hover effect
      const targetScale = (hovered || isHovered) ? 1.1 : (isSelected ? 1.05 : 1);
      branchRef.current.scale.x = THREE.MathUtils.lerp(branchRef.current.scale.x, targetScale, 0.1);
      branchRef.current.scale.z = THREE.MathUtils.lerp(branchRef.current.scale.z, targetScale, 0.1);
    }

    // Update particles for traffic flow
    if (page.word_count > 500 && Math.random() < 0.1) {
      setParticles(prev => {
        const newParticles = [...prev];
        if (newParticles.length < 10) {
          newParticles.push(new THREE.Vector3(
            parentPosition[0] + (position[0] - parentPosition[0]) * Math.random(),
            parentPosition[1] + (position[1] - parentPosition[1]) * Math.random(),
            parentPosition[2] + (position[2] - parentPosition[2]) * Math.random()
          ));
        }
        return newParticles.filter(p => {
          p.y += 0.05;
          return p.y < position[1];
        });
      });
    }
  });

  return (
    <group position={position}>
      {/* Main Branch */}
      <Cylinder
        ref={branchRef}
        args={[thickness, thickness, Math.sqrt(
          Math.pow(position[0] - parentPosition[0], 2) + 
          Math.pow(position[1] - parentPosition[1], 2) + 
          Math.pow(position[2] - parentPosition[2], 2)
        ), 8]}
        onClick={onClick}
        onPointerOver={() => onHover(true)}
        onPointerOut={() => onHover(false)}
      >
        <meshStandardMaterial
          color={color}
          roughness={hasIssues ? 0.9 : 0.3}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </Cylinder>

      {/* Cracks for damaged branches */}
      {hasIssues && (
        <Line
          points={[
            new THREE.Vector3(-thickness * 0.5, 0, 0),
            new THREE.Vector3(thickness * 0.5, 0, 0)
          ]}
          color={new THREE.Color(0x333333)}
          lineWidth={1}
        />
      )}

      {/* Energy Veins (Internal Links) */}
      {!isBroken && page.links_to && page.links_to.length > 0 && (
        <Cylinder
          args={[thickness * 0.3, thickness * 0.3, Math.sqrt(
            Math.pow(position[0] - parentPosition[0], 2) + 
            Math.pow(position[1] - parentPosition[1], 2) + 
            Math.pow(position[2] - parentPosition[2], 2)
          ), 6]}
          position={[0, 0, 0]}
        >
          <meshBasicMaterial
            color={new THREE.Color(0x00ffff)}
            transparent
            opacity={0.3}
          />
        </Cylinder>
      )}

      {/* Page Node (Leaf/Flower) */}
      <Sphere args={[0.3, 8, 8]} position={[0, Math.sqrt(
        Math.pow(position[0] - parentPosition[0], 2) + 
        Math.pow(position[1] - parentPosition[1], 2) + 
        Math.pow(position[2] - parentPosition[2], 2)
      ) / 2, 0]}>
        <meshStandardMaterial
          color={page.seo_score >= 80 ? new THREE.Color(0x00ff00) : 
                page.seo_score >= 60 ? new THREE.Color(0xffff00) : 
                new THREE.Color(0xff4444)}
          emissive={page.seo_score >= 80 ? new THREE.Color(0x00ff00) : 
                   page.seo_score >= 60 ? new THREE.Color(0xffff00) : 
                   new THREE.Color(0xff4444)}
          emissiveIntensity={0.5}
        />
      </Sphere>

      {/* SEO Score Display */}
      <Text
        position={[0, Math.sqrt(
          Math.pow(position[0] - parentPosition[0], 2) + 
          Math.pow(position[1] - parentPosition[1], 2) + 
          Math.pow(position[2] - parentPosition[2])
        ) / 2 + 0.5, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {page.seo_score}%
      </Text>

      {/* Traffic Particles */}
      {particles.map((particle, index) => (
        <Sphere key={index} args={[0.02, 4, 4]} position={particle}>
          <meshBasicMaterial color={new THREE.Color(0x00ffff)} />
        </Sphere>
      ))}
    </group>
  );
}

// Tree Trunk (Homepage)
function TreeTrunk({ homepage, onPageClick }: { homepage: any; onPageClick: () => void }) {
  const trunkRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (trunkRef.current) {
      const time = state.clock.elapsedTime;
      
      // Subtle breathing animation
      const breathe = Math.sin(time * 0.5) * 0.02;
      trunkRef.current.scale.x = 1 + breathe;
      trunkRef.current.scale.z = 1 + breathe;
      
      // Gentle rotation
      trunkRef.current.rotation.y = time * 0.1;
    }
  });

  const trunkColor = homepage.seo_score >= 80 ? new THREE.Color(0x00ff88) : 
                     homepage.seo_score >= 60 ? new THREE.Color(0xffaa00) : 
                     homepage.seo_score >= 40 ? new THREE.Color(0xff6600) : 
                     new THREE.Color(0x8B4513);

  return (
    <group position={[0, 0, 0]}>
      <Cylinder
        ref={trunkRef}
        args={[0.8, 1.0, 4, 8]}
        onClick={onPageClick}
      >
        <meshStandardMaterial
          color={trunkColor}
          roughness={0.4}
          metalness={0.1}
        />
      </Cylinder>

      {/* Tree Core */}
      <Sphere args={[0.6, 16, 16]} position={[0, 2, 0]}>
        <meshStandardMaterial
          color={trunkColor}
          emissive={trunkColor}
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.3}
        />
      </Sphere>

      {/* Homepage Label */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {homepage.title || 'Homepage'}
      </Text>

      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        SEO: {homepage.seo_score}%
      </Text>
    </group>
  );
}

// Growth Animation
function TreeGrowth({ isGrowing, onComplete }: { isGrowing: boolean; onComplete: () => void }) {
  const growthRef = useRef<THREE.Mesh>(null);
  const [growthProgress, setGrowthProgress] = useState(0);

  useFrame((state) => {
    if (isGrowing && growthRef.current) {
      setGrowthProgress(prev => {
        const newProgress = Math.min(prev + 0.02, 1);
        if (newProgress >= 1) {
          onComplete();
        }
        return newProgress;
      });
      
      growthRef.current.scale.y = growthProgress;
      growthRef.current.position.y = -2 + growthProgress * 2;
    }
  });

  if (!isGrowing) return null;

  return (
    <Cylinder
      ref={growthRef}
      args={[0.1, 0.1, 4, 8]}
      position={[0, -2, 0]}
    >
      <meshBasicMaterial color={new THREE.Color(0x00ff00)} transparent opacity={0.5} />
    </Cylinder>
  );
}

// Main Digital Tree Scene
function DigitalTreeScene({ data, selectedPage, hoveredPage, onPageClick, onPageHover, isGrowing }: {
  data: any;
  selectedPage: any;
  hoveredPage: any;
  onPageClick: (page: any) => void;
  onPageHover: (page: any) => void;
  isGrowing: boolean;
}) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set([10, 8, 10]);
    camera.lookAt(0, 2, 0);
  }, [camera]);

  if (!data || !data.pages) return null;

  // Find homepage (depth 0)
  const homepage = data.pages.find(p => (p.depth || 0) === 0) || data.pages[0];
  
  // Build tree structure
  const pagePositions = new Map<string, [number, number, number]>();
  const trunkPosition: [number, number, number] = [0, 2, 0];

  // Position pages in tree structure
  data.pages.forEach((page: any, index: number) => {
    const depth = page.depth || 0;
    const angle = (index / data.pages.length) * Math.PI * 2;
    const radius = 2 + depth * 1.5;
    const height = 2 + depth * 1.5;
    
    pagePositions.set(page.id, [
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    ] as [number, number, number]);
  });

  return (
    <>
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} color={0x00ff88} />
      <pointLight position={[-10, 10, -10]} intensity={0.4} color={0xff8800} />
      <pointLight position={[0, 5, 0]} intensity={0.6} color={0x00ffff} />

      {/* Ground */}
      <Box args={[20, 0.5, 20]} position={[0, -0.25, 0]}>
        <meshStandardMaterial color={new THREE.Color(0x1a1a1a)} />
      </Box>

      {/* Growth Animation */}
      <TreeGrowth isGrowing={isGrowing} onComplete={() => {}} />

      {/* Tree Trunk (Homepage) */}
      <TreeTrunk homepage={homepage} onPageClick={() => onPageClick(homepage)} />

      {/* Tree Branches (Pages) */}
      {data.pages.filter(p => (p.depth || 0) > 0).map((page: any) => {
        const position = pagePositions.get(page.id);
        if (!position) return null;

        // Find parent (page at depth-1)
        const parentPage = data.pages.find(p => (p.depth || 0) === (page.depth || 0) - 1);
        const parentPosition = parentPage ? pagePositions.get(parentPage.id) : trunkPosition;

        return (
          <TreeBranch
            key={page.id}
            page={page}
            position={position}
            parentPosition={parentPosition || trunkPosition}
            depth={page.depth || 0}
            onClick={() => onPageClick(page)}
            onHover={(hovered) => onPageHover(hovered ? page : null)}
            isSelected={selectedPage?.id === page.id}
            isHovered={hoveredPage?.id === page.id}
          />
        );
      })}
    </>
  );
}

// Main Component
const SEODigitalTree: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [growing, setGrowing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [hoveredPage, setHoveredPage] = useState<any>(null);
  const [error, setError] = useState('');
  const [apiTest, setApiTest] = useState('');

  // Test API connection on mount
  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5001/api/email/log');
        if (response.ok) {
          setApiTest('✅ API Connection Working');
        } else {
          setApiTest('❌ API Connection Failed');
        }
      } catch (err) {
        setApiTest('❌ API Connection Error');
      }
    };
    testAPI();
  }, []);

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setGrowing(true);
    setError('');
    setSelectedPage(null);
    setHoveredPage(null);

    try {
      let targetUrl = url.trim();
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      console.log('🌱 Growing Digital Tree for:', targetUrl);
      
      // Add CORS headers and better error handling
      const response = await fetch(`http://127.0.0.1:5001/api/seo/3d-structure?url=${encodeURIComponent(targetUrl)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors'
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🌳 Tree data received:', result);
      
      if (!result || !result.pages || !Array.isArray(result.pages) || result.pages.length === 0) {
        throw new Error('No pages found or invalid data received');
      }
      
      setData(result);
      console.log('✅ Digital Tree grown with', result.pages.length, 'branches');
      
      // Stop growing animation after data loads
      setTimeout(() => setGrowing(false), 3000);
      
    } catch (err: any) {
      console.error('❌ Tree growth error:', err);
      setError(err.message || 'Failed to analyze website');
      setData(null);
      setGrowing(false);
    } finally {
      setLoading(false);
    }
  };

  const getTreeHealth = () => {
    if (!data?.pages) return 0;
    const avgScore = data.pages.reduce((sum: number, p: any) => sum + p.seo_score, 0) / data.pages.length;
    return avgScore;
  };

  const getHealthLabel = () => {
    const health = getTreeHealth();
    if (health >= 80) return 'Thriving';
    if (health >= 60) return 'Healthy';
    if (health >= 40) return 'Struggling';
    return 'Critical';
  };

  const getHealthColor = () => {
    const health = getTreeHealth();
    if (health >= 80) return 'text-green-400';
    if (health >= 60) return 'text-yellow-400';
    if (health >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950 to-black overflow-hidden">
      {/* Forest Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_70%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-4 flex items-center justify-center gap-3">
            <TreePine className="w-10 h-10 text-green-400" />
            SEO DIGITAL TREE
          </h1>
          <p className="text-green-200 text-lg">
            Your Website as a Living Digital Ecosystem
          </p>
        </motion.div>

        {/* URL Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-green-500/30 shadow-2xl">
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="Enter website URL to grow your digital tree..."
                  className="w-full px-4 py-3 bg-black/60 border border-green-500/50 rounded-xl text-green-100 placeholder-green-400/50 focus:outline-none focus:border-green-400 focus:bg-black/80 transition-all"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading || !url.trim()}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-green-500/25"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Globe className="w-5 h-5" />
                )}
                {loading ? 'Growing...' : 'Grow Tree'}
              </button>
              <button
                onClick={() => setUrl('https://example.com')}
                className="px-4 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all"
              >
                Test
              </button>
            </div>
            
            {/* API Status */}
            <div className="mb-4 p-2 bg-black/60 rounded-lg">
              <div className="text-xs text-green-300 font-mono">{apiTest}</div>
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

        {/* Digital Tree Visualization */}
        <AnimatePresence mode="wait">
          {data ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              {/* 3D Digital Tree */}
              <div className="lg:col-span-3">
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-green-500/30 h-[600px] shadow-2xl">
                  <Canvas camera={{ position: [10, 8, 10], fov: 60 }}>
                    <Suspense fallback={
                      <div className="flex items-center justify-center h-full">
                        <div className="text-green-400 text-xl">Growing Digital Tree...</div>
                      </div>
                    }>
                      <DigitalTreeScene
                        data={data}
                        selectedPage={selectedPage}
                        hoveredPage={hoveredPage}
                        onPageClick={setSelectedPage}
                        onPageHover={setHoveredPage}
                        isGrowing={growing}
                      />
                      <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={8}
                        maxDistance={30}
                        maxPolarAngle={Math.PI * 0.8}
                        minPolarAngle={Math.PI * 0.2}
                      />
                    </Suspense>
                  </Canvas>
                </div>
              </div>

              {/* Tree Health Panel */}
              <div className="space-y-4">
                {/* Tree Health */}
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
                  <h3 className="text-xl font-semibold text-green-100 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    Tree Health
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-green-200">
                      <span>Status:</span>
                      <span className={`font-semibold ${getHealthColor()}`}>{getHealthLabel()}</span>
                    </div>
                    <div className="flex justify-between text-green-200">
                      <span>Overall SEO:</span>
                      <span className="font-semibold">{Math.round(getTreeHealth())}%</span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          getTreeHealth() >= 80 ? 'bg-green-500' :
                          getTreeHealth() >= 60 ? 'bg-yellow-500' :
                          getTreeHealth() >= 40 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${getTreeHealth()}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Tree Structure */}
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
                  <h3 className="text-xl font-semibold text-green-100 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    Tree Structure
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-green-200">
                      <span>Branches:</span>
                      <span className="font-semibold">{data.pages?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-green-200">
                      <span>Max Depth:</span>
                      <span className="font-semibold">
                        {Math.max(...data.pages.map((p: any) => p.depth || 0))} levels
                      </span>
                    </div>
                    <div className="flex justify-between text-green-200">
                      <span>Connections:</span>
                      <span className="font-semibold">
                        {data.pages?.reduce((sum: number, p: any) => sum + (p.links_to?.length || 0), 0) || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selected Branch Details */}
                {selectedPage && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-green-500/30"
                  >
                    <h3 className="text-xl font-semibold text-green-100 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-400" />
                      Branch Analysis
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-green-300 text-sm">Branch URL</label>
                        <p className="text-green-100 font-mono text-sm">{selectedPage.url}</p>
                      </div>

                      <div>
                        <label className="text-green-300 text-sm">Branch Health</label>
                        <div className="flex items-center gap-2">
                          <div className={`w-full bg-black/60 rounded-full h-3`}>
                            <div
                              className={`h-3 rounded-full transition-all ${
                                selectedPage.seo_score >= 80 ? 'bg-green-500' :
                                selectedPage.seo_score >= 60 ? 'bg-yellow-500' :
                                selectedPage.seo_score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${selectedPage.seo_score}%` }}
                            />
                          </div>
                          <span className="text-green-100 font-semibold">{selectedPage.seo_score}%</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-green-300 text-sm">Content</label>
                        <p className="text-green-100 text-sm">{selectedPage.title || 'No title'}</p>
                        <p className="text-green-200 text-xs">{selectedPage.word_count} words</p>
                      </div>

                      {selectedPage.issues && selectedPage.issues.length > 0 && (
                        <div>
                          <label className="text-green-300 text-sm">Branch Issues</label>
                          <div className="space-y-2 mt-2">
                            {selectedPage.issues.map((issue: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-green-100 text-sm">
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

                {/* Hovered Branch Info */}
                {hoveredPage && hoveredPage.id !== selectedPage?.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-green-500/30"
                  >
                    <div className="text-green-100">
                      <p className="font-semibold">{hoveredPage.url}</p>
                      <p className="text-sm text-green-300">Branch Health: {hoveredPage.seo_score}%</p>
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
                <TreePine className="w-20 h-20 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-green-100 mb-2">
                  Ready to Grow Your Digital Tree
                </h3>
                <p className="text-green-200">
                  Enter a website URL above to visualize its SEO structure as a living digital ecosystem
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SEODigitalTree;
