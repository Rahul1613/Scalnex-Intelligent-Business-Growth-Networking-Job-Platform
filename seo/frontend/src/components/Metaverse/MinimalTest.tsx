import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, X } from 'lucide-react';

const MinimalTest: React.FC = () => {
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
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">ENTERING COMMAND CENTER</h1>
          <p className="text-cyan-200">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Simple 3D Test Area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse mb-4"></div>
          <h2 className="text-2xl font-bold text-cyan-400 mb-2">Command Center Active</h2>
          <p className="text-cyan-200">Basic rendering test successful</p>
          <div className="mt-4 text-sm text-cyan-300">
            3D Canvas ready • React working • Animations active
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="absolute top-4 left-4 text-cyan-400 font-mono text-sm bg-black/60 p-3 rounded">
        <div>MBOCC - Minimal Test</div>
        <div className="text-xs text-cyan-300 mt-1">Basic Mode Active</div>
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
          Basic test successful • Ready for 3D implementation
        </div>
      </div>
    </div>
  );
};

export default MinimalTest;
