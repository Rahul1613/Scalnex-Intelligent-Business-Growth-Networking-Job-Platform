import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface OrganismCoreProps {
    biology: any;
}

const OrganismCore: React.FC<OrganismCoreProps> = ({ biology }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    const size = biology?.size || 1;
    const color = biology?.skin_color || '#00ff88';
    const heartbeat = biology?.heartbeat_speed || 1;
    const mutation = biology?.mutation_rate || 0.1;

    useFrame((state) => {
        if (meshRef.current) {
            // Heartbeat scale oscillation
            const time = state.clock.getElapsedTime();
            const pulse = 1 + Math.sin(time * heartbeat * 2 * Math.PI) * 0.05;
            meshRef.current.scale.setScalar(size * pulse);

            // Subtle rotation
            meshRef.current.rotation.y += 0.005;
            meshRef.current.rotation.z += 0.003;
        }
    });

    return (
        <Sphere ref={meshRef} args={[3, 128, 128]}>
            <MeshDistortMaterial
                color={color}
                speed={heartbeat * 2}
                distort={0.4 + mutation}
                radius={1}
                roughness={0.2}
                metalness={0.8}
                emissive={color}
                emissiveIntensity={0.5}
                transparent
                opacity={0.9}
            />
        </Sphere>
    );
};

export default OrganismCore;
