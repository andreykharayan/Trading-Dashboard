// src/components/PlanetBG.tsx
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF, Stars } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

type Phase = "idle" | "results";

function EarthGLTF({ phase }: { phase: Phase }) {
  // Загружаем модель (GLB/GLTF). Путь из public/
  const { scene } = useGLTF("scene.gltf"); 
  const ref = useRef<THREE.Group>(null);

  // Базовый масштаб/поворот — подгони на глаз, чтобы планета была в кадре
  // (модель может быть очень маленькой/большой)
  scene.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      const m = o as THREE.Mesh;
      m.castShadow = false; m.receiveShadow = false;
      // Снизим качество материалов, если надо:
      if ((m.material as any).envMapIntensity !== undefined) {
        (m.material as any).envMapIntensity = 0.6;
      }
    }
  });

  // Простое вращение + лёгкое смещение при phase="results"
  useFrame((_, dt) => {
    if (!ref.current) return;
    const g = ref.current;
    g.rotation.y += dt * (phase === "idle" ? 0.06 : 0.12);
    // Лёгкий «докрут» и уход вправо
    const targetX = phase === "idle" ? 0 : 2.4;
    const targetS = phase === "idle" ? 1 : 0.85;
    g.position.x += (targetX - g.position.x) * 0.08; // сглаживание
    const s = g.scale.x + (targetS - g.scale.x) * 0.08;
    g.scale.setScalar(s);
  });

  return (
    <group ref={ref} position={[0, 0, 0]} scale={[1, 1, 1]}>
      {/* Помещаем сцену glTF внутрь группы, чтобы крутить/смещать всё разом */}
      <primitive object={scene} />
    </group>
  );
}
// Предзагрузка (ускорит первый показ)
useGLTF.preload("/models/earth.gltf");

export default function PlanetBG({ phase = "idle" as Phase }) {
  return (
    <Canvas
      className="absolute inset-0 -z-10 pointer-events-none"
      camera={{ position: [0, 1.1, 3], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 2, 5]} intensity={1.05} />
      <Suspense fallback={null}>
        {/* Лёгкие звёзды и окружение для красивых рефлексов */}
        <Stars radius={120} depth={30} count={900} factor={2.2} fade speed={0.06} />
        <Environment preset="night" />
        <EarthGLTF phase={phase} />
      </Suspense>
    </Canvas>
  );
}


