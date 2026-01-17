import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Line, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Node({ position, color, scale = 1, delay = 0 }: { 
  position: [number, number, number]; 
  color: string; 
  scale?: number;
  delay?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <Sphere ref={meshRef} args={[0.15 * scale, 32, 32]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.2}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function Connection({ start, end, color }: { 
  start: [number, number, number]; 
  end: [number, number, number]; 
  color: string;
}) {
  const points = useMemo(() => {
    const midPoint: [number, number, number] = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2 + 0.3,
      (start[2] + end[2]) / 2,
    ];
    return [
      new THREE.Vector3(...start),
      new THREE.Vector3(...midPoint),
      new THREE.Vector3(...end),
    ];
  }, [start, end]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1.5}
      transparent
      opacity={0.4}
    />
  );
}

function Graph() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.05;
    }
  });

  const nodes: { pos: [number, number, number]; color: string; scale: number; delay: number }[] = [
    { pos: [0, 0.5, 0], color: '#3b82f6', scale: 1.5, delay: 0 },
    { pos: [-1, 0, 0.5], color: '#2dd4bf', scale: 1, delay: 1 },
    { pos: [1, 0, 0.5], color: '#2dd4bf', scale: 1, delay: 2 },
    { pos: [-0.5, -0.5, -0.5], color: '#60a5fa', scale: 0.8, delay: 3 },
    { pos: [0.5, -0.5, -0.5], color: '#60a5fa', scale: 0.8, delay: 4 },
    { pos: [-1.5, -0.5, 0], color: '#5eead4', scale: 0.7, delay: 5 },
    { pos: [1.5, -0.5, 0], color: '#5eead4', scale: 0.7, delay: 6 },
    { pos: [0, -1, 0], color: '#3b82f6', scale: 1.2, delay: 7 },
  ];

  const connections: { start: [number, number, number]; end: [number, number, number]; color: string }[] = [
    { start: nodes[0].pos, end: nodes[1].pos, color: '#3b82f6' },
    { start: nodes[0].pos, end: nodes[2].pos, color: '#3b82f6' },
    { start: nodes[1].pos, end: nodes[3].pos, color: '#2dd4bf' },
    { start: nodes[2].pos, end: nodes[4].pos, color: '#2dd4bf' },
    { start: nodes[1].pos, end: nodes[5].pos, color: '#60a5fa' },
    { start: nodes[2].pos, end: nodes[6].pos, color: '#60a5fa' },
    { start: nodes[3].pos, end: nodes[7].pos, color: '#5eead4' },
    { start: nodes[4].pos, end: nodes[7].pos, color: '#5eead4' },
  ];

  return (
    <group ref={groupRef}>
      {connections.map((conn, i) => (
        <Connection key={`conn-${i}`} {...conn} />
      ))}
      {nodes.map((node, i) => (
        <Node key={`node-${i}`} position={node.pos} color={node.color} scale={node.scale} delay={node.delay} />
      ))}
      
      {/* Ambient glow sphere */}
      <Sphere args={[2.5, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.02} />
      </Sphere>
    </group>
  );
}

export function DecisionGraph({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#2dd4bf" />
        <Graph />
      </Canvas>
    </div>
  );
}
