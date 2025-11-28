"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ParallaxBg() {
  const mount = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 1, 6);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      20
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    mount.current.appendChild(renderer.domElement);

    // Neon plane
    const geometry = new THREE.PlaneGeometry(4, 4, 64, 64);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xff2ea6),
      wireframe: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.4;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
    };

    window.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      mesh.rotation.x = mouseY;
      mesh.rotation.y = mouseX;
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
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
