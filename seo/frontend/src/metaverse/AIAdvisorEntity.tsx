import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

interface AIAdvisorEntityProps {
    status: string;
    intensity: number;
}

const AIAdvisorEntity: React.FC<AIAdvisorEntityProps> = ({ status, intensity }) => {
    const orbRef = useRef<THREE.Mesh>(null);

    const colors: Record<string, string> = {
        excellent: '#00ff88',
        good: '#00ccff',
        needs_improvement: '#ffcc00',
        critical: '#ff3300'
    };

    const activeColor = colors[status] || '#00ff88';

    useFrame((state) => {
        if (orbRef.current) {
            // Floating behavior - follows a path around the world
            const time = state.clock.getElapsedTime();
            orbRef.current.position.x = Math.sin(time * 0.3) * 10;
            orbRef.current.position.y = 8 + Math.sin(time * 0.5) * 2;
            orbRef.current.position.z = Math.cos(time * 0.3) * 10;

            // Intensity pulse
            const pulse = 1 + Math.sin(time * 2) * 0.2;
            orbRef.current.scale.setScalar(pulse);
        }
    });

    return (
        <group>
            <Float speed={5} rotationIntensity={2} floatIntensity={2}>
                <Sphere ref={orbRef} args={[1.5, 64, 64]}>
                    <MeshDistortMaterial
                        color={activeColor}
                        speed={intensity * 2}
                        distort={0.6}
                        radius={1}
                        emissive={activeColor}
                        emissiveIntensity={intensity * 2}
                        transparent
                        opacity={0.8}
                    />

                    {/* Internal Glow Core */}
                    <Sphere args={[0.5, 32, 32]}>
                        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={5} />
                    </Sphere>

                    {/* AI Label */}
                    <Html position={[0, 2, 0]} center>
                        <div className="flex flex-col items-center">
                            <div className="bg-black/80 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full whitespace-nowrap">
                                <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em] block">Neural Entity</span>
                                <span className="text-white text-[10px] font-bold">DIGITAL ADVISOR</span>
                            </div>
                            <div className="w-px h-4 bg-gradient-to-b from-white/20 to-transparent mt-1" />
                        </div>
                    </Html>
                </Sphere>
            </Float>

            {/* Entity Trail / Particles would go here */}
        </group>
    );
};

export default AIAdvisorEntity;
