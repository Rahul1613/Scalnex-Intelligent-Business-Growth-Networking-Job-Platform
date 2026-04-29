import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder, Torus, Ring } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, Activity, Zap, Settings, FileText, Monitor, Globe, X, Play, Pause, FastForward } from 'lucide-react';

// Central Business Core
function BusinessCore({ health, isActive }: { health: number; isActive: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const energyRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    if (coreRef.current) {
      const time = state.clock.elapsedTime;
      
      // Core pulsing based on health
      const pulseIntensity = (health / 100) * 0.1;
      const scale = 1 + Math.sin(time * 2) * pulseIntensity;
      coreRef.current.scale.set(scale, scale, scale);
      
      // Rotation
      coreRef.current.rotation.y = time * 0.3;
      coreRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
      
      // Instability when health is low
      if (health < 50) {
        const instability = (50 - health) / 50 * 0.02;
        coreRef.current.position.x += (Math.random() - 0.5) * instability;
        coreRef.current.position.z += (Math.random() - 0.5) * instability;
      }
    }

    // Energy rings
    if (energyRef.current && isActive) {
      const time = state.clock.elapsedTime;
      energyRef.current.rotation.y = time * 0.5;
      energyRef.current.scale.set(
        1 + Math.sin(time * 3) * 0.1,
        1 + Math.sin(time * 3) * 0.1,
        1 + Math.sin(time * 3) * 0.1
      );
    }

    // Orbiting rings
    ringsRef.current.forEach((ring, index) => {
      if (ring) {
        const time = state.clock.elapsedTime;
        const speed = 0.5 + index * 0.2;
        ring.rotation.y = time * speed;
        ring.position.y = Math.sin(time * speed + index) * 0.3;
      }
    });
  });

  const coreColor = health >= 80 ? 0x00ff88 : health >= 60 ? 0xffaa00 : health >= 40 ? 0xff6600 : 0xff4444;

  return (
    <group position={[0, 2, 0]}>
      {/* Energy Core */}
      <Sphere ref={coreRef} args={[1.5, 32, 32]}>
        <meshStandardMaterial
          color={new THREE.Color(coreColor)}
          emissive={new THREE.Color(coreColor)}
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={0.9}
        />
      </Sphere>

      {/* Energy Field */}
      <Sphere ref={energyRef} args={[2, 16, 16]}>
        <meshBasicMaterial
          color={new THREE.Color(coreColor)}
          transparent
          opacity={0.2}
        />
      </Sphere>

      {/* Orbiting Rings */}
      {[...Array(3)].map((_, i) => (
        <Torus
          key={i}
          ref={(el) => { if (el) ringsRef.current[i] = el; }}
          args={[2.5 + i * 0.5, 0.1, 16]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial
            color={new THREE.Color(coreColor)}
            emissive={new THREE.Color(coreColor)}
            emissiveIntensity={0.3}
            transparent
            opacity={0.6}
          />
        </Torus>
      ))}

      {/* Status Indicator */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Business Core
      </Text>
    </group>
  );
}

// Operations Terminal
function OperationsTerminal({ position, type, activity, onActivate, isActive }: {
  position: [number, number, number];
  type: 'seo' | 'ads' | 'ux' | 'content';
  activity: number;
  onActivate: () => void;
  isActive: boolean;
}) {
  const terminalRef = useRef<THREE.Mesh>(null);
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (terminalRef.current) {
      const time = state.clock.elapsedTime;
      
      // Hover/active animation
      const targetScale = isActive ? 1.1 : 1;
      terminalRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Gentle floating
      terminalRef.current.position.y = position[1] + Math.sin(time * 2) * 0.05;
    }

    if (screenRef.current) {
      const time = state.clock.elapsedTime;
      
      // Screen glow based on activity
      const glowIntensity = (activity / 100) * 0.8;
      screenRef.current.material.emissiveIntensity = glowIntensity;
      
      // Screen content animation
      if (isActive) {
        screenRef.current.rotation.z = Math.sin(time * 4) * 0.05;
      }
    }
  });

  const terminalConfig = {
    seo: { color: 0x00ff88, label: 'SEO Terminal', icon: '🔍' },
    ads: { color: 0xff6600, label: 'Ads Terminal', icon: '📢' },
    ux: { color: 0x00aaff, label: 'UX Terminal', icon: '🎨' },
    content: { color: 0xff00ff, label: 'Content Terminal', icon: '📝' }
  };

  const config = terminalConfig[type];

  return (
    <group position={position}>
      {/* Terminal Base */}
      <Box
        ref={terminalRef}
        args={[1.2, 2, 0.8]}
        onClick={onActivate}
      >
        <meshStandardMaterial
          color={new THREE.Color(0x333344)}
          roughness={0.4}
          metalness={0.8}
        />
      </Box>

      {/* Terminal Screen */}
      <Box
        ref={screenRef}
        args={[1, 1.2, 0.05]}
        position={[0, 0.3, 0.41]}
      >
        <meshStandardMaterial
          color={new THREE.Color(config.color)}
          emissive={new THREE.Color(config.color)}
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </Box>

      {/* Terminal Label */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {config.label}
      </Text>

      {/* Activity Indicator */}
      {isActive && (
        <Ring
          args={[0.8, 0.9, 8]}
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial
            color={new THREE.Color(config.color)}
            transparent
            opacity={0.6}
          />
        </Ring>
      )}
    </group>
  );
}

