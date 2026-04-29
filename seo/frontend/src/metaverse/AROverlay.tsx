import React from 'react';
import { Html } from '@react-three/drei';

const AROverlay: React.FC = () => {
    return (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
            <div className="absolute inset-0 border-[20px] border-emerald-500/10 pointer-events-none">
                {/* AR Corner Frames */}
                <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />

                {/* AR Targeting Crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-16 h-16 border-2 border-emerald-500/20 rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                    </div>
                </div>

                {/* AR Status Label */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-emerald-500 px-6 py-2 rounded-full">
                    <span className="text-black font-black text-xs uppercase tracking-[0.3em]">Holographic Surface Detected</span>
                </div>

                {/* AR Instructions */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 font-mono text-[10px] uppercase tracking-[0.2em] animate-pulse">
                    Walk around the visualization to inspect Digital Twin nodes
                </div>
            </div>
        </Html>
    );
};

export default AROverlay;
