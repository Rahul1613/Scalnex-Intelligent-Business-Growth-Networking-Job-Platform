import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

interface WorldSceneProps {
    nodeData: any;
}

const WorldScene: React.FC<WorldSceneProps> = ({ nodeData }) => {
    const groupRef = useRef<THREE.Group>(null);
    const roadRef = useRef<THREE.Group>(null);

    const env = nodeData?.environment || {
        building_scale: 1,
        traffic_density: 0.5,
        sky_color: '#00ff88',
        ambient_motion_speed: 1
    };

    // Generate buildings based on scale
    const buildings = useMemo(() => {
        const temp = [];
        const count = 40;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = 15 + Math.random() * 20;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const height = 2 + Math.random() * 15 * env.building_scale;
            const width = 1 + Math.random() * 3;
            temp.push({ position: [x, height / 2, z], scale: [width, height, width], color: env.sky_color });
        }
        return temp;
    }, [env.building_scale, env.sky_color]);

    useFrame((state) => {
        if (groupRef.current) {
            // Subtle world rotation
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05 * env.ambient_motion_speed;
        }
        if (roadRef.current) {
            // Road traffic pulse
            roadRef.current.children.forEach((child, i) => {
                child.position.y = Math.sin(state.clock.getElapsedTime() * 2 + i) * 0.1;
            });
        }
    });

    return (
        <group ref={groupRef}>
            {/* Central Core (Digital Twin Heart) */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                <Sphere args={[2, 32, 32]} position={[0, 5, 0]}>
                    <MeshDistortMaterial
                        color={env.sky_color}
                        speed={3}
                        distort={0.4}
                        radius={1}
                        emissive={env.sky_color}
                        emissiveIntensity={2}
                    />
                </Sphere>
            </Float>

            {/* Buildings */}
            {buildings.map((b, i) => (
                <group key={i} position={b.position as any}>
                    <Box args={[1, 1, 1]} scale={b.scale as any}>
                        <meshStandardMaterial
                            color="#1a1a1a"
                            emissive={b.color}
                            emissiveIntensity={0.3}
                            metalness={0.9}
                            roughness={0.1}
                        />
                    </Box>
                    {/* Neon Top */}
                    <Box args={[1.1, 0.2, 1.1]} position={[0, b.scale[1] / 2, 0]}>
                        <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={2} />
                    </Box>
                </group>
            ))}

            {/* Roads / Traffic Flow */}
            <group ref={roadRef}>
                {[...Array(20)].map((_, i) => (
                    <Box
                        key={i}
                        args={[0.5, 0.05, 10]}
                        position={[
                            Math.cos(i) * 12,
                            0.1,
                            Math.sin(i) * 12
                        ]}
                        rotation={[0, Math.atan2(Math.cos(i), Math.sin(i)), 0]}
                    >
                        <meshStandardMaterial
                            color={env.sky_color}
                            emissive={env.sky_color}
                            emissiveIntensity={env.traffic_density * 5}
                            transparent
                            opacity={0.6}
                        />
                    </Box>
                ))}
            </group>

            {/* Ground Grid */}
            <gridHelper args={[200, 50, '#333', '#111']} position={[0, 0, 0]} />

            {/* City Floor Glow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial
                    color="#000"
                    emissive={env.sky_color}
                    emissiveIntensity={0.1}
                    transparent
                    opacity={0.5}
                />
            </mesh>
        </group>
    );
};

export default WorldScene;
