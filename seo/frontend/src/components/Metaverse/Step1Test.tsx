import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Box, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Monitor, X } from 'lucide-react';

// Simple 3D Box
function TestBox() {
  return (
    <Box position={[0, 0, 0]} args={[2, 2, 2]}>
      <meshStandardMaterial color="orange" />
    </Box>
  );
}

const Step1Test: React.FC = () => {
  const [isEntering, setIsEntering] = useState(true);
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
      setShow3D(true);
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
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">STEP 1: Testing Three.js</h1>
          <p className="text-cyan-200">Loading 3D Engine...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [5, 5, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <TestBox />
          <OrbitControls />
        </Canvas>
      </div>

      {/* Status */}
      <div className="absolute top-4 left-4 text-cyan-400 font-mono text-sm bg-black/60 p-3 rounded">
        <div>STEP 1: Three.js Test</div>
        <div className="text-xs text-cyan-300 mt-1">Orange Box Visible?</div>
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
          You should see an orange box • Use mouse to rotate
        </div>
      </div>
    </div>
  );
};

export default Step1Test;
