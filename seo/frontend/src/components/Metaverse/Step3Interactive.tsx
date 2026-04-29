import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, X, Play, Pause, FastForward } from 'lucide-react';

// Animated Business Core
function AnimatedCore({ health, isActive }: { health: number; isActive: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (coreRef.current) {
      const time = state.clock.elapsedTime;
      
      // Pulsing based on health
      const pulseIntensity = (health / 100) * 0.1;
      const scale = 1 + Math.sin(time * 2) * pulseIntensity;
      coreRef.current.scale.set(scale, scale, scale);
      
      // Rotation
      coreRef.current.rotation.y = time * 0.3;
      
      // Instability when health is low
      if (health < 50) {
        const instability = (50 - health) / 50 * 0.02;
        coreRef.current.position.x += (Math.random() - 0.5) * instability;
        coreRef.current.position.z += (Math.random() - 0.5) * instability;
      }
    }
  });

  const coreColor = health >= 80 ? 0x00ff88 : health >= 60 ? 0xffaa00 : health >= 40 ? 0xff6600 : 0xff4444;

  return (
    <group position={[0, 2, 0]}>
      <Sphere ref={coreRef} args={[1.5, 32, 32]}>
        <meshStandardMaterial
          color={new THREE.Color(coreColor)}
          emissive={new THREE.Color(coreColor)}
          emissiveIntensity={0.8}
        />
      </Sphere>
      
      {/* Orbiting rings */}
      {[...Array(3)].map((_, i) => (
        <Box
          key={i}
          args={[3 + i * 0.5, 0.1, 0.1]}
          position={[0, 2, 0]}
          rotation={[0, (i * Math.PI) / 3, 0]}
        >
          <meshStandardMaterial 
            color={new THREE.Color(coreColor)} 
            emissive={new THREE.Color(coreColor)} 
            emissiveIntensity={0.4} 
          />
        </Box>
      ))}
    </group>
  );
}

// Interactive Terminal
function InteractiveTerminal({ 
  position, 
  color, 
  isActive, 
  onClick 
}: { 
  position: [number, number, number]; 
  color: string; 
  isActive: boolean; 
  onClick: () => void; 
}) {
  const terminalRef = useRef<THREE.Mesh>(null);
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Terminal animation
    if (terminalRef.current) {
      const targetScale = isActive ? 1.1 : 1;
      terminalRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      if (isActive) {
        terminalRef.current.position.y = position[1] + Math.sin(time * 3) * 0.1;
      }
    }

    // Screen glow
    if (screenRef.current) {
      const glowIntensity = isActive ? 0.8 : 0.3;
      screenRef.current.material.emissiveIntensity = glowIntensity;
      
      if (isActive) {
        screenRef.current.rotation.z = Math.sin(time * 4) * 0.05;
      }
    }
  });

  return (
    <group position={position}>
      <Box
        ref={terminalRef}
        args={[1.5, 2.5, 1]}
        onClick={onClick}
      >
        <meshStandardMaterial color="#2a2a3e" />
      </Box>
      
      <Box
        ref={screenRef}
        args={[1.2, 1.8, 0.1]}
        position={[0, 0.5, 0.51]}
      >
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </Box>
    </group>
  );
}

// Room with lighting
function CommandRoom({ worldState }: { worldState: any }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      
      {/* Dynamic lighting based on activity */}
      <pointLight
        position={[0, 5, 0]}
        intensity={worldState.businessHealth / 100}
        color={worldState.businessHealth >= 60 ? 0x00ff88 : 0xff4444}
      />
      <pointLight
        position={[6, 3, 0]}
        intensity={worldState.seoActivity / 100}
        color={0x00ff88}
      />
      <pointLight
        position={[-6, 3, 0]}
        intensity={worldState.adsActivity / 100}
        color={0xff6600}
      />
      <pointLight
        position={[0, 3, 6]}
        intensity={worldState.uxActivity / 100}
        color={0x00aaff}
      />
      <pointLight
        position={[0, 3, -6]}
        intensity={worldState.contentActivity / 100}
        color={0xff00ff}
      />

      {/* Room structure */}
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
            <meshStandardMaterial color="#1a1a2e" />
          </Box>
        );
      })}

      <Box args={[20, 0.1, 20]} position={[0, -1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#003366" />
      </Box>

      {[...Array(10)].map((_, i) => (
        <Box
          key={`h-line-${i}`}
          args={[20, 0.02, 0.02]}
          position={[0, -1.38, -10 + i * 2]}
        >
          <meshBasicMaterial color="#00ffff" transparent opacity={0.4} />
        </Box>
      ))}
      {[...Array(10)].map((_, i) => (
        <Box
          key={`v-line-${i}`}
          args={[0.02, 0.02, 20]}
          position={[-10 + i * 2, -1.38, 0]}
        >
          <meshBasicMaterial color="#00ffff" transparent opacity={0.4} />
        </Box>
      ))}

      <Box args={[20, 0.3, 20]} position={[0, 8, 0]}>
        <meshStandardMaterial color="#1a1a2e" />
      </Box>

      {/* Particles */}
      {[...Array(30)].map((_, i) => (
        <Sphere
          key={`particle-${i}`}
          args={[0.02, 4, 4]}
          position={[
            (Math.random() - 0.5) * 18,
            Math.random() * 7 + 0.5,
            (Math.random() - 0.5) * 18
          ]}
        >
          <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
        </Sphere>
      ))}
    </>
  );
}

