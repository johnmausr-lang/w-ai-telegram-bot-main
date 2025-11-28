"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion-3d";

export default function AiAvatar3D({ emotion = "neutral", speaking = false }) {
  const mesh = useRef();
  const { scene } = useGLTF("/models/avatar.glb"); // или fallback sphere

  useEffect(() => {
    if (!mesh.current) return;
    mesh.current.traverse((child) => {
      if (child.isMesh) child.material.emissiveIntensity = speaking ? 2 : 0.6;
    });
  }, [speaking]);

  const intensity = speaking ? 3 : 1.5;

  return (
    <div className="w-80 h-80 rounded-full overflow-hidden bg-black/40 backdrop-blur-xl border border-white/20">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={intensity} color="#ff2ea6" />
        <motion.group
          animate={{
            y: speaking ? [-0.05, 0.05, -0.05] : 0,
            rotateY: speaking ? 0.1 : 0,
          }}
          transition={{ repeat: speaking ? Infinity : 0, duration: 0.3 }}
        >
          <primitive object={scene} scale={2.5} ref={mesh} />
        </motion.group>
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
