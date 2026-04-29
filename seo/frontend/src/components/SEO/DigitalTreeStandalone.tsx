import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle, Loader, Globe, BarChart3, Target, TreePine, Activity } from 'lucide-react';

// Simple Branch Component
function Branch({ position, endPosition, thickness, color, onClick, score }: {
  position: [number, number, number];
  endPosition: [number, number, number];
  thickness: number;
  color: string;
  onClick: () => void;
  score: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const length = Math.sqrt(
    Math.pow(endPosition[0] - position[0], 2) + 
    Math.pow(endPosition[1] - position[1], 2) + 
    Math.pow(endPosition[2] - position[2], 2)
  );

  return (
    <group position={position}>
      <Cylinder
        ref={meshRef}
        args={[thickness, thickness, length, 8]}
        onClick={onClick}
      >
        <meshStandardMaterial
          color={new THREE.Color(color)}
          roughness={0.4}
          metalness={0.1}
        />
      </Cylinder>
      
      {/* Leaf at end */}
      <Sphere
        args={[0.2, 8, 8]}
        position={[
          endPosition[0] - position[0],
          endPosition[1] - position[1],
          endPosition[2] - position[2]
        ]}
      >
        <meshStandardMaterial
          color={new THREE.Color(score >= 80 ? 0x00ff00 : score >= 60 ? 0xffff00 : 0xff4444)}
          emissive={new THREE.Color(score >= 80 ? 0x00ff00 : score >= 60 ? 0xffff00 : 0xff4444)}
          emissiveIntensity={0.5}
        />
      </Sphere>
      
      {/* Score text */}
      <Text
        position={[
          endPosition[0] - position[0],
          endPosition[1] - position[1] + 0.5,
          endPosition[2] - position[2]
        ]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {score}%
      </Text>
    </group>
  );
}

// Tree Trunk
function TreeTrunk({ onClick, score }: { onClick: () => void; score: number }) {
  const trunkRef = useRef<THREE.Mesh>(null);

  return (
    <group position={[0, 2, 0]}>
      <Cylinder
        ref={trunkRef}
        args={[0.8, 1.0, 4, 8]}
        onClick={onClick}
      >
        <meshStandardMaterial
          color={new THREE.Color(score >= 80 ? 0x00ff88 : score >= 60 ? 0xffaa00 : 0x8B4513)}
          roughness={0.4}
          metalness={0.1}
        />
      </Cylinder>

      <Sphere args={[0.6, 16, 16]} position={[0, 4, 0]}>
        <meshStandardMaterial
          color={new THREE.Color(score >= 80 ? 0x00ff88 : score >= 60 ? 0xffaa00 : 0x8B4513)}
          emissive={new THREE.Color(score >= 80 ? 0x00ff88 : score >= 60 ? 0xffaa00 : 0x8B4513)}
          emissiveIntensity={0.3}
        />
      </Sphere>

      <Text position={[0, 5, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
        Homepage
      </Text>
      
      <Text position={[0, 4.5, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle">
        SEO: {score}%
      </Text>
    </group>
  );
}

// Main Scene
function TreeScene({ data, onPageClick }: { data: any; onPageClick: (page: any) => void }) {
  if (!data || !data.pages) return null;

  // Find homepage (depth 0)
  const homepage = data.pages.find(p => (p.depth || 0) === 0) || data.pages[0];
  
  // Calculate positions for branches
  const branches = data.pages.filter(p => (p.depth || 0) > 0).map((page, index) => {
    const angle = (index / data.pages.length) * Math.PI * 2;
    const radius = 3 + (page.depth || 0) * 1.5;
    const height = 4 + (page.depth || 0) * 1.5;
    
    const position: [number, number, number] = [
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    ];
    
    const endPosition: [number, number, number] = [
      Math.cos(angle) * radius,
      height + 2,
      Math.sin(angle) * radius
    ];

    return {
      page,
      position,
      endPosition,
      thickness: Math.max(0.1, (100 - page.seo_score) / 100),
      color: page.seo_score >= 80 ? '#00ff88' : page.seo_score >= 60 ? '#ffaa00' : '#8B4513'
    };
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} color={0x00ff88} />
      <pointLight position={[-10, 10, -10]} intensity={0.4} color={0xff8800} />
      <pointLight position={[0, 5, 0]} intensity={0.6} color={0x00ffff} />

      {/* Ground */}
      <Box args={[20, 0.5, 20]} position={[0, -0.25, 0]}>
        <meshStandardMaterial color={new THREE.Color(0x1a1a1a)} />
      </Box>

      {/* Tree Trunk */}
      <TreeTrunk onClick={() => onPageClick(homepage)} score={homepage.seo_score} />

      {/* Branches */}
      {branches.map((branch, index) => (
        <Branch
          key={branch.page.id}
          position={branch.position}
          endPosition={branch.endPosition}
          thickness={branch.thickness}
          color={branch.color}
          onClick={() => onPageClick(branch.page)}
          score={branch.page.seo_score}
        />
      ))}
    </>
  );
}

// Main Component
const DigitalTreeStandalone: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('Testing API...');

  // Test API on mount
  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5001/api/email/log');
        if (response.ok) {
          setApiStatus('✅ API Connected');
        } else {
          setApiStatus('❌ API Error');
        }
      } catch (err) {
        setApiStatus('❌ API Offline');
      }
    };
    testAPI();
  }, []);

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

      console.log('🌱 Growing tree for:', targetUrl);
      
      const response = await fetch(`http://127.0.0.1:5001/api/seo/3d-structure?url=${encodeURIComponent(targetUrl)}`);
      
      console.log('📡 Response:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🌳 Data:', result);
      
      if (!result || !result.pages || !Array.isArray(result.pages) || result.pages.length === 0) {
        throw new Error('No pages found');
      }
      
      setData(result);
      console.log('✅ Tree grown with', result.pages.length, 'branches');
      
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to analyze website');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950 to-black">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_70%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-4 flex items-center justify-center gap-3">
            <TreePine className="w-10 h-10 text-green-400" />
            SEO DIGITAL TREE
          </h1>
          <p className="text-green-200 text-lg">
            Your Website as a Living Digital Ecosystem
          </p>
        </div>

        {/* URL Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-green-500/30 shadow-2xl">
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Enter website URL to grow your digital tree..."
                className="flex-1 px-4 py-3 bg-black/60 border border-green-500/50 rounded-xl text-green-100 placeholder-green-400/50 focus:outline-none focus:border-green-400 focus:bg-black/80"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading || !url.trim()}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all flex items-center gap-2"
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
            <div className="p-2 bg-black/60 rounded-lg mb-4">
              <div className="text-xs text-green-300 font-mono">{apiStatus}</div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Tree Visualization */}
        <AnimatePresence mode="wait">
          {data ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 3D Tree */}
              <div className="lg:col-span-3">
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-green-500/30 h-[600px]">
                  <Canvas camera={{ position: [10, 8, 10], fov: 60 }}>
                    <TreeScene data={data} onPageClick={setSelectedPage} />
                    <OrbitControls
                      enablePan={true}
                      enableZoom={true}
                      enableRotate={true}
                      minDistance={8}
                      maxDistance={30}
                    />
                  </Canvas>
                </div>
              </div>

              {/* Info Panel */}
              <div className="space-y-4">
                {/* Tree Health */}
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
                  <h3 className="text-xl font-semibold text-green-100 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    Tree Health
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-green-200">
                      <span>Branches:</span>
                      <span className="font-semibold">{data.pages?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-green-200">
                      <span>Avg SEO:</span>
                      <span className="font-semibold">
                        {data.pages?.length ? 
                          Math.round(data.pages.reduce((sum: number, p: any) => sum + p.seo_score, 0) / data.pages.length) 
                          : 0}%
                        </span>
                    </div>
                  </div>
                </div>

                {/* Selected Branch */}
                {selectedPage && (
                  <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
                    <h3 className="text-xl font-semibold text-green-100 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-400" />
                      Branch Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-green-300 text-sm">URL</label>
                        <p className="text-green-100 font-mono text-sm">{selectedPage.url}</p>
                      </div>

                      <div>
                        <label className="text-green-300 text-sm">SEO Score</label>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-black/60 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full ${
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
                        <label className="text-green-300 text-sm">Title</label>
                        <p className="text-green-100 text-sm">{selectedPage.title || 'No title'}</p>
                      </div>

                      <div>
                        <label className="text-green-300 text-sm">Words</label>
                        <p className="text-green-100 text-sm">{selectedPage.word_count} words</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <TreePine className="w-20 h-20 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-green-100 mb-2">
                  Ready to Grow Your Digital Tree
                </h3>
                <p className="text-green-200">
                  Enter a website URL above to visualize its SEO structure as a living digital ecosystem
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DigitalTreeStandalone;
