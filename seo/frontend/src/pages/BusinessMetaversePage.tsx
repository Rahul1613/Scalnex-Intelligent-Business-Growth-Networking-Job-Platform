import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Stars, Sky, OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Clock, Info, Activity } from 'lucide-react';

import WorldScene from '../metaverse/WorldScene';
import AIAdvisorEntity from '../metaverse/AIAdvisorEntity';
import DecisionNodes from '../metaverse/DecisionNodes';
import TimeStateController from '../metaverse/TimeStateController';
import AROverlay from '../metaverse/AROverlay';

interface MetaverseState {
    current_time_state: string;
    timeline: Record<string, any>;
    world_metadata: any;
}

const BusinessMetaversePage: React.FC = () => {
    const [state, setState] = useState<MetaverseState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(true);
    const [timeState, setTimeState] = useState<string>('present');
    const [viewMode, setViewMode] = useState<'vr' | 'ar'>('vr');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMetaverseState();
    }, []);

    const fetchMetaverseState = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://127.0.0.1:5001/api/analytics/metaverse-state', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to load Metaverse core');
            const data = await response.json();
            setState(data);
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleDecisionSelect = async (decision: string) => {
        if (!state) return;

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://127.0.0.1:5001/api/analytics/time-travel/simulate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    timeline_data: state.timeline,
                    decision: decision
                })
            });

            if (!response.ok) throw new Error('Simulation failed');
            const result = await response.json();

            // Update future nodes with new predictions
            setState(prev => {
                if (!prev) return prev;
                const newTimeline = { ...prev.timeline };

                const updateNode = (key: string, data: any) => {
                    if (!newTimeline[key]) return;
                    newTimeline[key] = {
                        ...newTimeline[key],
                        metrics: data,
                        environment: {
                            ...newTimeline[key].environment,
                            building_scale: 0.5 + (data.seo_score / 100),
                            traffic_density: 0.2 + (data.organic_traffic / 20000),
                            energy_flow: 0.1 + (data.revenue / 100000),
                            sky_color: data.color,
                            lighting_intensity: data.intensity,
                            ambient_motion_speed: data.particle_speed
                        },
                        ai_advisor: {
                            ...newTimeline[key].ai_advisor,
                            mood: data.status,
                            intensity: data.intensity,
                            message: result[`narration_${key.split('_')[1]}`] || newTimeline[key].ai_advisor.message
                        }
                    };
                };

                updateNode('future_3m', result.future_3m);
                updateNode('future_6m', result.future_6m);

                return { ...prev, timeline: newTimeline };
            });

            setTimeState('future_3m'); // Auto-jump to see impact
        } catch (err: any) {
            console.error('Decision error:', err);
        }
    };

    if (loading) return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]">
            <div className="w-1 px-1 h-32 bg-emerald-500/20 rounded-full mb-8 relative overflow-hidden">
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: "-100%" }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 bg-emerald-500"
                />
            </div>
            <h2 className="text-emerald-500 font-black text-2xl tracking-[0.5em] animate-pulse">SYNCHRONIZING DIGITAL TWIN</h2>
            <p className="text-emerald-900 mt-4 font-mono text-sm">Building Persistent World State...</p>
        </div>
    );

    if (error) return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-red-500 text-2xl font-black mb-4 uppercase tracking-[0.2em]">Quantum Link Failure</h2>
            <p className="text-white mb-8">{error}</p>
            <button onClick={() => window.history.back()} className="px-8 py-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all font-bold">RETURN TO REALITY</button>
        </div>
    );

    const currentNode = state?.timeline[timeState];

    return (
        <div ref={containerRef} className="fixed inset-0 bg-black overflow-hidden font-sans select-none">
            {/* Immersive HUD */}
            <div className="absolute inset-0 z-50 pointer-events-none p-6 flex flex-col justify-between">
                {/* Top HUD */}
                <div className="flex justify-between items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 pointer-events-auto"
                    >
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse" />
                            <h1 className="text-white text-xl font-black uppercase tracking-widest">AI Business Metaverse</h1>
                        </div>
                        <div className="text-white/40 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            World State: <span className="text-emerald-400 font-black">{timeState.replace('_', ' ')}</span>
                        </div>
                    </motion.div>

                    <div className="flex gap-4 pointer-events-auto">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setViewMode(viewMode === 'vr' ? 'ar' : 'vr')}
                            className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 text-white hover:bg-white/20 transition-all font-black text-sm"
                        >
                            {viewMode.toUpperCase()}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleFullscreen}
                            className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 text-white hover:bg-white/20 transition-all"
                        >
                            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => window.history.back()}
                            className="w-14 h-14 bg-red-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-red-500/30 text-red-500 hover:bg-red-500/40 transition-all"
                        >
                            <X className="w-6 h-6" />
                        </motion.button>
                    </div>
                </div>

                {/* Bottom HUD */}
                <div className="flex flex-col gap-6">
                    {/* Time Controller Overlay */}
                    <div className="pointer-events-auto">
                        <TimeStateController currentTime={timeState} onTimeChange={setTimeState} />
                    </div>

                    {/* Stats HUD */}
                    <div className="flex justify-between items-end">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 pointer-events-auto w-80"
                        >
                            <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                <Activity className="w-3 h-3" />
                                Real-time Business Vitals
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'SEO Authority', value: currentNode?.metrics.seo_score, unit: '%' },
                                    { label: 'Organic Traffic', value: (currentNode?.metrics.organic_traffic / 1000).toFixed(1), unit: 'K' },
                                    { label: 'Revenue Flow', value: (currentNode?.metrics.revenue / 1000).toFixed(1), unit: 'K' }
                                ].map((stat, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs font-bold text-white mb-1">
                                            <span>{stat.label}</span>
                                            <span>{stat.value}{stat.unit}</span>
                                        </div>
                                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, (Number(stat.value) / 100) * 100)}%` }}
                                                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <div className="flex flex-col items-end gap-2 text-white/20 font-mono text-[10px] uppercase tracking-widest">
                            <div>Persistent Metaverse Session</div>
                            <div>Digital Twin Node: {state?.world_metadata.city_name}</div>
                            <div>Last Sync: {new Date(state?.world_metadata.last_updated).toLocaleTimeString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Advisor Chat Box (Floating) */}
            <AnimatePresence>
                {currentNode?.ai_advisor.message && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-40 left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
                    >
                        <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-2xl max-w-lg text-emerald-400 text-sm font-medium leading-relaxed shadow-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Neural Link Narration</span>
                            </div>
                            {currentNode.ai_advisor.message}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3D Core Viewport */}
            <div className="absolute inset-0 z-10">
                <Canvas shadows dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[0, 10, 40]} fov={50} />

                    <Suspense fallback={null}>
                        {/* Lighting reflects Health color */}
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 20, 10]} intensity={currentNode?.environment.lighting_intensity || 1} color={currentNode?.environment.sky_color} />
                        <spotLight position={[-20, 20, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

                        {/* Environment */}
                        <Sky
                            turbidity={0.1}
                            rayleigh={currentNode?.environment.lighting_intensity}
                            mieCoefficient={0.005}
                            mieDirectionalG={0.8}
                            sunPosition={[100, 20, 100]}
                        />
                        <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={currentNode?.environment.ambient_motion_speed} />

                        {/* The Living City */}
                        <WorldScene nodeData={currentNode} />

                        {/* The AI Advisor Entity */}
                        <AIAdvisorEntity status={currentNode?.ai_advisor.mood} intensity={currentNode?.ai_advisor.intensity} />

                        {/* Decision Nodes (Interactive Buildings) */}
                        {timeState === 'present' && currentNode?.decisions && (
                            <DecisionNodes
                                decisions={currentNode.decisions}
                                onDecisionSelect={handleDecisionSelect}
                            />
                        )}

                        <OrbitControls
                            enablePan={false}
                            maxPolarAngle={Math.PI / 2.1}
                            minDistance={20}
                            maxDistance={100}
                        />
                    </Suspense>

                    {/* AR Mode Rendering Context */}
                    {viewMode === 'ar' && <AROverlay />}
                </Canvas>
            </div>

            {/* Noise & Scanline Overlay for "Simulation" feel */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-[100]" />
        </div>
    );
};

export default BusinessMetaversePage;
