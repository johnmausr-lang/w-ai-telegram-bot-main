import { motion } from "framer-motion";

export default function ImageFullScreen({ src, onClose, generating }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      {generating ? (
        <div className="w-80 h-80 bg-gradient-to-br from-[#FF47A3] to-[#00CCFF] rounded-full blur-3xl liquid opacity-70" />
      ) : (
        <motion.img
          src={src}
          className="max-w-full max-h-full rounded-3xl holo"
          style={{ clipPath: 'inset(0% 0 0 0)' }}
        />
      )}
      <button onClick={onClose} className="absolute top-8 right-8 p-4 bg-white/10 rounded-2xl backdrop-blur"><X className="w-8 h-8" /></button>
    </motion.div>
  );
}
