import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { Suspense, useEffect, useRef, useState } from "react";


/** утилиты */
const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type EarthProps = {
  /** стартовать ли анимацию (можно привязать к появлению графиков) */
  play?: boolean;
  /** задержка перед стартом (сек) */
  delay?: number;
  /** длительность ПОЛУ-пролёта (сек) — туда ИЛИ обратно */
  halfDuration?: number;
  /** X справа и слева (старт/финиш) */
  fromX?: number;
  toX?: number;
};

function Earth({
  play = false,
  delay = 0.4,
  halfDuration = 3.5,
  fromX = 2.4,
  toX = -2.4,
}: EarthProps) {
  // текстуры
  const colorMap = useLoader(THREE.TextureLoader, "earth_color_map.jpg");
  const cloudsMap = useLoader(THREE.TextureLoader, "earth_clouds.jpg");
  colorMap.colorSpace = THREE.SRGBColorSpace;

  // ссылки на меши
  const planetRef = useRef<THREE.Mesh>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);

  // запоминаем момент старта
  const [startSec, setStartSec] = useState<number | null>(null);

  useEffect(() => {
    if (play) setStartSec(performance.now() / 1000 + delay);
  }, [play, delay]);

  // изначально ставим на правую сторону
  useEffect(() => {
    planetRef.current?.position.set(fromX, 0, 0);
    cloudsRef.current?.position.set(fromX, 0, 0);
  }, [fromX]);

  useFrame((state, delta) => {
    // постоянное вращение
    if (planetRef.current && cloudsRef.current) {
      planetRef.current.rotation.y += delta * 0.05;
      cloudsRef.current.rotation.y += delta * 0.05;
    }
    if (startSec == null) return;

    const now = state.clock.getElapsedTime(); // сек от старта Canvas
    const tTotal = Math.max(0, now - startSec);

    // треугольная волна 0→1→0 (пинг-понг), чтобы не было «рывков» на цикле
    const period = halfDuration;            // время одного направления
    const tri = ((tTotal / period) % 2);    // [0..2)
    const u = tri < 1 ? tri : 2 - tri;      // [0..1] туда/обратно
    const e = easeInOutCubic(clamp(u));     // сглаживаем края

    // позиция и лёгкая дуга
    const x = lerp(fromX, toX, e);
    const y = Math.sin(e * Math.PI) * 0.15; // дуга по Y
    const z = 0;

    // лёгкий «наклон» и дыхание масштаба
    const tilt = lerp(0, THREE.MathUtils.degToRad(12), e);
    const puff = lerp(1, 1.06, Math.sin(e * Math.PI));

    if (planetRef.current) {
      planetRef.current.position.set(x, y, z);
      planetRef.current.rotation.z = tilt;
      planetRef.current.scale.setScalar(puff);
    }
    if (cloudsRef.current) {
      cloudsRef.current.position.set(x, y, z);
      cloudsRef.current.rotation.z = tilt;
      cloudsRef.current.scale.setScalar(puff);
      const mat = cloudsRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = lerp(0.35, 0.25, e); // чуть прозрачнее при движении
    }
  });

  return (
    <>
      <mesh ref={planetRef}>
        <sphereGeometry args={[1.9, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          metalness={0}
          roughness={1}
          transparent
          opacity={1}
          side={THREE.FrontSide}
        />
      </mesh>

      <mesh ref={cloudsRef} renderOrder={2}>
        <sphereGeometry args={[1.9 * 1.01, 64, 64]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          depthWrite={false}
          opacity={0.35}
          blending={THREE.NormalBlending}
          side={THREE.FrontSide}
        />
      </mesh>
    </>
  );
}

export default function Planet({
  play = false,      // если хочешь старт по готовности графиков — передай сюда флаг position={[8, 2, -3]}
  delay = 0.4,
}: { play?: boolean; delay?: number }) {
  return (
    <Canvas className="absolute inset-0" camera={{ position: [10, 0.8, 5], fov: 45 }} gl={{ physicallyCorrectLights: true }}>
      <ambientLight intensity={0.02} />
      <hemisphereLight intensity={0.05}/>
      <directionalLight position={[8, 2, -3]} intensity={2} />
      <Suspense fallback={null}>
        <Earth play={play} delay={delay} halfDuration={3.5} fromX={2.4} toX={-2.4} />
      </Suspense>
    </Canvas>
  );
}
