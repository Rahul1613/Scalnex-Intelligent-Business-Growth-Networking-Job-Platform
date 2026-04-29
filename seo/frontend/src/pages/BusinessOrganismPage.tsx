import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Stars, Float, Environment, OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Heart, Brain, FlaskConical } from 'lucide-react';

import OrganismCore from '../organism/OrganismCore';
import OrganismBrain from '../organism/OrganismBrain';
import DecisionLab from '../organism/DecisionLab';
import ARProjection from '../organism/ARProjection';
import TimeStateController from '../metaverse/TimeStateController'; // Reuse this component

interface OrganismState {
    organism_id: string;
    last_synced: string;
    timeline: Record<string, any>;
}

const BusinessOrganismPage: React.FC = () => {
    const [state, setState] = useState<OrganismState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(true);
    const [timeState, setTimeState] = useState<string>('present');
    const [viewMode, setViewMode] = useState<'vr' | 'ar'>('vr');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchOrganismState();
    }, []);

    const fetchOrganismState = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://127.0.0.1:5001/api/analytics/organism-state', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to synchronize Bio-Digital Link');
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

    const handleActionSelect = async (actionId: string) => {
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
                    decision: actionId
                })
            });

            if (!response.ok) throw new Error('Simulation failed');
            const result = await response.json();

            // Update future biological states
            setState(prev => {
                if (!prev) return prev;
                const newTimeline = { ...prev.timeline };

                const updateNode = (key: string, data: any) => {
                    if (!newTimeline[key]) return;
                    newTimeline[key] = {
                        ...newTimeline[key],
                        metrics: data,
                        biology: {
                            ...newTimeline[key].biology,
                            size: 0.8 + (data.revenue / 50000),
                            skin_color: data.color,
                            heartbeat_speed: 0.5 + (data.organic_traffic / 10000),
                            neural_glow: 1.0 + (data.backlinks / 1000),
                            mutation_rate: 0.1 + (100 - data.seo_score) / 200,
                            status: data.status
                        },
                        ai_brain: {
                            ...newTimeline[key].ai_brain,
                            diagnosis: result[`narration_${key.split('_')[1]}`] || newTimeline[key].ai_brain.diagnosis
                        }
                    };
                };

                updateNode('future_3m', result.future_3m);
                updateNode('future_6m', result.future_6m);

                return { ...prev, timeline: newTimeline };
            });

            setTimeState('future_3m');
        } catch (err: any) {
            console.error('Action error:', err);
        }
    };

    if (loading) return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-8" />
            <h2 className="text-emerald-500 font-black text-2xl tracking-[0.5em] animate-pulse">INCUBATING BUSINESS ORGANISM</h2>
            <p className="text-emerald-900 mt-4 font-mono text-sm">Mapping Multi-Cycle Bio-Data...</p>
        </div>
    );

    if (error) return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-red-500 text-2xl font-black mb-4 uppercase tracking-[0.2em]">Bio-Link Termination</h2>
            <p className="text-white mb-8">{error}</p>
            <button onClick={() => window.history.back()} className="px-8 py-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all font-bold">EXIT LAB</button>
        </div>
    );

    const currentNode = state?.timeline[timeState];

    return (
        <div ref={containerRef} className="fixed inset-0 bg-[#050505] overflow-hidden font-sans select-none">
            {/* Bio-Lab HUD */}
            <div className="absolute inset-0 z-50 pointer-events-none p-8 flex flex-col justify-between">
                {/* Header Stats */}
                <div className="flex justify-between items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-black/60 backdrop-blur-xl border border-emerald-500/20 rounded-[2rem] p-8 pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,1)] animate-pulse" />
                            <div>
                                <h1 className="text-white text-2xl font-black uppercase tracking-tighter">AI Business Organism</h1>
                                <div className="text-emerald-500/60 text-[10px] font-mono uppercase tracking-[0.3em]">Living Digital Twin v4.0</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <div className="text-white/40 text-[10px] uppercase font-black tracking-widest mb-1 flex items-center gap-2">
                                    <Brain className="w-3 h-3 text-emerald-500" /> Neural Sync
                                </div>
                                <div className="text-2xl font-black text-white">{currentNode?.metrics.seo_score}%</div>
                            </div>
                            <div>
                                <div className="text-white/40 text-[10px] uppercase font-black tracking-widest mb-1 flex items-center gap-2">
                                    <Heart className="w-3 h-3 text-red-500" /> Circulation
                                </div>
                                <div className="text-2xl font-black text-white">{(currentNode?.metrics.organic_traffic / 1000).toFixed(1)}K</div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="flex gap-4 pointer-events-auto">
                        <button
                            onClick={() => setViewMode(viewMode === 'vr' ? 'ar' : 'vr')}
                            className="w-16 h-16 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 text-white hover:bg-white/10 transition-all font-black"
                        >
                            {viewMode.toUpperCase()}
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="w-16 h-16 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 text-white hover:bg-white/10 transition-all"
                        >
                            {isFullscreen ? <Minimize2 /> : <Maximize2 />}
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="w-16 h-16 bg-red-500/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all"
                        >
                            <X />
                        </button>
                    </div>
                </div>

                {/* Bottom Interaction Area */}
                <div className="flex flex-col gap-8">
                    {/* Diagnosis Panel */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={timeState}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-emerald-500/5 backdrop-blur-xl border border-emerald-500/10 p-6 rounded-[2rem] max-w-2xl"
                        >
                            <div className="flex items-center gap-3 mb-3 text-emerald-500 font-black text-xs uppercase tracking-widest">
                                <FlaskConical className="w-4 h-4" />
                                AI Brain Diagnosis
                            </div>
                            <p className="text-white/80 text-lg leading-relaxed italic font-medium">
                                "{currentNode?.ai_brain.diagnosis} Evolutionary path analysis suggests {currentNode?.ai_brain.evolution_path.toLowerCase()}."
                            </p>
                            <div className="mt-4 text-emerald-500/60 text-xs font-mono">
                                PROVISIONAL PREDICTION: {currentNode?.ai_brain.prediction}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex justify-between items-end">
                        <div className="pointer-events-auto">
                            <TimeStateController currentTime={timeState} onTimeChange={setTimeState} />
                        </div>

                        {timeState === 'present' && (
                            <div className="pointer-events-auto">
                                <DecisionLab actions={currentNode.lab_actions} onAction={handleActionSelect} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="absolute inset-0 z-10">
                <Canvas shadows dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
                    <Suspense fallback={null}>
                        <ambientLight intensity={0.2} />
                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color={currentNode?.biology.skin_color} />
                        <pointLight position={[-10, -10, -10]} intensity={1} color="#00ffff" />

                        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                            <OrganismCore biology={currentNode?.biology} />
                            <OrganismBrain biology={currentNode?.biology} />
                        </Float>

                        <Environment preset="night" />
                        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                        <OrbitControls
                            enablePan={false}
                            minDistance={10}
                            maxDistance={30}
                            autoRotate
                            autoRotateSpeed={0.5}
                        />

                        {viewMode === 'ar' && <ARProjection biology={currentNode?.biology} />}
                    </Suspense>
                </Canvas>
            </div>

            {/* Post-Processing Effects Layer */}
            <div className="absolute inset-0 pointer-events-none z-[60]">
                {/* Bio-Glow vignette */}
                <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(16,185,129,0.05)]" />
                {/* Scanning lines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20 pointer-events-none" />
            </div>
        </div>
    );
};

export default BusinessOrganismPage;
