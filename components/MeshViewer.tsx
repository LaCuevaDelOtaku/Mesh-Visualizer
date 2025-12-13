import React, { Suspense, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Center, Stats, useProgress, Html, useGLTF } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';
import { ZoomInIcon, ZoomOutIcon, RefreshCwIcon } from './Icons';

// Extend JSX.IntrinsicElements to include React Three Fiber elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      primitive: any;
      ambientLight: any;
      directionalLight: any;
      color: any;
    }
  }
}

// Extend React.JSX.IntrinsicElements for newer React types support
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      primitive: any;
      ambientLight: any;
      directionalLight: any;
      color: any;
    }
  }
}

const Loader: React.FC = () => {
  const { progress } = useProgress();
  return <Html center className="text-white text-lg font-mono tracking-wider">{progress.toFixed(0)}% LOADED</Html>;
}

// UI Overlay for Camera Control
const CameraTools: React.FC = () => {
    const { camera } = useThree();
    
    // Smooth zoom handler
    const handleZoom = (factor: number) => {
        // We move the camera along the vector towards the origin (0,0,0)
        // Since we use OrbitControls, simply scaling position works well.
        // Factor < 1 zooms in, Factor > 1 zooms out.
        camera.position.multiplyScalar(factor);
    };

    const handleReset = () => {
        // Reset to default position used in Canvas camera prop
        camera.position.set(0, 5, 10);
        camera.lookAt(0, 0, 0);
    };

    return (
        <Html fullscreen pointerEvents="none" style={{ zIndex: 10 }}>
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 pointer-events-auto">
                <button 
                    onClick={() => handleZoom(0.6)} 
                    className="p-3 bg-gray-800/90 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow-lg border border-gray-700 group"
                    title="Zoom In"
                >
                    <ZoomInIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
                <button 
                    onClick={() => handleZoom(1.5)} 
                    className="p-3 bg-gray-800/90 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow-lg border border-gray-700 group"
                    title="Zoom Out"
                >
                    <ZoomOutIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
                <div className="h-px bg-gray-600 my-1 mx-2"></div>
                 <button 
                    onClick={handleReset} 
                    className="p-3 bg-gray-800/90 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow-lg border border-gray-700 group"
                    title="Reset View"
                >
                    <RefreshCwIcon className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                </button>
            </div>
        </Html>
    );
};

const Model: React.FC<{ url: string }> = ({ url }) => {
  const extension = useMemo(() => url.split('.').pop()?.toLowerCase(), [url]);

  if (extension === 'obj') {
    const obj = useLoader(OBJLoader, url);
    const memoizedObj = useMemo(() => {
        obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xcccccc,
                    metalness: 0.6,
                    roughness: 0.4,
                });
            }
        });
        return obj;
    }, [obj]);
    return <primitive object={memoizedObj} />;
  }

  if (extension === 'glb' || extension === 'gltf') {
    const { scene } = useGLTF(url);
    const memoizedScene = useMemo(() => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        return scene;
    }, [scene]);
    return <primitive object={memoizedScene} />;
  }

  console.error('Unsupported file format:', extension);
  return null;
};


interface MeshViewerProps {
  url: string;
}

const MeshViewer: React.FC<MeshViewerProps> = ({ url }) => {
  const lightRef = useRef<THREE.DirectionalLight>(null!);
  
  useLayoutEffect(() => {
    if (lightRef.current) {
        lightRef.current.shadow.mapSize.width = 2048;
        lightRef.current.shadow.mapSize.height = 2048;
    }
  }, []);

  return (
    <Canvas 
        camera={{ position: [0, 5, 10], fov: 50, near: 0.1, far: 5000 }} 
        shadows
        gl={{ antialias: true, logarithmicDepthBuffer: true }}
        dpr={[1, 2]}
    >
        <color attach="background" args={['#111827']} />
        <ambientLight intensity={1.5} />
        <directionalLight 
            ref={lightRef}
            position={[8, 12, 10]} 
            intensity={2.5} 
            castShadow 
        />
        
        <Suspense fallback={<Loader />}>
            <Center>
              <Model url={url} />
            </Center>
        </Suspense>

        <Grid
            renderOrder={-1}
            position={[0, -2.5, 0]}
            infiniteGrid
            cellSize={0.6}
            cellThickness={0.6}
            sectionSize={3.3}
            sectionThickness={1.5}
            sectionColor={new THREE.Color(0x3f3f46)}
            fadeDistance={40}
            fadeStrength={1}
        />
        
        <OrbitControls 
            makeDefault 
            minDistance={0.1} 
            maxDistance={2000} 
            enableDamping={true}
            dampingFactor={0.05}
        />
        
        <CameraTools />
        <Stats />
    </Canvas>
  );
};

export default MeshViewer;