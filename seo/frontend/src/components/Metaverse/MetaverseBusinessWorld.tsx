import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, Globe, Activity, TrendingUp, Users, Zap, ArrowRight, X, Play, Pause, FastForward } from 'lucide-react';

// Customer Entity Component
function CustomerEntity({ position, targetPosition, speed, isActive }: {
  position: [number, number, number];
  targetPosition: [number, number, number];
  speed: number;
  isActive: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isActive) {
      const time = state.clock.elapsedTime;
      
      // Move towards target
      const direction = new THREE.Vector3(...targetPosition).sub(new THREE.Vector3(...position));
      const distance = direction.length();
      
      if (distance > 0.5) {
        direction.normalize();
        const movement = direction.multiplyScalar(speed * 0.01);
        meshRef.current.position.add(movement);
      }
      
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.1;
      meshRef.current.rotation.y = time * 2;
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.2, 8, 8]} position={position}>
      <meshStandardMaterial
        color={new THREE.Color(0x00ffff)}
        emissive={new THREE.Color(0x00ffff)}
        emissiveIntensity={0.5}
        transparent
        opacity={isActive ? 0.9 : 0.3}
      />
    </Sphere>
  );
}

// Business Hub Component
function BusinessHub({ health, onActivate }: { health: number; onActivate: () => void }) {
  const hubRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (hubRef.current) {
      const time = state.clock.elapsedTime;
      
      // Pulsing based on health
      const pulse = Math.sin(time * 2) * 0.05;
      const scale = 1 + pulse * (health / 100);
      hubRef.current.scale.set(scale, scale, scale);
      
      // Gentle rotation
      hubRef.current.rotation.y = time * 0.2;
    }
  });

  const hubColor = health >= 80 ? 0x00ff88 : health >= 60 ? 0xffaa00 : health >= 40 ? 0xff6600 : 0x8B4513;

  return (
    <group position={[0, 2, 0]}>
      {/* Central Hub */}
      <Cylinder
        ref={hubRef}
        args={[2, 2, 4, 16]}
        onClick={onActivate}
      >
        <meshStandardMaterial
          color={new THREE.Color(hubColor)}
          emissive={new THREE.Color(hubColor)}
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.8}
        />
      </Cylinder>

      {/* Energy Core */}
      <Sphere args={[1.5, 16, 16]} position={[0, 4, 0]}>
        <meshStandardMaterial
          color={new THREE.Color(hubColor)}
          emissive={new THREE.Color(hubColor)}
          emissiveIntensity={0.6}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Health Display */}
      <Text
        position={[0, 6, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Business Hub
      </Text>
      
      <Text
        position={[0, 5, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Health: {health}%
      </Text>
    </group>
  );
}

// Marketing Zone Component
function MarketingZone({ position, name, activity, onActivate }: {
  position: [number, number, number];
  name: string;
  activity: number;
  onActivate: () => void;
}) {
  const zoneRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (zoneRef.current) {
      const time = state.clock.elapsedTime;
      
      // Activity-based glow
      const glow = Math.sin(time * 3) * 0.1 * (activity / 100);
      zoneRef.current.scale.set(1 + glow, 1 + glow, 1 + glow);
    }
  });

  const zoneColor = activity >= 80 ? 0x00ff88 : activity >= 60 ? 0xffaa00 : activity >= 40 ? 0xff6600 : 0x444444;

  return (
    <group position={position}>
      <Box
        ref={zoneRef}
        args={[3, 3, 3]}
        onClick={onActivate}
      >
        <meshStandardMaterial
          color={new THREE.Color(zoneColor)}
          emissive={new THREE.Color(zoneColor)}
          emissiveIntensity={0.2}
          transparent
          opacity={0.7}
        />
      </Box>

      <Text
        position={[0, 2, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
      
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Activity: {activity}%
      </Text>
    </group>
  );
}

// Path Component
function WorldPath({ start, end, activity }: {
  start: [number, number, number];
  end: [number, number, number];
  activity: number;
}) {
  const pathRef = useRef<THREE.Line>(null);

  useFrame((state) => {
    if (pathRef.current) {
      const time = state.clock.elapsedTime;
      
      // Flow animation based on activity
      const flow = Math.sin(time * 4) * 0.2 * (activity / 100);
      pathRef.current.material.opacity = 0.3 + flow;
    }
  });

  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const pathColor = activity >= 60 ? 0x00ff88 : 0x888888;

  return (
    <Line
      ref={pathRef}
      points={points}
      color={new THREE.Color(pathColor)}
      lineWidth={2}
      transparent
      opacity={0.3}
    />
  );
}

// Main Metaverse Scene
function MetaverseScene({ worldData, onZoneActivate, timeSpeed }: {
  worldData: any;
  onZoneActivate: (zone: string) => void;
  timeSpeed: number;
}) {
  const { camera } = useThree();

  useEffect(() => {
    // Set cinematic camera position
    camera.position.set([15, 10, 15]);
    camera.lookAt(0, 2, 0);
  }, [camera]);

  // Generate customer entities
  const customerEntities = Array.from({ length: Math.floor(worldData.traffic / 10) }, (_, i) => ({
    id: i,
    position: [
      Math.random() * 20 - 10,
      0.5,
      Math.random() * 20 - 10
    ] as [number, number, number],
    targetPosition: [
      Math.random() * 4 - 2,
      2,
      Math.random() * 4 - 2
    ] as [number, number, number],
    speed: 1 + Math.random() * 2,
    isActive: worldData.traffic > 20
  }));

  return (
    <>
      {/* Dynamic Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} color={0x00ffff} />
      <pointLight position={[-10, 10, -10]} intensity={0.4} color={0xff00ff} />
      <pointLight position={[0, 5, 0]} intensity={0.6} color={new THREE.Color(worldData.businessHealth >= 60 ? 0x00ff88 : 0xff4444)} />

      {/* Ground Platform */}
      <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial color={new THREE.Color(0x1a1a2e)} />
      </Plane>

      {/* Grid Lines */}
      {[...Array(10)].map((_, i) => (
        <Line
          key={`h-${i}`}
          points={[
            new THREE.Vector3(-25, 0.1, -25 + i * 5),
            new THREE.Vector3(25, 0.1, -25 + i * 5)
          ]}
          color={new THREE.Color(0x333344)}
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}
      {[...Array(10)].map((_, i) => (
        <Line
          key={`v-${i}`}
          points={[
            new THREE.Vector3(-25 + i * 5, 0.1, -25),
            new THREE.Vector3(-25 + i * 5, 0.1, 25)
          ]}
          color={new THREE.Color(0x333344)}
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}

      {/* Business Hub */}
      <BusinessHub
        health={worldData.businessHealth}
        onActivate={() => onZoneActivate('hub')}
      />

      {/* Marketing Zones */}
      <MarketingZone
        position={[8, 1.5, 0]}
        name="SEO Zone"
        activity={worldData.seoHealth}
        onActivate={() => onZoneActivate('seo')}
      />
      
      <MarketingZone
        position={[-8, 1.5, 0]}
        name="Ads Zone"
        activity={worldData.adsActivity}
        onActivate={() => onZoneActivate('ads')}
      />
      
      <MarketingZone
        position={[0, 1.5, 8]}
        name="Content Zone"
        activity={worldData.contentActivity}
        onActivate={() => onZoneActivate('content')}
      />
      
      <MarketingZone
        position={[0, 1.5, -8]}
        name="UX Zone"
        activity={worldData.uxHealth}
        onActivate={() => onZoneActivate('ux')}
      />

      {/* World Paths */}
      <WorldPath start={[0, 0.1, 0]} end={[8, 0.1, 0]} activity={worldData.seoHealth} />
      <WorldPath start={[0, 0.1, 0]} end={[-8, 0.1, 0]} activity={worldData.adsActivity} />
      <WorldPath start={[0, 0.1, 0]} end={[0, 0.1, 8]} activity={worldData.contentActivity} />
      <WorldPath start={[0, 0.1, 0]} end={[0, 0.1, -8]} activity={worldData.uxHealth} />

      {/* Customer Entities */}
      {customerEntities.map((entity) => (
        <CustomerEntity
          key={entity.id}
          position={entity.position}
          targetPosition={entity.targetPosition}
          speed={entity.speed * timeSpeed}
          isActive={entity.isActive}
        />
      ))}

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <Sphere
          key={`particle-${i}`}
          args={[0.05, 4, 4]}
          position={[
            Math.random() * 30 - 15,
            Math.random() * 10 + 1,
            Math.random() * 30 - 15
          ]}
        >
          <meshBasicMaterial
            color={new THREE.Color(0x00ffff)}
            transparent
            opacity={0.6}
          />
        </Sphere>
      ))}
    </>
  );
}

// Main Component
const MetaverseBusinessWorld: React.FC = () => {
  const [isEntering, setIsEntering] = useState(true);
  const [worldData, setWorldData] = useState({
    businessHealth: 65,
    traffic: 50,
    seoHealth: 70,
    adsActivity: 40,
    contentActivity: 60,
    uxHealth: 75,
    conversions: 25,
    growthRate: 5
  });
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [worldTime, setWorldTime] = useState(0);
  const [apiStatus, setApiStatus] = useState('Connecting...');

  // Entry animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Test API connection
  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5001/api/platform-stats');
        if (response.ok) {
          setApiStatus('✅ Connected to Business Analytics');
          const data = await response.json();
          // Update world with real data
          setWorldData(prev => ({
            ...prev,
            businessHealth: Math.min(100, prev.businessHealth + Math.random() * 10),
            traffic: data.users || prev.traffic,
            conversions: data.applications || prev.conversions
          }));
        } else {
          setApiStatus('⚠️ Using Simulation Data');
        }
      } catch (err) {
        setApiStatus('⚠️ Using Simulation Data');
      }
    };
    testAPI();
  }, []);

  // World time progression
  useEffect(() => {
    if (!isPaused && !isEntering) {
      const interval = setInterval(() => {
        setWorldTime(prev => prev + timeSpeed);
        
        // Simulate world evolution
        setWorldData(prev => {
          const growth = prev.growthRate / 100;
          const decay = 0.01;
          
          return {
            ...prev,
            businessHealth: Math.max(0, Math.min(100, prev.businessHealth + (growth - decay) * timeSpeed)),
            traffic: Math.max(10, prev.traffic + (Math.random() - 0.5) * 5 * timeSpeed),
            seoHealth: Math.max(0, Math.min(100, prev.seoHealth + (Math.random() - 0.3) * 2 * timeSpeed)),
            adsActivity: selectedScenario === 'ads' ? 
              Math.min(100, prev.adsActivity + 10 * timeSpeed) : 
              Math.max(0, prev.adsActivity - 2 * timeSpeed),
            contentActivity: selectedScenario === 'content' ? 
              Math.min(100, prev.contentActivity + 5 * timeSpeed) : 
              Math.max(0, prev.contentActivity - 1 * timeSpeed),
            uxHealth: selectedScenario === 'ux' ? 
              Math.min(100, prev.uxHealth + 3 * timeSpeed) : 
              Math.max(0, prev.uxHealth - 0.5 * timeSpeed),
            conversions: Math.max(0, prev.conversions + (prev.traffic / 100) * timeSpeed)
          };
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isPaused, timeSpeed, isEntering, selectedScenario]);

  const handleZoneActivate = (zone: string) => {
    setSelectedScenario(zone === selectedScenario ? null : zone);
  };

  const handleExit = () => {
    window.close();
    // Fallback if window doesn't close
    window.location.href = '/dashboard';
  };

  const formatWorldTime = (time: number) => {
    const days = Math.floor(time / 24);
    const hours = time % 24;
    return `Day ${days}, ${hours}:00`;
  };

  if (isEntering) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          className="text-center"
        >
          <div className="mb-8">
            <Globe className="w-20 h-20 text-cyan-400 mx-auto animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-cyan-400 mb-4">Entering Metaverse</h1>
          <p className="text-cyan-200 mb-8">Initializing Business Growth World...</p>
          <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
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
      {/* Fullscreen Canvas */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [15, 10, 15], fov: 75 }}>
          <Suspense fallback={null}>
            <MetaverseScene
              worldData={worldData}
              onZoneActivate={handleZoneActivate}
              timeSpeed={timeSpeed}
            />
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={10}
              maxDistance={50}
              maxPolarAngle={Math.PI * 0.8}
              minPolarAngle={Math.PI * 0.2}
              enableDamping={true}
              dampingFactor={0.05}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Minimal HUD Overlay */}
      <div className="absolute top-4 left-4 text-cyan-400 font-mono text-sm">
        <div>MBGW - Metaverse Business Growth World</div>
        <div className="text-xs text-cyan-300 mt-1">{apiStatus}</div>
      </div>

      {/* World Status */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-lg p-4 border border-cyan-500/30">
        <h3 className="text-cyan-400 font-semibold mb-2">World Status</h3>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-cyan-200">
            <span>Time:</span>
            <span>{formatWorldTime(worldTime)}</span>
          </div>
          <div className="flex justify-between text-cyan-200">
            <span>Business Health:</span>
            <span className={worldData.businessHealth >= 60 ? 'text-green-400' : 'text-red-400'}>
              {worldData.businessHealth}%
            </span>
          </div>
          <div className="flex justify-between text-cyan-200">
            <span>Active Entities:</span>
            <span>{Math.floor(worldData.traffic / 10)}</span>
          </div>
          <div className="flex justify-between text-cyan-200">
            <span>Conversions:</span>
            <span>{worldData.conversions}</span>
          </div>
        </div>
      </div>

      {/* Scenario Status */}
      {selectedScenario && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 border border-cyan-500/30">
          <div className="text-cyan-400 text-sm font-semibold">
            Scenario Active: {selectedScenario.toUpperCase()}
          </div>
        </div>
      )}

      {/* Time Controls */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md rounded-lg p-3 border border-cyan-500/30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 bg-cyan-600/20 hover:bg-cyan-600/40 rounded text-cyan-400 transition-colors"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setTimeSpeed(prev => prev === 1 ? 2 : prev === 2 ? 5 : 1)}
            className="p-2 bg-cyan-600/20 hover:bg-cyan-600/40 rounded text-cyan-400 transition-colors"
          >
            <FastForward className="w-4 h-4" />
          </button>
          <div className="text-cyan-400 text-xs">
            {timeSpeed}x
          </div>
        </div>
      </div>

      {/* Exit Portal */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={handleExit}
          className="bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Exit Metaverse
        </button>
      </div>

      {/* Zone Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-cyan-300 text-sm">
          Click on zones to activate scenarios • Use mouse to explore • Watch your business evolve
        </div>
      </div>
    </div>
  );
};

export default MetaverseBusinessWorld;
