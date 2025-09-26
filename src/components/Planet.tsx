
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { Suspense, useEffect, useRef, useState } from "react";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { PerspectiveCamera } from "@react-three/drei";
const easeInOutCubic = (t:number)=> t<0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
const clamp = (v:number,min=0,max=1)=> Math.min(max, Math.max(min, v));


type EarthProps = {
  go?: boolean;                         // триггер «улететь и запарковаться»
  initialPos?: [number, number, number];// старт «торчит справа»
  parkPos?: [number, number, number];   // куда паркуем (угол)
  duration?: number;                    // сек
  delay?: number;                       // сек
};

function Earth({
  go = false,
  initialPos = [3.8, 0.0, 0],          // сильно вправо — видна часть планеты
  parkPos   = [-3.8, 0.0, 0],          // пример: левый верхний «угол»
  duration  = 2.2,
  delay     = 0.0,
}: EarthProps) {
  const colorMap = useLoader(THREE.TextureLoader, "earth_color_map.jpg");
  const cloudsMap = useLoader(THREE.TextureLoader, "earth_clouds.jpg");
  colorMap.colorSpace = THREE.SRGBColorSpace;

  const planetRef = useRef<THREE.Mesh>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);
  const rimRef = useRef<THREE.Mesh>(null!);

  

  // состояние анимации
  const animRef = useRef<{
    t0: number;                     // старт времени (сек)
    from: THREE.Vector3;            // откуда летим
    to: THREE.Vector3;              // куда летим
    active: boolean;
  } | null>(null);

  // поставить на старт (сильно вправо)
  useEffect(() => {
    const p = new THREE.Vector3(...initialPos);
    planetRef.current.position.copy(p);
    cloudsRef.current.position.copy(p);
    if (rimRef.current) rimRef.current.position.copy(p);
  }, [initialPos.toString()]);

  // триггер «улететь и остаться»
  useEffect(() => {
    if (!go || !planetRef.current) return;
    animRef.current = {
      t0: performance.now()/1000 + delay,
      from: planetRef.current.position.clone(),
      to: new THREE.Vector3(...parkPos),
      active: true,
    };
  }, [go, delay, parkPos.toString()]);

  useFrame((state, delta) => {
    // постоянное вращение
    planetRef.current.rotation.y += delta * 0.05;
    cloudsRef.current.rotation.y += delta * 0.05;

    // поддержка рим-шейдера (если используешь)
    if (rimRef.current) {
      const mat = rimRef.current.material as THREE.ShaderMaterial;
      if (mat.uniforms?.uTime) mat.uniforms.uTime.value = state.clock.elapsedTime;
      rimRef.current.position.copy(planetRef.current.position);
      rimRef.current.rotation.copy(planetRef.current.rotation);
      rimRef.current.scale.copy(planetRef.current.scale);
    }

    // перелёт
    const anim = animRef.current;
    if (anim?.active) {
      const now = state.clock.getElapsedTime();
      const t = clamp((now - anim.t0) / duration);
      const e = easeInOutCubic(t);

      // позиция по твину
      planetRef.current.position.lerpVectors(anim.from, anim.to, e);
      cloudsRef.current.position.copy(planetRef.current.position);

      // немного «духа» во время перелёта
      const puff = 1 + 0.04 * Math.sin(e * Math.PI);
      planetRef.current.scale.setScalar(puff);
      cloudsRef.current.scale.setScalar(puff);

      // мягкий наклон
      planetRef.current.rotation.z = THREE.MathUtils.degToRad(6) * (1 - e);
      cloudsRef.current.rotation.z = planetRef.current.rotation.z;

      if (t >= 1) {
        // фиксируемся в парковой позиции
        planetRef.current.position.copy(anim.to);
        cloudsRef.current.position.copy(anim.to);
        anim.active = false; // больше не двигаем (кроме вращения)
      }
    }
    
  });

  return (
    <>
      <mesh ref={planetRef}>
        <sphereGeometry args={[1.9, 64, 64]} />
        <meshStandardMaterial map={colorMap} metalness={0} roughness={1} />
      </mesh>

      <mesh ref={cloudsRef} renderOrder={2}>
        <sphereGeometry args={[1.9 * 1.01, 64, 64]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          depthWrite={false}
          opacity={0.32}
          side={THREE.FrontSide}
        />
      </mesh>

      

    </>
  );
}

export default function Planet({ go=false }: { go?: boolean }) {
  return (
    <Canvas className="absolute inset-0" camera={{ position: [5, 0, 5], fov: 45,  near: 0.1, far: 20  }}
      gl={{ antialias: true, physicallyCorrectLights: true }}>

      
      
      <ambientLight intensity={0.02} />
      <hemisphereLight intensity={0.05} />
      <directionalLight position={[-5, 15, -15]} intensity={25} />
      <Suspense fallback={null}>
        <Earth
          go={go}
          initialPos={[4.2, -0.1, 0]}    // ← сильно вправо, видна часть
          parkPos={[-5.5, 0, 2]}       // ← куда улетит и «застынет»
          duration={5}
          delay={0.0}
        />
      </Suspense>

      <EffectComposer multisampling={4}>
        <Bloom intensity={1.2} luminanceThreshold={0.2} luminanceSmoothing={0.1} radius={0.8}/>
        <Vignette eskil={false} offset={0.2} darkness={0.9}/>
      </EffectComposer>
    </Canvas>
  );
}
