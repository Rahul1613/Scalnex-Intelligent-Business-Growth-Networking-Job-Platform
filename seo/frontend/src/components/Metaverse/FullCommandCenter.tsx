import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder, Torus, Ring, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Activity, Zap, Settings, FileText, Globe, X, Play, Pause, FastForward } from 'lucide-react';

// Central Business Core - NO NUMBERS, just visual health representation
function BusinessCore({ health, isActive }: { health: number; isActive: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const energyFieldRef = useRef<THREE.Mesh>(null);
  const orbitRingsRef = useRef<THREE.Mesh[]>([]);
  const particlesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Core pulsing based on business health
    if (coreRef.current) {
      const healthFactor = health / 100;
      const pulseIntensity = 0.05 + (healthFactor * 0.15);
      const scale = 1 + Math.sin(time * 2) * pulseIntensity;
      coreRef.current.scale.set(scale, scale, scale);
      
      // Rotation
      coreRef.current.rotation.y = time * 0.3;
      coreRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
      
      // Instability when health is low
      if (health < 50) {
        const instability = (50 - health) / 50 * 0.03;
        coreRef.current.position.x += (Math.random() - 0.5) * instability;
        coreRef.current.position.z += (Math.random() - 0.5) * instability;
        coreRef.current.position.y += (Math.random() - 0.5) * instability * 0.5;
      }
    }

    // Energy field around core
    if (energyFieldRef.current && isActive) {
      energyFieldRef.current.rotation.y = time * 0.5;
      const fieldScale = 1 + Math.sin(time * 3) * 0.2;
      energyFieldRef.current.scale.set(fieldScale, fieldScale, fieldScale);
    }

    // Orbiting rings around core
    orbitRingsRef.current.forEach((ring, index) => {
      if (ring) {
        const speed = 0.5 + index * 0.2;
        const radius = 2.5 + index * 0.8;
        ring.position.x = Math.cos(time * speed) * radius;
        ring.position.z = Math.sin(time * speed) * radius;
        ring.position.y = 2 + Math.sin(time * speed + index) * 0.3;
      }
    });

    // Particle system around core
    if (particlesRef.current && isActive) {
      particlesRef.current.children.forEach((particle, index) => {
        const particleSpeed = 0.5 + (index * 0.1);
        const particleRadius = 3 + (index * 0.5);
        particle.position.x = Math.cos(time * particleSpeed) * particleRadius;
        particle.position.z = Math.sin(time * particleSpeed) * particleRadius;
        particle.position.y = 2 + Math.sin(time * particleSpeed * 2) * 0.5;
      });
    }
  });

  // Core color based on health
  const coreColor = health >= 80 ? 0x00ff88 : health >= 60 ? 0xffaa00 : health >= 40 ? 0xff6600 : 0xff4444;

  return (
    <group position={[0, 2, 0]}>
      {/* Central Business Core */}
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
      <Sphere ref={energyFieldRef} args={[2.5, 16, 16]}>
        <meshBasicMaterial
          color={new THREE.Color(coreColor)}
          transparent
          opacity={0.15}
        />
      </Sphere>

      {/* Orbiting Energy Rings */}
      {[...Array(4)].map((_, i) => (
        <Torus
          key={`ring-${i}`}
          ref={(el) => { if (el) orbitRingsRef.current[i] = el; }}
          args={[2.5 + i * 0.8, 0.15, 32]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial
            color={new THREE.Color(coreColor)}
            emissive={new THREE.Color(coreColor)}
            emissiveIntensity={0.4}
            transparent
            opacity={0.7}
            roughness={0.2}
            metalness={0.8}
          />
        </Torus>
      ))}

      {/* Particle System */}
      <group ref={particlesRef}>
        {[...Array(8)].map((_, i) => (
          <Sphere
            key={`particle-${i}`}
            args={[0.05, 8, 8]}
            position={[
              Math.cos(i) * 3,
              2,
              Math.sin(i) * 3
            ]}
          >
            <meshBasicMaterial
              color={new THREE.Color(coreColor)}
              emissive={new THREE.Color(coreColor)}
              emissiveIntensity={0.5}
            />
          </Sphere>
        ))}
      </group>

      {/* NO TEXT LABELS ON CORE - just visual representation */}
    </group>
  );
}