// Room Environment
function CommandCenterRoom({ worldState }: { worldState: any }) {
  const { scene } = useThree();

  useEffect(() => {
    // Set fog for depth
    scene.fog = new THREE.Fog(0x000033, 10, 50);
  }, [scene]);

  return (
    <>
      {/* Ambient Lighting */}
      <ambientLight intensity={0.2} />
      
      {/* Central Core Light */}
      <pointLight
        position={[0, 2, 0]}
        intensity={worldState.businessHealth / 100}
        color={worldState.businessHealth >= 60 ? 0x00ff88 : 0xff4444}
      />

      {/* Room Accent Lights */}
      <pointLight position={[8, 4, 0]} intensity={0.5} color={0x00ffff} />
      <pointLight position={[-8, 4, 0]} intensity={0.5} color={0xff00ff} />
      <pointLight position={[0, 4, 8]} intensity={0.5} color={0xffff00} />
      <pointLight position={[0, 4, -8]} intensity={0.5} color={0xff0088} />

      {/* Hexagonal Room Walls */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 12;
        const z = Math.sin(angle) * 12;
        
        return (
          <Box
            key={`wall-${i}`}
            args={[4, 6, 0.2]}
            position={[x, 3, z]}
            rotation={[0, angle + Math.PI / 2, 0]}
          >
            <meshStandardMaterial
              color={new THREE.Color(0x1a1a2e)}
              roughness={0.8}
              metalness={0.2}
            />
          </Box>
        );
      })}

      {/* Holographic Floor Grid */}
      <Box args={[20, 0.1, 20]} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color={new THREE.Color(0x003366)}
          transparent
          opacity={0.8}
        />
      </Box>

      {/* Grid Lines */}
      {[...Array(10)].map((_, i) => (
        <Box
          key={`h-line-${i}`}
          args={[20, 0.05, 0.05]}
          position={[0, 0.05, -10 + i * 2]}
        >
          <meshBasicMaterial
            color={new THREE.Color(0x00ffff)}
            transparent
            opacity={0.3}
          />
        </Box>
      ))}
      {[...Array(10)].map((_, i) => (
        <Box
          key={`v-line-${i}`}
          args={[0.05, 0.05, 20]}
          position={[-10 + i * 2, 0.05, 0]}
        >
          <meshBasicMaterial
            color={new THREE.Color(0x00ffff)}
            transparent
            opacity={0.3}
          />
        </Box>
      ))}

      {/* Ceiling */}
      <Box args={[20, 0.2, 20]} position={[0, 6, 0]}>
        <meshStandardMaterial
          color={new THREE.Color(0x1a1a2e)}
          roughness={0.8}
          metalness={0.2}
        />
      </Box>

      {/* Ambient Particles */}
      {[...Array(30)].map((_, i) => (
        <Sphere
          key={`particle-${i}`}
          args={[0.02, 4, 4]}
          position={[
            (Math.random() - 0.5) * 20,
            Math.random() * 6,
            (Math.random() - 0.5) * 20
          ]}
        >
          <meshBasicMaterial
            color={new THREE.Color(0x00ffff)}
            transparent
            opacity={0.4}
          />
        </Sphere>
      ))}
    </>
  );
}

