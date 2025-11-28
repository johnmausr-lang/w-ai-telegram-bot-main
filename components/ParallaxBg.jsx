"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ParallaxBg() {
  const mount = useRef(null);

  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);

    mount.current.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(3, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff2ea6,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    const onMouseMove = (e) => {
      const x = (e.clientX / w - 0.5) * 0.2;
      const y = (e.clientY / h - 0.5) * 0.2;
      sphere.rotation.x = y;
      sphere.rotation.y = x;
    };
    window.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      sphere.rotation.z += 0.001;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      mount.current.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mount}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        opacity: 0.28,
        pointerEvents: "none"
      }}
    />
  );
}
