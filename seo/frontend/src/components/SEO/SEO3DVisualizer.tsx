import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle, CheckCircle, X, Loader, Globe, BarChart3, Target } from 'lucide-react';

// SEO Page Block Component
function SEOPageBlock({ page, position, onClick, onHover, isSelected, isHovered }: {
  page: any;
  position: [number, number, number];
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  isSelected: boolean;
  isHovered: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate color based on SEO score
  const getColor = (score: number) => {
    if (score >= 80) return new THREE.Color('#10b981'); // Green
    if (score >= 60) return new THREE.Color('#f59e0b'); // Amber
    if (score >= 40) return new THREE.Color('#ef4444'); // Red
    return new THREE.Color('#6b7280'); // Gray
  };

  // Calculate size based on word count
  const getSize = (wordCount: number) => {
    const baseSize = 1;
    const scaleFactor = Math.min(wordCount / 1000, 0.5); // Max 50% increase
    return baseSize + scaleFactor;
  };

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      
      // Hover effect
      if (hovered || isHovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[getSize(page.word_count), 0.8, getSize(page.word_count)]}
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
          color={getColor(page.seo_score)}
          emissive={isSelected ? getColor(page.seo_score) : new THREE.Color(0x000000)}
          emissiveIntensity={isSelected ? 0.3 : 0}
          roughness={0.3}
          metalness={0.6}
        />
      </Box>
      
      {/* SEO Score Badge */}
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {page.seo_score}
      </Text>
      
      {/* Page URL */}
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {page.url}
      </Text>
    </group>
  );
}

// Connection Line Component
function ConnectionLine({ start, end, isBroken }: {
  start: [number, number, number];
  end: [number, number, number];
  isBroken: boolean;
}) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  
  return (
    <Line
      points={points}
      color={isBroken ? '#ef4444' : '#3b82f6'}
      lineWidth={isBroken ? 3 : 2}
      opacity={isBroken ? 0.8 : 0.4}
      transparent
    />
  );
}