// Main Scene
function CommandCenterScene({ worldState, onTerminalActivate, timeSpeed }: {
  worldState: any;
  onTerminalActivate: (terminal: string) => void;
  timeSpeed: number;
}) {
  const { camera } = useThree();

  useEffect(() => {
    // Set initial camera position inside the room
    camera.position.set([0, 4, 8]);
    camera.lookAt(0, 2, 0);
  }, [camera]);

  return (
    <>
      <CommandCenterRoom worldState={worldState} />
      
      <BusinessCore 
        health={worldState.businessHealth} 
        isActive={worldState.activeTerminal !== null} 
      />
      
      <OperationsTerminal
        position={[6, 1, 0]}
        type="seo"
        activity={worldState.seoActivity}
        onActivate={() => onTerminalActivate('seo')}
        isActive={worldState.activeTerminal === 'seo'}
      />
      
      <OperationsTerminal
        position={[-6, 1, 0]}
        type="ads"
        activity={worldState.adsActivity}
        onActivate={() => onTerminalActivate('ads')}
        isActive={worldState.activeTerminal === 'ads'}
      />
      
      <OperationsTerminal
        position={[0, 1, 6]}
        type="ux"
        activity={worldState.uxActivity}
        onActivate={() => onTerminalActivate('ux')}
        isActive={worldState.activeTerminal === 'ux'}
      />
      
      <OperationsTerminal
        position={[0, 1, -6]}
        type="content"
        activity={worldState.contentActivity}
        onActivate={() => onTerminalActivate('content')}
        isActive={worldState.activeTerminal === 'content'}
      />
    </>
  );
}

