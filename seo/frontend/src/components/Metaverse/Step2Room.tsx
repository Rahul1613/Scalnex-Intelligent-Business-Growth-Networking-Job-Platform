import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Box, Sphere, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Monitor, X } from 'lucide-react';

// Central Business Core
function BusinessCore() {
  return (
    <group position={[0, 2, 0]}>
      <Sphere args={[1.5, 32, 32]}>
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.8} />
      </Sphere>
      
      {/* Orbiting rings */}
      {[...Array(3)].map((_, i) => (
        <Box
          key={i}
          args={[3 + i * 0.5, 0.1, 0.1]}
          position={[0, 2, 0]}
          rotation={[0, (i * Math.PI) / 3, 0]}
        >
          <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.4} />
        </Box>
      ))}
    </group>
  );
}

// Terminal
function Terminal({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <Box args={[1.5, 2.5, 1]}>
        <meshStandardMaterial color="#2a2a3e" />
      </Box>
      
      <Box args={[1.2, 1.8, 0.1]} position={[0, 0.5, 0.51]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Box>
    </group>
  );
}

// Room
function CommandRoom() {
  return (
    <>
      {/* Hexagonal walls */}
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

      {/* Floor */}
      <Box args={[20, 0.1, 20]} position={[0, -1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#003366" />
      </Box>

      {/* Grid lines on floor */}
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

      {/* Ceiling */}
      <Box args={[20, 0.3, 20]} position={[0, 8, 0]}>
        <meshStandardMaterial color="#1a1a2e" />
      </Box>
    </>
  );
}

const Step2Room: React.FC = () => {
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleExit = () => {
    window.close();
    window.location.href = '/dashboard';
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
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">STEP 2: Building Room</h1>
          <p className="text-cyan-200">Creating Command Center...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 4, 12], fov: 75 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[0, 5, 0]} intensity={1} color="#00ff88" />
          <pointLight position={[6, 3, 0]} intensity={0.5} color="#00ff88" />
          <pointLight position={[-6, 3, 0]} intensity={0.5} color="#ff6600" />
          <pointLight position={[0, 3, 6]} intensity={0.5} color="#00aaff" />
          <pointLight position={[0, 3, -6]} intensity={0.5} color="#ff00ff" />
          
          <CommandRoom />
          <BusinessCore />
          
          <Terminal position={[6, 1.25, 0]} color="#00ff88" />
          <Terminal position={[-6, 1.25, 0]} color="#ff6600" />
          <Terminal position={[0, 1.25, 6]} color="#00aaff" />
          <Terminal position={[0, 1.25, -6]} color="#ff00ff" />
          
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
        <div>STEP 2: Command Room</div>
        <div className="text-xs text-cyan-300 mt-1">Room + Core + Terminals</div>
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
          Hexagonal room • Green core • 4 terminals • Use mouse to explore
        </div>
      </div>
    </div>
  );
};

export default Step2Room;
