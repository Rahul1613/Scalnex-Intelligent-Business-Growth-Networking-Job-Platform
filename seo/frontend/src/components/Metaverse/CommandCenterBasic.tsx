import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Box, Sphere, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Monitor, X } from 'lucide-react';

// Very simple 3D scene
function SimpleScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      <Box position={[0, 1, 0]} args={[2, 2, 2]}>
        <meshStandardMaterial color="orange" />
      </Box>
      
      <Sphere position={[3, 1, 0]} args={[1, 32, 32]}>
        <meshStandardMaterial color="cyan" />
      </Sphere>
      
      <Box position={[-3, 1, 0]} args={[1, 1, 1]}>
        <meshStandardMaterial color="pink" />
      </Box>
    </>
  );
}

const CommandCenterBasic: React.FC = () => {
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
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">ENTERING COMMAND CENTER</h1>
          <p className="text-cyan-200">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [8, 6, 8], fov: 75 }}>
          <SimpleScene />
          <OrbitControls />
        </Canvas>
      </div>

      {/* Status */}
      <div className="absolute top-4 left-4 text-cyan-400 font-mono text-sm bg-black/60 p-3 rounded">
        <div>Command Center - Basic Mode</div>
        <div className="text-xs text-cyan-300 mt-1">3D Rendering Active</div>
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
          Use mouse to rotate • Scroll to zoom • Basic 3D test
        </div>
      </div>
    </div>
  );
};

export default CommandCenterBasic;
