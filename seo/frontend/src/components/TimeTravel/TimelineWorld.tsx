import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import TimelineNode from './TimelineNode';

interface TimelineWorldProps {
    timelineData: any;
    activeNode: string;
    onNodeFocus: (nodeType: string) => void;
    selectedDecision: string | null;
}

const TimelineWorld = ({ timelineData, activeNode, onNodeFocus, selectedDecision }: TimelineWorldProps) => {
    const fogRef = useRef<THREE.Fog>(null);
    const particlesRef = useRef<THREE.Points>(null);

    // Timeline node positions along the path
    const nodePositions = useMemo(() => ({
        past_6m: [-20, 0, 0],
        past_3m: [-10, 0, 0],
        present: [0, 0, 0],
        future_3m: [10, 0, 0],
        future_6m: [20, 0, 0]
    }), []);

    // Create particle system for ambient atmosphere
    const particles = useMemo(() => {
        const count = 1000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Random positions in a large sphere
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

            // Soft blue/cyan colors
            colors[i * 3] = 0.3 + Math.random() * 0.3;
            colors[i * 3 + 1] = 0.5 + Math.random() * 0.3;
            colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
        }

        return { positions, colors };
    }, []);

    // Animate particles
    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y += 0.0002;

            // Gentle floating motion
            const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001;
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    // Timeline path points
    const pathPoints = useMemo(() => {
        const points = [];
        for (let x = -25; x <= 25; x += 0.5) {
            points.push(new THREE.Vector3(x, -0.5, 0));
        }
        return points;
    }, []);

    // Create particle geometry
    const particleGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(particles.positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(particles.colors, 3));
        return geometry;
    }, [particles]);

    return (
        <group>
            {/* Fog for atmospheric depth */}
            <fog ref={fogRef} attach="fog" args={['#000000', 10, 50]} />

            {/* Ambient particles */}
            <points ref={particlesRef} geometry={particleGeometry}>
                <pointsMaterial
                    size={0.1}
                    vertexColors
                    transparent
                    opacity={0.6}
                    sizeAttenuation
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* Glowing timeline path */}
            <Line
                points={pathPoints}
                color="#4a90e2"
                lineWidth={2}
                transparent
                opacity={0.4}
            />

            {/* Timeline Nodes */}
            <TimelineNode
                position={nodePositions.past_6m as [number, number, number]}
                data={timelineData.past_6m}
                nodeType="past_6m"
                label="-6 Months"
                isActive={activeNode === 'past_6m'}
                onClick={() => onNodeFocus('past_6m')}
            />

            <TimelineNode
                position={nodePositions.past_3m as [number, number, number]}
                data={timelineData.past_3m}
                nodeType="past_3m"
                label="-3 Months"
                isActive={activeNode === 'past_3m'}
                onClick={() => onNodeFocus('past_3m')}
            />

            <TimelineNode
                position={nodePositions.present as [number, number, number]}
                data={timelineData.present}
                nodeType="present"
                label="Present"
                isActive={activeNode === 'present'}
                onClick={() => onNodeFocus('present')}
                isPresentNode
            />

            <TimelineNode
                position={nodePositions.future_3m as [number, number, number]}
                data={timelineData.future_3m}
                nodeType="future_3m"
                label="+3 Months"
                isActive={activeNode === 'future_3m'}
                onClick={() => onNodeFocus('future_3m')}
                selectedDecision={selectedDecision}
            />

            <TimelineNode
                position={nodePositions.future_6m as [number, number, number]}
                data={timelineData.future_6m}
                nodeType="future_6m"
                label="+6 Months"
                isActive={activeNode === 'future_6m'}
                onClick={() => onNodeFocus('future_6m')}
                selectedDecision={selectedDecision}
            />

            {/* Directional lights for dramatic effect */}
            <directionalLight position={[0, 10, 5]} intensity={0.5} color="#ffffff" />
            <directionalLight position={[0, -5, -5]} intensity={0.3} color="#4a90e2" />
        </group>
    );
};

export default TimelineWorld;
