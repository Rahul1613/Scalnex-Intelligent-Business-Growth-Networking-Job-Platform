import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface TimelineNodeProps {
    position: [number, number, number];
    data: any;
    nodeType: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
    isPresentNode?: boolean;
    selectedDecision?: string | null;
}

const TimelineNode = ({
    position,
    data,
    nodeType,
    label,
    isActive,
    onClick,
    isPresentNode = false,
    selectedDecision = null
}: TimelineNodeProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Determine color based on node type and health
    const getNodeColor = () => {
        if (isPresentNode) return '#ffffff';

        const health = data?.status || 'unknown';

        if (nodeType.includes('past')) {
            return '#00bcd4'; // Cyan for past
        }

        // Future nodes - color based on health
        if (health === 'excellent' || health === 'good') {
            return '#4caf50'; // Green
        } else if (health === 'needs_improvement') {
            return '#ff9800'; // Orange
        } else {
            return '#f44336'; // Red
        }
    };

    const nodeColor = getNodeColor();
    const glowIntensity = isActive ? 1.5 : hovered ? 1.2 : 0.8;

    // Animate node
    useFrame((state) => {
        if (meshRef.current) {
            // Gentle floating animation
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;

            // Rotate slowly
            meshRef.current.rotation.y += 0.005;

            // Pulse effect when active
            if (isActive) {
                const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
                meshRef.current.scale.set(scale, scale, scale);
            }
        }

        if (ringRef.current) {
            ringRef.current.rotation.z += 0.01;
        }
    });

    return (
        <group position={position}>
            {/* Outer ring */}
            <mesh ref={ringRef}>
                <torusGeometry args={[2, 0.05, 16, 100]} />
                <meshStandardMaterial
                    color={nodeColor}
                    emissive={nodeColor}
                    emissiveIntensity={glowIntensity * 0.5}
                    transparent
                    opacity={0.6}
                />
            </mesh>

            {/* Main platform */}
            <mesh
                ref={meshRef}
                onClick={onClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <cylinderGeometry args={[1.5, 1.5, 0.3, 32]} />
                <meshStandardMaterial
                    color={nodeColor}
                    emissive={nodeColor}
                    emissiveIntensity={glowIntensity}
                    transparent
                    opacity={0.8}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Center glow */}
            <mesh position={[0, 0.2, 0]}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial
                    color={nodeColor}
                    emissive={nodeColor}
                    emissiveIntensity={glowIntensity * 2}
                    transparent
                    opacity={0.6}
                />
            </mesh>

            {/* Label */}
            <Text
                position={[0, -1.5, 0]}
                fontSize={0.4}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
            >
                {label}
            </Text>

            {/* Data overlay when hovered or active */}
            {(hovered || isActive) && (
                <Html position={[0, 2.5, 0]} center>
                    <div className="bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white min-w-[250px] border border-white/20">
                        <h3 className="font-bold text-lg mb-2 text-center">{label}</h3>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">SEO Score:</span>
                                <span className="font-semibold text-blue-400">
                                    {data?.seo_score?.toFixed(0) || 'N/A'}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-400">Traffic:</span>
                                <span className="font-semibold text-green-400">
                                    {data?.organic_traffic?.toLocaleString() || 'N/A'}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-400">Revenue:</span>
                                <span className="font-semibold text-yellow-400">
                                    ${data?.revenue?.toLocaleString() || 'N/A'}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-400">Growth:</span>
                                <span className={`font-semibold ${(data?.traffic_growth || 0) > 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {data?.traffic_growth?.toFixed(1) || '0'}%
                                </span>
                            </div>

                            {data?.confidence && (
                                <div className="flex justify-between pt-2 border-t border-white/10">
                                    <span className="text-gray-400">Confidence:</span>
                                    <span className="font-semibold text-purple-400">
                                        {(data.confidence * 100).toFixed(0)}%
                                    </span>
                                </div>
                            )}
                        </div>

                        {isPresentNode && (
                            <div className="mt-3 pt-3 border-t border-white/10 text-center">
                                <span className="text-xs text-blue-400">⚡ Make a decision to shape the future</span>
                            </div>
                        )}

                        {selectedDecision && nodeType.includes('future') && (
                            <div className="mt-3 pt-3 border-t border-white/10 text-center">
                                <span className="text-xs text-green-400">
                                    ✓ Decision applied: {selectedDecision.replace(/_/g, ' ')}
                                </span>
                            </div>
                        )}
                    </div>
                </Html>
            )}
        </group>
    );
};

export default TimelineNode;
