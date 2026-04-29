import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface OrganismBrainProps {
    biology: any;
}

const OrganismBrain: React.FC<OrganismBrainProps> = ({ biology }) => {
    const brainRef = useRef<THREE.Mesh>(null);
    const glow = biology?.neural_glow || 1;

    useFrame((state) => {
        if (brainRef.current) {
            const time = state.clock.getElapsedTime();
            brainRef.current.position.y = Math.sin(time * 0.5) * 0.5;
            brainRef.current.rotation.y -= 0.01;
        }
    });

    return (
        <group>
            {/* The Inner Nucleus */}
            <Sphere ref={brainRef} args={[1.2, 64, 64]}>
                <meshStandardMaterial
                    color="white"
                    emissive="white"
                    emissiveIntensity={glow * 5}
                    transparent
                    opacity={0.8}
                />
            </Sphere>

            {/* Neural Tendrils / Connection Glow */}
            <Sphere args={[1.5, 32, 32]}>
                <MeshDistortMaterial
                    color="cyan"
                    speed={5}
                    distort={0.8}
                    radius={1}
                    transparent
                    opacity={0.2}
                    emissive="cyan"
                    emissiveIntensity={glow * 2}
                />
            </Sphere>
        </group>
    );
};

export default OrganismBrain;
