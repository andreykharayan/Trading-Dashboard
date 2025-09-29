import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, useGLTF } from '@react-three/drei'

function EarthModel() {
  const { scene } = useGLTF('/earthPlanet.gltf') 
  return <primitive object={scene} scale={2} />
}

export default function Background() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 2]} />
        <Stars /> {/* звёздное небо */}
        <EarthModel />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}