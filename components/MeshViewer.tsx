import React, { Suspense, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Center, Stats, useProgress, Html, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';
import { ZoomInIcon, ZoomOutIcon, RefreshCwIcon, LayersIcon, SunIcon, GridIcon } from './Icons';

// Fix for JSX.IntrinsicElements errors when types are not automatically picked up
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

const Loader: React.FC = () => {
  const { progress } = useProgress();
  return <Html center className="text-zinc-400 text-xs font-mono tracking-widest">{progress.toFixed(0)}% LOADED</Html>;
}

// UI Overlay for Camera Control
const CameraTools: React.FC = () => {
    const { camera } = useThree();
    
    const handleZoom = (factor: number) => {
        camera.position.multiplyScalar(factor);
    };

    const handleReset = () => {
        camera.position.set(0, 5, 10);
        camera.lookAt(0, 0, 0);
    };

    return (
        <Html fullscreen pointerEvents="none" style={{ zIndex: 10 }}>
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 pointer-events-auto">
                <button 
                    onClick={() => handleZoom(0.6)} 
                    className="p-3 bg-zinc-900/90 text-zinc-300 rounded-lg hover:bg-white hover:text-black transition-all shadow-lg border border-zinc-700 hover:border-white group"
                    title="Zoom In"
                >
                    <ZoomInIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button 
                    onClick={() => handleZoom(1.5)} 
                    className="p-3 bg-zinc-900/90 text-zinc-300 rounded-lg hover:bg-white hover:text-black transition-all shadow-lg border border-zinc-700 hover:border-white group"
                    title="Zoom Out"
                >
                    <ZoomOutIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <div className="h-px bg-zinc-800 my-1 mx-2"></div>
                 <button 
                    onClick={handleReset} 
                    className="p-3 bg-zinc-900/90 text-zinc-300 rounded-lg hover:bg-white hover:text-black transition-all shadow-lg border border-zinc-700 hover:border-white group"
                    title="Reset View"
                >
                    <RefreshCwIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                </button>
            </div>
        </Html>
    );
};

// New Settings Panel Component
interface ViewerSettingsProps {
    wireframe: boolean;
    toggleWireframe: () => void;
    showGrid: boolean;
    toggleGrid: () => void;
    envPreset: string;
    setEnvPreset: (preset: string) => void;
}

const ViewerSettings: React.FC<ViewerSettingsProps> = ({ wireframe, toggleWireframe, showGrid, toggleGrid, envPreset, setEnvPreset }) => {
    return (
        <Html fullscreen pointerEvents="none" style={{ zIndex: 10 }}>
             <div className="absolute top-6 right-6 flex flex-col gap-3 pointer-events-auto items-end">
                {/* Visual Settings Panel */}
                <div className="bg-zinc-900/90 backdrop-blur-md p-3 rounded-xl border border-zinc-800 shadow-2xl flex flex-col gap-3 w-48">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 px-1">Display</span>
                    
                    {/* Wireframe Toggle */}
                    <button 
                        onClick={toggleWireframe}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            wireframe ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 border border-transparent'
                        }`}
                    >
                        <LayersIcon className="w-4 h-4" />
                        <span>Wireframe</span>
                    </button>

                    {/* Grid Toggle */}
                    <button 
                        onClick={toggleGrid}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            showGrid ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 border border-transparent'
                        }`}
                    >
                        <GridIcon className="w-4 h-4" />
                        <span>Grid Floor</span>
                    </button>

                     <div className="h-px bg-zinc-800 my-1"></div>
                     <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 px-1">Environment</span>
                     
                     {/* Environment Cycler */}
                     <div className="grid grid-cols-2 gap-2">
                        {['studio', 'city', 'sunset', 'dawn'].map((preset) => (
                             <button
                                key={preset}
                                onClick={() => setEnvPreset(preset)}
                                className={`px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-all border ${
                                    envPreset === preset 
                                    ? 'bg-white text-black border-white' 
                                    : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-600'
                                }`}
                            >
                                {preset}
                            </button>
                        ))}
                     </div>
                </div>
            </div>
        </Html>
    )
}

const Model: React.FC<{ url: string; wireframe: boolean }> = ({ url, wireframe }) => {
  const extension = useMemo(() => url.split('.').pop()?.toLowerCase(), [url]);

  if (extension === 'obj') {
    const obj = useLoader(OBJLoader, url);
    const memoizedObj = useMemo(() => {
        const clone = obj.clone();
        clone.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                // Create a clean material for OBJ to ensure consistent look
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xcccccc,
                    metalness: 0.6,
                    roughness: 0.4,
                    wireframe: wireframe
                });
            }
        });
        return clone;
    }, [obj, wireframe]);
    return <primitive object={memoizedObj} />;
  }

  if (extension === 'glb' || extension === 'gltf') {
    const { scene } = useGLTF(url);
    const memoizedScene = useMemo(() => {
        const clone = scene.clone(true);
        clone.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                // Clone material to avoid side-effects on cached GLTF
                if (child.material) {
                    child.material = child.material.clone();
                    child.material.wireframe = wireframe;
                }
            }
        });
        return clone;
    }, [scene, wireframe]);
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
  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [envPreset, setEnvPreset] = useState('studio');
  
  useLayoutEffect(() => {
    if (lightRef.current) {
        lightRef.current.shadow.mapSize.width = 2048;
        lightRef.current.shadow.mapSize.height = 2048;
        // Improve shadow bias for cleaner self-shadowing
        lightRef.current.shadow.bias = -0.0001; 
    }
  }, []);

  return (
    <Canvas 
        camera={{ position: [0, 5, 10], fov: 50, near: 0.1, far: 5000 }} 
        shadows
        gl={{ antialias: true, logarithmicDepthBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
    >
        <color attach="background" args={['#09090b']} />
        
        {/* Environment Lighting */}
        <Environment preset={envPreset as any} background={true} blur={0.6} />

        {/* Ambient fallback/fill */}
        <ambientLight intensity={0.2} />

        {/* Key Light for directional shadows (subtle) */}
        <directionalLight 
            ref={lightRef}
            position={[10, 10, 5]} 
            intensity={1.0} 
            castShadow 
            shadow-bias={-0.0001}
        />
        
        <Suspense fallback={<Loader />}>
            <Center top>
              <Model url={url} wireframe={wireframe} />
            </Center>
            
            {/* Contact Shadows for grounding the model */}
            <ContactShadows 
                opacity={0.6} 
                scale={40} 
                blur={2.4} 
                far={4.5} 
                resolution={512} 
                color="#000000" 
            />
        </Suspense>

        {showGrid && (
            <Grid
                renderOrder={-1}
                position={[0, -0.01, 0]} // Slightly below contact shadow
                infiniteGrid
                cellSize={0.6}
                cellThickness={0.6}
                sectionSize={3.3}
                sectionThickness={1.5}
                sectionColor={new THREE.Color(0x52525b)}
                fadeDistance={40}
                fadeStrength={1}
            />
        )}
        
        <OrbitControls 
            makeDefault 
            minDistance={0.1} 
            maxDistance={2000} 
            enableDamping={true}
            dampingFactor={0.05}
        />
        
        <CameraTools />
        
        <ViewerSettings 
            wireframe={wireframe} 
            toggleWireframe={() => setWireframe(!wireframe)}
            showGrid={showGrid}
            toggleGrid={() => setShowGrid(!showGrid)}
            envPreset={envPreset}
            setEnvPreset={setEnvPreset}
        />
        
        <Stats />
    </Canvas>
  );
};

export default MeshViewer;