// Operations Terminal - Physical objects in the room
function OperationsTerminal({ position, type, activity, onActivate, isActive }: {
  position: [number, number, number];
  type: 'seo' | 'ads' | 'ux' | 'content';
  activity: number;
  onActivate: () => void;
  isActive: boolean;
}) {
  const terminalRef = useRef<THREE.Mesh>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Terminal base animation
    if (terminalRef.current) {
      // Hover/active animation
      const targetScale = isActive ? 1.1 : 1;
      terminalRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Gentle floating when active
      if (isActive) {
        terminalRef.current.position.y = position[1] + Math.sin(time * 3) * 0.1;
      }
    }

    // Screen glow and animation
    if (screenRef.current) {
      const glowIntensity = (activity / 100) * 0.8;
      screenRef.current.material.emissiveIntensity = glowIntensity;
      
      if (isActive) {
        screenRef.current.rotation.z = Math.sin(time * 4) * 0.05;
        // Screen content animation
        const contentScale = 1 + Math.sin(time * 6) * 0.05;
        screenRef.current.scale.set(contentScale, contentScale, 1);
      }
    }

    // Terminal light effect
    if (lightRef.current && isActive) {
      lightRef.current.intensity = (activity / 100) * 2;
      const pulseIntensity = Math.sin(time * 4) * 0.5;
      lightRef.current.intensity += pulseIntensity;
    }
  });

  const terminalConfig = {
    seo: { 
      color: 0x00ff88, 
      lightColor: 0x00ff88,
      label: 'SEO Operations',
      icon: '🔍'
    },
    ads: { 
      color: 0xff6600, 
      lightColor: 0xff6600,
      label: 'Ads Operations', 
      icon: '📢'
    },
    ux: { 
      color: 0x00aaff, 
      lightColor: 0x00aaff,
      label: 'UX Operations', 
      icon: '🎨'
    },
    content: { 
      color: 0xff00ff, 
      lightColor: 0xff00ff,
      label: 'Content Operations', 
      icon: '📝'
    }
  };

  const config = terminalConfig[type];

  return (
    <group position={position}>
      {/* Terminal Light */}
      <pointLight
        ref={lightRef}
        position={[0, 2.5, 0]}
        intensity={0}
        color={new THREE.Color(config.lightColor)}
        distance={5}
      />

      {/* Terminal Base */}
      <Box
        ref={terminalRef}
        args={[1.5, 2.5, 1]}
        onClick={onActivate}
      >
        <meshStandardMaterial
          color={new THREE.Color(0x2a2a3e)}
          roughness={0.6}
          metalness={0.4}
        />
      </Box>

      {/* Terminal Screen */}
      <Box
        ref={screenRef}
        args={[1.2, 1.8, 0.1]}
        position={[0, 0.5, 0.51]}
      >
        <meshStandardMaterial
          color={new THREE.Color(config.color)}
          emissive={new THREE.Color(config.color)}
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </Box>

      {/* Terminal Frame */}
      <Box
        args={[1.6, 2.8, 1.1]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color={new THREE.Color(0x1a1a2e)}
          roughness={0.8}
          metalness={0.2}
        />
      </Box>

      {/* Terminal Base Platform */}
      <Cylinder
        args={[1.2, 1.2, 0.2]}
        position={[0, -1.3, 0]}
      >
        <meshStandardMaterial
          color={new THREE.Color(0x333344)}
          roughness={0.7}
          metalness={0.3}
        />
      </Cylinder>

      {/* Status Ring */}
      {isActive && (
        <Ring
          args={[1.8, 1.9, 16]}
          position={[0, 1.4, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial
            color={new THREE.Color(config.color)}
            transparent
            opacity={0.6}
          />
        </Ring>
      )}

      {/* NO FLOATING TEXT - just visual terminal */}
    </group>
  );
}

// Hexagonal Command Center Room - CLOSED, IMMERSIVE SPACE
function CommandCenterRoom({ worldState }: { worldState: any }) {
  const { scene } = useThree();

  useEffect(() => {
    // Set atmospheric fog for depth
    scene.fog = new THREE.Fog(0x000033, 8, 30);
  }, [scene]);

  return (
    <>
      {/* Room Lighting */}
      <ambientLight intensity={0.15} />
      
      {/* Central Core Light - responds to business health */}
      <pointLight
        position={[0, 2, 0]}
        intensity={worldState.businessHealth / 100}
        color={worldState.businessHealth >= 60 ? 0x00ff88 : 0xff4444}
        distance={15}
      />

      {/* Room Accent Lights - respond to terminal activity */}
      <pointLight
        position={[6, 3, 0]}
        intensity={worldState.seoActivity / 100}
        color={0x00ff88}
        distance={8}
      />
      <pointLight
        position={[-6, 3, 0]}
        intensity={worldState.adsActivity / 100}
        color={0xff6600}
        distance={8}
      />
      <pointLight
        position={[0, 3, 6]}
        intensity={worldState.uxActivity / 100}
        color={0x00aaff}
        distance={8}
      />
      <pointLight
        position={[0, 3, -6]}
        intensity={worldState.contentActivity / 100}
        color={0xff00ff}
        distance={8}
      />

      {/* Hexagonal Room Walls */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 10;
        const z = Math.sin(angle) * 10;
        
        return (
          <Box
            key={`wall-${i}`}
            args={[4, 8, 0.3]}
            position={[x, 4, z]}
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
      <Plane args={[20, 0.1, 20]} position={[0, -1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color={new THREE.Color(0x003366)}
          transparent
          opacity={0.8}
        />
      </Plane>

      {/* Grid Lines on Floor */}
      {[...Array(20)].map((_, i) => (
        <Box
          key={`h-line-${i}`}
          args={[20, 0.02, 0.02]}
          position={[0, -1.38, -10 + i * 1]}
        >
          <meshBasicMaterial
            color={new THREE.Color(0x00ffff)}
            transparent
            opacity={0.4}
          />
        </Box>
      ))}
      {[...Array(20)].map((_, i) => (
        <Box
          key={`v-line-${i}`}
          args={[0.02, 0.02, 20]}
          position={[-10 + i * 1, -1.38, 0]}
        >
          <meshBasicMaterial
            color={new THREE.Color(0x00ffff)}
            transparent
            opacity={0.4}
          />
        </Box>
      ))}

      {/* Ceiling */}
      <Box args={[20, 0.3, 20]} position={[0, 8, 0]}>
        <meshStandardMaterial
          color={new THREE.Color(0x1a1a2e)}
          roughness={0.8}
          metalness={0.2}
        />
      </Box>

      {/* Ambient Particles */}
      {[...Array(50)].map((_, i) => (
        <Sphere
          key={`particle-${i}`}
          args={[0.03, 6, 6]}
          position={[
            (Math.random() - 0.5) * 18,
            Math.random() * 7 + 0.5,
            (Math.random() - 0.5) * 18
          ]}
        >
          <meshBasicMaterial
            color={new THREE.Color(0x00ffff)}
            transparent
            opacity={0.3}
          />
        </Sphere>
      ))}

      {/* Energy Beams between core and terminals */}
      {worldState.activeTerminal && (
        <>
          <Cylinder
            args={[0.05, 0.05, 4]}
            position={[3, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <meshBasicMaterial
              color={worldState.activeTerminal === 'seo' ? new THREE.Color(0x00ff88) : 
                     worldState.activeTerminal === 'ads' ? new THREE.Color(0xff6600) :
                     worldState.activeTerminal === 'ux' ? new THREE.Color(0x00aaff) : 
                     new THREE.Color(0xff00ff)}
              transparent
              opacity={0.6}
            />
          </Cylinder>
        </>
      )}
    </>
  );
}

// Main Scene
function FullCommandCenterScene({ worldState, onTerminalActivate, timeSpeed }: {
  worldState: any;
  onTerminalActivate: (terminal: string) => void;
  timeSpeed: number;
}) {
  const { camera } = useThree();

  useEffect(() => {
    // Set camera inside the room, looking at center
    camera.position.set([0, 4, 8]);
    camera.lookAt(0, 2, 0);
  }, [camera]);

  return (
    <>
      <CommandCenterRoom worldState={worldState} />
      
      {/* Central Business Core */}
      <BusinessCore 
        health={worldState.businessHealth} 
        isActive={worldState.activeTerminal !== null} 
      />
      
      {/* Operations Terminals */}
      <OperationsTerminal
        position={[6, 1.25, 0]}
        type="seo"
        activity={worldState.seoActivity}
        onActivate={() => onTerminalActivate('seo')}
        isActive={worldState.activeTerminal === 'seo'}
      />
      
      <OperationsTerminal
        position={[-6, 1.25, 0]}
        type="ads"
        activity={worldState.adsActivity}
        onActivate={() => onTerminalActivate('ads')}
        isActive={worldState.activeTerminal === 'ads'}
      />
      
      <OperationsTerminal
        position={[0, 1.25, 6]}
        type="ux"
        activity={worldState.uxActivity}
        onActivate={() => onTerminalActivate('ux')}
        isActive={worldState.activeTerminal === 'ux'}
      />
      
      <OperationsTerminal
        position={[0, 1.25, -6]}
        type="content"
        activity={worldState.contentActivity}
        onActivate={() => onTerminalActivate('content')}
        isActive={worldState.activeTerminal === 'content'}
      />
    </>
  );
}

// Main Component
const FullCommandCenter: React.FC = () => {
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

  // Entry animation sequence
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
        const response = await fetch('http://127.0.0.1:5001/api/platform-stats');
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

  // World evolution based on active terminal - NO NUMBERS, just visual changes
  useEffect(() => {
    if (!isPaused && !isEntering) {
      const interval = setInterval(() => {
        setWorldState(prev => {
          let newState = { ...prev };
          
          // Time progression
          newState.worldTime += timeSpeed;
          
          // Terminal effects - visual only, no numbers shown
          if (prev.activeTerminal === 'seo') {
            // SEO: Slow, steady improvement - core stabilizes
            newState.businessHealth = Math.min(100, prev.businessHealth + 0.3 * timeSpeed);
            newState.seoActivity = Math.min(100, prev.seoActivity + 1 * timeSpeed);
          } else if (prev.activeTerminal === 'ads') {
            // Ads: Quick burst, then decay - energy spikes
            newState.adsActivity = Math.min(100, prev.adsActivity + 8 * timeSpeed);
            newState.businessHealth = Math.min(100, prev.businessHealth + 0.8 * timeSpeed);
          } else if (prev.activeTerminal === 'ux') {
            // UX: Stability improvement - smooth motion
            newState.uxActivity = Math.min(100, prev.uxActivity + 1.2 * timeSpeed);
            newState.businessHealth = Math.min(100, prev.businessHealth + 0.5 * timeSpeed);
          } else if (prev.activeTerminal === 'content') {
            // Content: Gradual growth - sustained energy
            newState.contentActivity = Math.min(100, prev.contentActivity + 0.8 * timeSpeed);
            newState.businessHealth = Math.min(100, prev.businessHealth + 0.4 * timeSpeed);
          } else {
            // No activity: Slow decay - room stagnates
            newState.businessHealth = Math.max(20, prev.businessHealth - 0.1 * timeSpeed);
            newState.seoActivity = Math.max(10, prev.seoActivity - 0.3 * timeSpeed);
            newState.adsActivity = Math.max(10, prev.adsActivity - 0.5 * timeSpeed);
            newState.uxActivity = Math.max(10, prev.uxActivity - 0.2 * timeSpeed);
            newState.contentActivity = Math.max(10, prev.contentActivity - 0.3 * timeSpeed);
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
            <div className="w-20 h-20 border-4 border-cyan-400 rounded-full mx-auto animate-pulse">
              <div className="w-full h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 animate-spin-slow"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-cyan-400 mb-4">ENTERING COMMAND CENTER</h1>
          <p className="text-cyan-200 mb-8 text-xl">Initializing Operations Room...</p>
          <div className="w-80 h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 4 }}
            />
          </div>
          <p className="text-cyan-300 text-sm mt-4">Preparing your command environment...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Fullscreen WebGL Canvas */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 4, 8], fov: 75 }}>
          <Suspense fallback={null}>
            <FullCommandCenterScene
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

      {/* Minimal HUD - NO NUMBERS IN 3D SPACE */}
      <div className="absolute top-4 left-4 text-cyan-400 font-mono text-sm bg-black/60 p-3 rounded backdrop-blur-sm">
        <div>MBOCC - Operations Command Center</div>
        <div className="text-xs text-cyan-300 mt-1">{apiStatus}</div>
      </div>

      {/* Time Display - NO NUMBERS IN 3D */}
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

      {/* 2D Analytics Panel - SLIDES IN/OUT, NO NUMBERS IN 3D */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute right-4 top-20 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-cyan-500/30 w-72"
          >
            <h3 className="text-cyan-400 font-semibold mb-3">Operations Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-cyan-200">
                <span>Business Health:</span>
                <span className={worldState.businessHealth >= 60 ? 'text-green-400' : 'text-red-400'}>
                  {worldState.businessHealth}%
                </span>
              </div>
              <div className="flex justify-between text-cyan-200">
                <span>SEO Operations:</span>
                <span>{worldState.seoActivity}%</span>
              </div>
              <div className="flex justify-between text-cyan-200">
                <span>Ads Operations:</span>
                <span>{worldState.adsActivity}%</span>
              </div>
              <div className="flex justify-between text-cyan-200">
                <span>UX Operations:</span>
                <span>{worldState.uxActivity}%</span>
              </div>
              <div className="flex justify-between text-cyan-200">
                <span>Content Operations:</span>
                <span>{worldState.contentActivity}%</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-cyan-500/30">
              <div className="text-xs text-cyan-300">
                Active Terminal: {worldState.activeTerminal || 'None'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FullCommandCenter;
