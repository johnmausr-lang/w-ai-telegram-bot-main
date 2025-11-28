// components/GlassPanel.jsx
"use client";

import { motion } from "framer-motion";

export default function GlassPanel({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, scale: 1, backdropFilter: "blur(20px)" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl ${className}`}
      style={{
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 0 40px rgba(255,255,255,0.08)",
      }}
    >
      {/* Holographic border glow */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/30 via-purple-500/20 to-cyan-500/30 blur-xl animate-pulse" />
      </div>

      {/* Inner light sweep */}
      <motion.div
        animate={{ x: [-1000, 1000] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 h-full w-48 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
