// components/ParallaxBg.jsx
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { themes } from "@/app/themes";

export default function ParallaxBg({ emotion = "neutral" }) {
  const mount = useRef(null);
  const scene = useRef(null);
  const renderer = useRef(null);
  const particles = useRef(null);

  useEffect(() => {
    if (!mount.current) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    scene.current = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.z = 4;

    renderer.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.current.setSize(w, h);
    renderer.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.current.appendChild(renderer.current.domElement);

    // Dynamic particles based on emotion
    const geometry = new THREE.BufferGeometry();
    const count = 400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const theme = themes[emotionToTheme[emotion] || "neonPink"];
    const color = new THREE.Color(theme.primary);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;

      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    particles.current = new THREE.Points(geometry, material);
    scene.current.add(particles.current);

    // Gyro support
    const handleMotion = (e) => {
      if (!particles.current) return;
      const x = e.rotationRate.beta * 0.01 || 0;
      const y = e.rotationRate.gamma * 0.01 || 0;
      particles.current.rotation.y += y;
      particles.current.rotation.x += x;
    };
    window.addEventListener("devicemotion", handleMotion);

    const animate = () => {
      requestAnimationFrame(animate);
      if (particles.current) {
        particles.current.rotation.y += 0.0005;
        particles.current.rotation.x += 0.0003;
      }
      renderer.current.render(scene.current, camera);
    };
    animate();

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      if (mount.current && renderer.current?.domElement) {
        mount.current.removeChild(renderer.current.domElement);
      }
    };
  }, [emotion]);

  return (
    <div
      ref={mount}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.6,
      }}
    />
  );
}
