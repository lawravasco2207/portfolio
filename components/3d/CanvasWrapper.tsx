'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Loader } from '@react-three/drei';

interface CanvasWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function CanvasWrapper({ children, className }: CanvasWrapperProps) {
  return (
    <div className={className}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
      <Loader />
    </div>
  );
}
