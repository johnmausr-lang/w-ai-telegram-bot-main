import { motion } from "framer-motion";

export default function NsfwRing({ level = 70 }) {
  const circumference = 2 * Math.PI * 36;

  return (
    <div className="absolute -inset-4 pointer-events-none">
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="50%" cy="50%" r="36"
          stroke="rgba(255,71,163,0.2)"
          strokeWidth="6"
          fill="none"
        />
        <motion.circle
          cx="50%" cy="50%" r="36"
          stroke="#FF47A3"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (circumference * level) / 100 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glow-pink"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-[#FF47A3]">{level}%</span>
      </div>
    </div>
  );
}