const Step3Interactive: React.FC = () => {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // World evolution
  useEffect(() => {
    if (!isPaused && !isEntering) {
      const interval = setInterval(() => {
        setWorldState(prev => {
          let newState = { ...prev };
          newState.worldTime += timeSpeed;
          
          if (prev.activeTerminal === 'seo') {
            newState.businessHealth = Math.min(100, prev.businessHealth + 0.3 * timeSpeed);
            newState.seoActivity = Math.min(100, prev.seoActivity + 1 * timeSpeed);
          } else if (prev.activeTerminal === 'ads') {
            newState.adsActivity = Math.min(100, prev.adsActivity + 8 * timeSpeed);
            newState.businessHealth = Math.min(100, prev.businessHealth + 0.8 * timeSpeed);
          } else if (prev.activeTerminal === 'ux') {
            newState.uxActivity = Math.min(100, prev.uxActivity + 1.2 * timeSpeed);
            newState.businessHealth = Math.min(100, prev.businessHealth + 0.5 * timeSpeed);
          } else if (prev.activeTerminal === 'content') {
            newState.contentActivity = Math.min(100, prev.contentActivity + 0.8 * timeSpeed);
            newState.businessHealth = Math.min(100, prev.businessHealth + 0.4 * timeSpeed);
          } else {
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

  const handleTerminalClick = (terminal: string) => {
    setWorldState(prev => ({
      ...prev,
      activeTerminal: prev.activeTerminal === terminal ? null : terminal
    }));
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
          className="text-center"
        >
          <Monitor className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">STEP 3: Interactive Command</h1>
          <p className="text-cyan-200">Loading Operations...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 4, 12], fov: 75 }}>
          <CommandRoom worldState={worldState} />
          <AnimatedCore 
            health={worldState.businessHealth} 
            isActive={worldState.activeTerminal !== null} 
          />
          
          <InteractiveTerminal
            position={[6, 1.25, 0]}
            color="#00ff88"
            isActive={worldState.activeTerminal === 'seo'}
            onClick={() => handleTerminalClick('seo')}
          />
          <InteractiveTerminal
            position={[-6, 1.25, 0]}
            color="#ff6600"
            isActive={worldState.activeTerminal === 'ads'}
            onClick={() => handleTerminalClick('ads')}
          />
          <InteractiveTerminal
            position={[0, 1.25, 6]}
            color="#00aaff"
            isActive={worldState.activeTerminal === 'ux'}
            onClick={() => handleTerminalClick('ux')}
          />
          <InteractiveTerminal
            position={[0, 1.25, -6]}
            color="#ff00ff"
            isActive={worldState.activeTerminal === 'content'}
            onClick={() => handleTerminalClick('content')}
          />
          
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={8}
            maxDistance={20}
          />
        </Canvas>
      </div>

      {/* Status */}
      <div className="absolute top-4 left-4 text-cyan-400 font-mono text-sm bg-black/60 p-3 rounded">
        <div>MBOCC - Interactive</div>
        <div className="text-xs text-cyan-300 mt-1">Click terminals to activate</div>
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
          Click terminals to activate • Watch core respond • Time controls active
        </div>
      </div>
    </div>
  );
};

export default Step3Interactive;
