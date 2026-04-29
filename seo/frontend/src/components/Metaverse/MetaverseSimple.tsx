import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, Globe, Activity, TrendingUp, Users, Zap, X, Play, Pause } from 'lucide-react';

// Simple Business Hub
function BusinessHub({ health }: { health: number }) {
  const hubRef = useRef<THREE.Mesh>(null);

  return (
    <group position={[0, 2, 0]}>
      <Box ref={hubRef} args={[2, 4, 2]}>
        <meshStandardMaterial
          color={new THREE.Color(health >= 60 ? 0x00ff88 : 0xff4444)}
          emissive={new THREE.Color(health >= 60 ? 0x00ff88 : 0xff4444)}
          emissiveIntensity={0.3}
        />
      </Box>
      
      <Text position={[0, 3, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        Business Hub
      </Text>
      
      <Text position={[0, 2.5, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
        Health: {health}%
      </Text>
    </group>
  );
}

// Simple Zone
function Zone({ position, name, activity }: {
  position: [number, number, number];
  name: string;
  activity: number;
}) {
  return (
    <group position={position}>
      <Box args={[1.5, 1.5, 1.5]}>
        <meshStandardMaterial
          color={new THREE.Color(activity >= 60 ? 0x00ff88 : 0x888888)}
          emissive={new THREE.Color(activity >= 60 ? 0x00ff88 : 0x888888)}
          emissiveIntensity={0.2}
          transparent
          opacity={0.7}
        />
      </Box>

      <Text position={[0, 1, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle">
        {name}
      </Text>
    </group>
  );
}

// Simple Scene
function SimpleScene({ worldData }: { worldData: any }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Ground */}
      <Box args={[20, 0.5, 20]} position={[0, -0.25, 0]}>
        <meshStandardMaterial color={new THREE.Color(0x1a1a2e)} />
      </Box>

      {/* Business Hub */}
      <BusinessHub health={worldData.businessHealth} />

      {/* Zones */}
      <Zone position={[5, 0.75, 0]} name="SEO" activity={worldData.seoHealth} />
      <Zone position={[-5, 0.75, 0]} name="Ads" activity={worldData.adsActivity} />
      <Zone position={[0, 0.75, 5]} name="Content" activity={worldData.contentActivity} />
      <Zone position={[0, 0.75, -5]} name="UX" activity={worldData.uxHealth} />
    </>
  );
}

// Main Component
const MetaverseSimple: React.FC = () => {
  const [isEntering, setIsEntering] = useState(true);
  const [worldData, setWorldData] = useState({
    businessHealth: 75,
    traffic: 100,
    seoHealth: 80,
    adsActivity: 60,
    contentActivity: 70,
    uxHealth: 85,
    conversions: 30,
    growthRate: 8
  });
  const [isPaused, setIsPaused] = useState(false);
  const [apiStatus, setApiStatus] = useState('Testing...');

  // Entry animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Test API connection
  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5001/api/platform-stats');
        if (response.ok) {
          setApiStatus('✅ Connected to Analytics');
          const data = await response.json();
          console.log('📊 Real data:', data);
        } else {
          setApiStatus('⚠️ Using Simulation');
        }
      } catch (err) {
        setApiStatus('⚠️ Using Simulation');
        console.log('📊 Simulation mode');
      }
    };
    testAPI();
  }, []);

  // Simple world evolution
  useEffect(() => {
    if (!isPaused && !isEntering) {
      const interval = setInterval(() => {
        setWorldData(prev => ({
          ...prev,
          businessHealth: Math.max(0, Math.min(100, prev.businessHealth + (Math.random() - 0.3) * 2)),
          seoHealth: Math.max(0, Math.min(100, prev.seoHealth + (Math.random() - 0.2) * 3)),
          adsActivity: Math.max(0, Math.min(100, prev.adsActivity + (Math.random() - 0.4) * 4)),
          contentActivity: Math.max(0, Math.min(100, prev.contentActivity + (Math.random() - 0.1) * 2)),
          uxHealth: Math.max(0, Math.min(100, prev.uxHealth + (Math.random() - 0.1) * 1)),
          conversions: Math.max(0, prev.conversions + Math.random() * 2)
        }));
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isPaused, isEntering]);

  const handleExit = () => {
    window.close();
    window.location.href = '/dashboard';
  };

  if (isEntering) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Globe className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Entering Metaverse</h1>
          <p className="text-cyan-200">Loading Business World...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [10, 8, 10], fov: 75 }}>
          <SimpleScene worldData={worldData} />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={8}
            maxDistance={30}
          />
        </Canvas>
      </div>

      {/* Status Display */}
      <div className="absolute top-4 left-4 text-cyan-400 font-mono text-sm bg-black/60 p-3 rounded">
        <div>Metaverse Business World</div>
        <div className="text-xs text-cyan-300 mt-1">{apiStatus}</div>
      </div>

      {/* World Stats */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-lg p-4 border border-cyan-500/30">
        <h3 className="text-cyan-400 font-semibold mb-2">World Status</h3>
        <div className="space-y-1 text-xs text-cyan-200">
          <div>Business Health: {worldData.businessHealth}%</div>
          <div>SEO: {worldData.seoHealth}%</div>
          <div>Ads: {worldData.adsActivity}%</div>
          <div>Content: {worldData.contentActivity}%</div>
          <div>UX: {worldData.uxHealth}%</div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md rounded-lg p-3 border border-cyan-500/30">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-2 bg-cyan-600/20 hover:bg-cyan-600/40 rounded text-cyan-400"
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
      </div>

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
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-cyan-300 text-sm">
          Use mouse to explore • Watch your business evolve in real-time
        </div>
      </div>
    </div>
  );
};

export default MetaverseSimple;
