'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function HolographicSphere() {
  const sphereRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (sphereRef.current) {
      sphereRef.current.rotation.y = t * 0.1;
      sphereRef.current.rotation.z = t * 0.05;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.05;
      pointsRef.current.rotation.x = t * 0.02;
    }
  });

  // Generate random points for the particle field
  const particlesCount = 400; // Increased count
  const positions = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount; i++) {
    const r = 3 + Math.random() * 2; // Varying radius
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  return (
    <group>
      {/* Core Sphere */}
      <Sphere ref={sphereRef} args={[2.2, 64, 64]}>
        <MeshDistortMaterial
          color="#00E5FF"
          emissive="#005BCE"
          emissiveIntensity={0.8} // Increased intensity
          wireframe
          distort={0.4}
          speed={2}
          roughness={0}
          metalness={1}
        />
      </Sphere>

      {/* Outer Glow Sphere (Subtle) */}
      <Sphere args={[2.5, 32, 32]}>
        <meshBasicMaterial
          color="#005BCE"
          transparent
          opacity={0.05}
          wireframe
        />
      </Sphere>

      {/* Particle Field */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlesCount}
            array={positions}
            itemSize={3}
            args={[positions, 3]}
          />
        </bufferGeometry>
        <PointMaterial
          transparent
          vertexColors={false}
          color="#FAFAFA"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </points>
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#00E5FF" intensity={0.5} />
    </group>
  );
}
