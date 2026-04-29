import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface DecisionNodesProps {
    decisions: string[];
}

const DecisionNodes: React.FC<DecisionNodesProps & { onDecisionSelect?: (id: string) => void }> = ({ decisions, onDecisionSelect }) => {
    const [hovered, setHovered] = useState<number | null>(null);

    const decisionMap: Record<string, { label: string, color: string, pos: [number, number, number] }> = {
        'optimize_technical_seo': { label: 'Technical SEO', color: '#00ccff', pos: [12, 5, 0] },
        'improve_content_quality': { label: 'Content Quality', color: '#00ff88', pos: [-12, 5, 12] },
        'increase_ad_budget': { label: 'Ad Budget', color: '#ffcc00', pos: [0, 8, -15] },
        'improve_page_speed': { label: 'Page Performance', color: '#ff3300', pos: [8, 12, 8] }
    };

    return (
        <group>
            {decisions.map((id, i) => {
                const config = decisionMap[id];
                if (!config) return null;

                return (
                    <group key={id} position={config.pos}>
                        <FloatNode
                            color={config.color}
                            isHovered={hovered === i}
                            onPointerOver={() => setHovered(i)}
                            onPointerOut={() => setHovered(null)}
                        />

                        <Html distanceFactor={15} position={[0, 2, 0]} center>
                            <div className="pointer-events-none select-none">
                                <div className={`
                    bg-black/80 backdrop-blur-xl border border-white/20 p-4 rounded-2xl whitespace-nowrap
                    transition-all duration-500 transform
                    ${hovered === i ? 'scale-110 -translate-y-2 opacity-100 shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'scale-90 opacity-40'}
                `}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: config.color }} />
                                        <span className="text-white font-black text-sm uppercase tracking-widest">{config.label}</span>
                                    </div>
                                    {hovered === i && (
                                        <div className="mt-2 flex flex-col gap-2">
                                            <div className="text-[10px] text-white/40 font-mono">SIMULATION_READY</div>
                                            <button
                                                onClick={() => onDecisionSelect?.(id)}
                                                className="pointer-events-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-black py-2 px-4 rounded-xl transition-all"
                                            >
                                                ACTIVATE_DECISION
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent mx-auto mt-2" />
                            </div>
                        </Html>
                    </group>
                );
            })}
        </group>
    );
};

const FloatNode: React.FC<{ color: string, isHovered: boolean, onPointerOver: () => void, onPointerOut: () => void }> = ({ color, isHovered, onPointerOver, onPointerOut }) => {
    const meshRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.5;
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <group ref={meshRef} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
            <Box args={[1, 1, 1]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={isHovered ? 5 : 2}
                    transparent
                    opacity={0.8}
                />
            </Box>
            <Sphere args={[0.3, 16, 16]}>
                <meshStandardMaterial color="white" emissive="white" emissiveIntensity={5} />
            </Sphere>
        </group>
    );
};

export default DecisionNodes;
