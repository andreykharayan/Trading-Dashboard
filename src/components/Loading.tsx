// src/Loading.tsx
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Html, Stars } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function Earth() {
  // load inside a Canvas-rendered component
  const colorMap   = useLoader(THREE.TextureLoader, "earth_color_map.jpg");
  const normalMap  = useLoader(THREE.TextureLoader, "earth_normal_map.jpg");
  const specMap    = useLoader(THREE.TextureLoader, "earth_specular_map.jpg");
  const cloudsMap  = useLoader(THREE.TextureLoader, "earth_clouds.jpg"); // prefer PNG (alpha)

  const earthRef  = useRef<THREE.Mesh | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);

  useFrame((_, dt) => {
    const e = earthRef.current;
    const c = cloudsRef.current;
    if (!e || !c) return;              // guard: refs are null on first frames
    e.rotation.y += dt * 0.15;
    c.rotation.y += dt * 0.20;
  });

  return (
    <>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          specularMap={specMap}
          shininess={18}
        />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.01, 64, 64]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          depthWrite={false}
          opacity={0.4}
        />
      </mesh>
    </>
  );
}

export default function Loading() {
  return (
    <div className="h-screen bg-black">
      <Canvas camera={{ position: [0, 1.2, 3], fov: 45 }}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 2, 5]} intensity={1.2} />
        <Stars radius={80} depth={60} count={1200} factor={3} fade />

        {/* critical: wrap loaders with Suspense */}
        <Suspense fallback={<Html center style={{ color: "#fff" }}>Loading textures…</Html>}>
          <Earth />
        </Suspense>
      </Canvas>
    </div>
  );
}