// Main Component
const MetaverseCommandCenter: React.FC = () => {
  const [isEntering, setIsEntering] = useState(true);
  const [worldState, setWorldState] = useState({
    businessHealth: 65,
    seoActivity: 50,
    adsActivity: 40,
    uxActivity: 70,
    contentActivity: 60,
    activeTerminal: null,
    worldTime: 0
  });
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [apiStatus, setApiStatus] = useState('Connecting...');

  // Entry animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // API connection test
  useEffect(() => {
    const testAPI = async () => {
      try {
        const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5001';
        const response = await fetch(`${API_URL}/api/platform-stats`);
        if (response.ok) {
          setApiStatus('✅ Connected to Operations');
          const data = await response.json();
          console.log('📊 Operations data:', data);
        } else {
          setApiStatus('⚠️ Simulation Mode');
        }
      } catch (err) {
        setApiStatus('⚠️ Simulation Mode');
      }
    };
    testAPI();
  }, []);

  // World evolution based on active terminal
  useEffect(() => {
    if (!isPaused && !isEntering) {
      const interval = setInterval(() => {
        setWorldState(prev => {
          let newState = { ...prev };
          
          // Time progression
          newState.worldTime += timeSpeed;
          
          // Terminal effects
          if (prev.activeTerminal === 'seo') {
            // SEO: Slow, steady improvement
            newState.businessHealth = Math.min(100, prev.businessHealth + 0.5 * timeSpeed);
            newState.seoActivity = Math.min(100, prev.seoActivity + 2 * timeSpeed);
          } else if (prev.activeTerminal === 'ads') {
            // Ads: Quick burst, then decay
            newState.adsActivity = Math.min(100, prev.adsActivity + 10 * timeSpeed);
            newState.businessHealth = Math.min(100, prev.businessHealth + 1 * timeSpeed);
          } else if (prev.activeTerminal === 'ux') {
            // UX: Stability improvement
            newState.uxActivity = Math.min(100, prev.uxActivity + 1.5 * timeSpeed);
            newState.businessHealth = Math.min(100, prev.businessHealth + 0.8 * timeSpeed);
          } else if (prev.activeTerminal === 'content') {
            // Content: Gradual growth
            newState.contentActivity = Math.min(100, prev.contentActivity + 1 * timeSpeed);
            newState.businessHealth = Math.min(100, prev.businessHealth + 0.6 * timeSpeed);
          } else {
            // No activity: Slow decay
            newState.businessHealth = Math.max(20, prev.businessHealth - 0.2 * timeSpeed);
            newState.seoActivity = Math.max(10, prev.seoActivity - 0.5 * timeSpeed);
            newState.adsActivity = Math.max(10, prev.adsActivity - 1 * timeSpeed);
            newState.uxActivity = Math.max(10, prev.uxActivity - 0.3 * timeSpeed);
            newState.contentActivity = Math.max(10, prev.contentActivity - 0.4 * timeSpeed);
          }
          
          return newState;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isPaused, timeSpeed, isEntering, worldState.activeTerminal]);

  const handleTerminalActivate = (terminal: string) => {
    setWorldState(prev => ({
      ...prev,
      activeTerminal: prev.activeTerminal === terminal ? null : terminal
    }));
    setShowPanel(true);
    
    // Hide panel after 3 seconds
    setTimeout(() => setShowPanel(false), 3000);
  };

  const handleExit = () => {
    window.close();
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center"
        >
          <div className="mb-8">
            <div className="w-16 h-16 border-4 border-cyan-400 rounded-full mx-auto animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-cyan-400 mb-4">ENTERING COMMAND CENTER</h1>
          <p className="text-cyan-200 mb-8">Initializing Operations Room...</p>
          <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 4 }}
            ></motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Fullscreen Canvas */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 4, 8], fov: 75 }}>
          <Suspense fallback={null}>
            <CommandCenterScene
              worldState={worldState}
              onTerminalActivate={handleTerminalActivate}
              timeSpeed={timeSpeed}
            />
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={15}
              maxPolarAngle={Math.PI * 0.85}
              minPolarAngle={Math.PI * 0.3}
              enableDamping={true}
              dampingFactor={0.05}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Minimal HUD */}
      <div className="absolute top-4 left-4 text-cyan-400 font-mono text-sm bg-black/60 p-3 rounded">
        <div>MBOCC - Command Center</div>
        <div className="text-xs text-cyan-300 mt-1">{apiStatus}</div>
      </div>

      {/* Time Display */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-lg p-4 border border-cyan-500/30">
        <h3 className="text-cyan-400 font-semibold mb-2">Operations Time</h3>
        <div className="text-cyan-200 text-sm">{formatWorldTime(worldState.worldTime)}</div>
        <div className="text-xs text-cyan-300 mt-1">
          {worldState.activeTerminal ? `Active: ${worldState.activeTerminal.toUpperCase()}` : 'Standby Mode'}
        </div>
      </div>

      {/* Time Controls */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md rounded-lg p-3 border border-cyan-500/30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 bg-cyan-600/20 hover:bg-cyan-600/40 rounded text-cyan-400"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setTimeSpeed(prev => prev === 1 ? 2 : prev === 2 ? 5 : 1)}
            className="p-2 bg-cyan-600/20 hover:bg-cyan-600/40 rounded text-cyan-400"
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
          className="bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Exit Command Center
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-cyan-300 text-sm">
          Click terminals to activate operations • Use mouse to explore • Watch your business evolve
        </div>
      </div>

      {/* Analytics Panel (2D Overlay) */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute right-4 top-20 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-cyan-500/30 w-64"
          >
            <h3 className="text-cyan-400 font-semibold mb-3">Operations Status</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-cyan-200">
                <span>Business Health:</span>
                <span className={worldState.businessHealth >= 60 ? 'text-green-400' : 'text-red-400'}>
                  {worldState.businessHealth}%
                </span>
              </div>
              <div className="flex justify-between text-cyan-200">
                <span>SEO Activity:</span>
                <span>{worldState.seoActivity}%</span>
              </div>
              <div className="flex justify-between text-cyan-200">
                <span>Ads Activity:</span>
                <span>{worldState.adsActivity}%</span>
              </div>
              <div className="flex justify-between text-cyan-200">
                <span>UX Activity:</span>
                <span>{worldState.uxActivity}%</span>
              </div>
              <div className="flex justify-between text-cyan-200">
                <span>Content Activity:</span>
                <span>{worldState.contentActivity}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MetaverseCommandCenter;