// Scene Component
function SEO3DScene({ data, selectedPage, hoveredPage, onPageClick, onPageHover }: {
  data: any;
  selectedPage: any;
  hoveredPage: any;
  onPageClick: (page: any) => void;
  onPageHover: (page: any) => void;
}) {
  const { camera } = useThree();

  useEffect(() => {
    // Set camera position for better view
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  if (!data || !data.pages) return null;

  // Calculate positions for pages based on depth and structure
  const pagePositions = new Map<string, [number, number, number]>();
  const maxDepth = Math.max(...data.pages.map((p: any) => p.depth));

  data.pages.forEach((page: any, index: number) => {
    const depth = page.depth || 0;
    const angle = (index / data.pages.length) * Math.PI * 2;
    const radius = 3 + depth * 2;
    
    pagePositions.set(page.id, [
      Math.cos(angle) * radius,
      depth * 2 - maxDepth, // Stack by depth
      Math.sin(angle) * radius
    ] as [number, number, number]);
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color="#3b82f6" />

      {/* Render page blocks */}
      {data.pages.map((page: any) => (
        <SEOPageBlock
          key={page.id}
          page={page}
          position={pagePositions.get(page.id) || [0, 0, 0]}
          onClick={() => onPageClick(page)}
          onHover={(hovered) => onPageHover(hovered ? page : null)}
          isSelected={selectedPage?.id === page.id}
          isHovered={hoveredPage?.id === page.id}
        />
      ))}

      {/* Render connection lines */}
      {data.pages.map((page: any) => {
        const startPos = pagePositions.get(page.id);
        if (!startPos) return null;

        return page.links_to?.map((targetUrl: string, index: number) => {
          const targetPage = data.pages.find((p: any) => p.url === targetUrl);
          if (!targetPage) return null;

          const endPos = pagePositions.get(targetPage.id);
          if (!endPos) return null;

          const isBroken = page.issues?.includes('broken_links');

          return (
            <ConnectionLine
              key={`${page.id}-${targetPage.id}`}
              start={startPos}
              end={endPos}
              isBroken={isBroken}
            />
          );
        });
      })}
    </>
  );
}

// Main Component
const SEO3DVisualizer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [hoveredPage, setHoveredPage] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setSelectedPage(null);
    setHoveredPage(null);

    try {
      const response = await fetch(`http://127.0.0.1:5001/api/seo/3d-structure?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze website');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze website');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const getIssueIcon = (issue: string) => {
    switch (issue) {
      case 'missing_title':
      case 'missing_meta_description':
      case 'missing_h1':
        return <X className="w-4 h-4 text-red-500" />;
      case 'title_length_issue':
      case 'meta_description_length_issue':
      case 'multiple_h1_tags':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getIssueDescription = (issue: string) => {
    switch (issue) {
      case 'missing_title':
        return 'Missing page title';
      case 'missing_meta_description':
        return 'Missing meta description';
      case 'missing_h1':
        return 'Missing H1 tag';
      case 'title_length_issue':
        return 'Title length not optimal (30-60 chars)';
      case 'meta_description_length_issue':
        return 'Meta description length not optimal (120-160 chars)';
      case 'multiple_h1_tags':
        return 'Multiple H1 tags found';
      case 'low_word_count':
        return 'Low word count (< 300 words)';
      default:
        return issue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Globe className="w-10 h-10 text-purple-400" />
            3D SEO Website Deconstruction
          </h1>
          <p className="text-purple-200 text-lg">
            Visualize website structure and SEO performance in real-time 3D
          </p>
        </motion.div>

        {/* URL Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex gap-3">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Enter website URL (e.g., example.com)"
                className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 focus:bg-white/30 transition-all"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading || !url.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {loading ? 'Analyzing...' : 'Analyze'}
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

        {/* 3D Visualization */}
        <AnimatePresence mode="wait">
          {data ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* 3D Scene */}
              <div className="lg:col-span-2">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 h-[600px]">
                  <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
                    <Suspense fallback={null}>
                      <SEO3DScene
                        data={data}
                        selectedPage={selectedPage}
                        hoveredPage={hoveredPage}
                        onPageClick={setSelectedPage}
                        onPageHover={setHoveredPage}
                      />
                      <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={5}
                        maxDistance={50}
                      />
                    </Suspense>
                  </Canvas>
                </div>
              </div>

              {/* Page Details Panel */}
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Analysis Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-purple-200">
                      <span>Pages Analyzed:</span>
                      <span className="font-semibold">{data.pages?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-purple-200">
                      <span>Avg SEO Score:</span>
                      <span className="font-semibold">
                        {data.pages?.length ? 
                          Math.round(data.pages.reduce((sum: number, p: any) => sum + p.seo_score, 0) / data.pages.length) 
                          : 0}%
                        </span>
                    </div>
                  </div>
                </div>

                {/* Selected Page Details */}
                {selectedPage && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                  >
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      Page Details
                    </h3>
                    
                    <div className="space-y-4">
                      {/* URL */}
                      <div>
                        <label className="text-purple-300 text-sm">URL</label>
                        <p className="text-white font-mono text-sm">{selectedPage.url}</p>
                      </div>

                      {/* SEO Score */}
                      <div>
                        <label className="text-purple-300 text-sm">SEO Score</label>
                        <div className="flex items-center gap-2">
                          <div className={`w-full bg-white/20 rounded-full h-3`}>
                            <div
                              className={`h-3 rounded-full transition-all ${
                                selectedPage.seo_score >= 80 ? 'bg-green-500' :
                                selectedPage.seo_score >= 60 ? 'bg-amber-500' :
                                selectedPage.seo_score >= 40 ? 'bg-red-500' : 'bg-gray-500'
                              }`}
                              style={{ width: `${selectedPage.seo_score}%` }}
                            />
                          </div>
                          <span className="text-white font-semibold">{selectedPage.seo_score}%</span>
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="text-purple-300 text-sm">Title</label>
                        <p className="text-white text-sm">{selectedPage.title || 'Not found'}</p>
                      </div>

                      {/* Meta Description */}
                      <div>
                        <label className="text-purple-300 text-sm">Meta Description</label>
                        <p className="text-white text-sm">{selectedPage.meta_description || 'Not found'}</p>
                      </div>

                      {/* Word Count */}
                      <div>
                        <label className="text-purple-300 text-sm">Word Count</label>
                        <p className="text-white text-sm">{selectedPage.word_count} words</p>
                      </div>

                      {/* Issues */}
                      {selectedPage.issues && selectedPage.issues.length > 0 && (
                        <div>
                          <label className="text-purple-300 text-sm">Issues Found</label>
                          <div className="space-y-2 mt-2">
                            {selectedPage.issues.map((issue: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-white text-sm">
                                {getIssueIcon(issue)}
                                <span>{getIssueDescription(issue)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Keywords */}
                      {selectedPage.keywords && selectedPage.keywords.length > 0 && (
                        <div>
                          <label className="text-purple-300 text-sm">Top Keywords</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedPage.keywords.slice(0, 5).map((keyword: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-purple-600/30 border border-purple-500/50 rounded-lg text-xs text-purple-200"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Hovered Page Info */}
                {hoveredPage && hoveredPage.id !== selectedPage?.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
                  >
                    <div className="text-white">
                      <p className="font-semibold">{hoveredPage.url}</p>
                      <p className="text-sm text-purple-300">SEO Score: {hoveredPage.seo_score}%</p>
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
                <Globe className="w-20 h-20 text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-purple-200">
                  Enter a website URL above to visualize its SEO structure in 3D
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SEO3DVisualizer;
