import React from 'react';
import { Html } from '@react-three/drei';

interface ARProjectionProps {
    biology: any;
}

const ARProjection: React.FC<ARProjectionProps> = ({ biology }) => {
    return (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
            <div className="absolute inset-0 border-[30px] border-emerald-500/5 pointer-events-none">
                {/* Scanner Framework */}
                <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-emerald-500/50" />
                <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-emerald-500/50" />
                <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-emerald-500/50" />
                <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-emerald-500/50" />

                {/* Vertical Scanning Bar */}
                <div className="absolute left-0 right-0 h-px bg-emerald-500/20 top-0 animate-[scan_4s_linear_infinite]" />

                {/* Vital HUD Elements (Floating around organism) */}
                <div className="absolute top-[20%] right-[10%] space-y-4">
                    <div className="bg-black/60 backdrop-blur-md border border-emerald-500/20 p-4 rounded-xl">
                        <div className="text-[10px] font-black text-emerald-500 uppercase">Mutation Rate</div>
                        <div className="text-xl font-black text-white">{(biology?.mutation_rate * 100).toFixed(1)}%</div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md border border-emerald-500/20 p-4 rounded-xl">
                        <div className="text-[10px] font-black text-emerald-500 uppercase">Neural Sync</div>
                        <div className="text-xl font-black text-white">{biology?.neural_glow.toFixed(2)}x</div>
                    </div>
                </div>

                {/* Bottom Center Status */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="px-6 py-2 bg-emerald-500 text-black font-black uppercase text-xs tracking-widest rounded-full shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                        Holographic Sync Active
                    </div>
                    <div className="mt-4 text-white/20 font-mono text-[10px] animate-pulse">
                        SENSING PHYSICAL SURFACE FOR BIO-PROJECTION...
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes scan {
                    from { top: 0%; }
                    to { top: 100%; }
                }
            `}</style>
        </Html>
    );
};

export default ARProjection;
