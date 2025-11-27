"use client";
import { motion, useMotionValue, useTransform } from "framer-motion";

export default function ParallaxBg() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-300, 300], [15, -15]);
  const rotateY = useTransform(x, [-300, 300], [-15, 15]);

  function handleMove(e) {
    const { innerWidth, innerHeight } = window;
    x.set(e.clientX - innerWidth / 2);
    y.set(e.clientY - innerHeight / 2);
  }

  return (
    <motion.div
      onMouseMove={handleMove}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        perspective: "1200px",
        zIndex: 0,
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
        }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,128,0.2),transparent_80%)]"
      />

      <motion.div
        className="absolute inset-0 bg-[url('/grid.svg')] opacity-30 mix-blend-overlay"
        style={{
          rotateX,
          rotateY,
        }}
      />

      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 bg-pink-500 rounded-full blur-xl opacity-30"
          initial={{
            x: Math.random() * 1200 - 600,
            y: Math.random() * 1200 - 600,
            scale: Math.random() * 1.5,
          }}
          animate={{
            x: Math.random() * 1200 - 600,
            y: Math.random() * 1200 - 600,
            scale: Math.random() * 2,
          }}
          transition={{
            duration: 10 + Math.random() * 15,
            repeat: Infinity,
            ease: "ease-in-out",
          }}
        />
      ))}
    </motion.div>
  );
}
