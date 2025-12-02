"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";

export default function GalleryGrid({ isOpen, onClose }) {
  // Пока просто заглушка, потом подключим реальное хранилище
  const images = JSON.parse(localStorage.getItem("generated_images") || "[]").reverse();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-h-[90vh] glass rounded-t-3xl p-6 z-50 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Галерея</h2>
              <button onClick={onClose}><X className="w-7 h-7" /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-8">
              {images.length === 0 ? (
                <p className="col-span-2 text-center text-[#8A8A99] py-20">
                  Пока нет сохранённых изображений
                </p>
              ) : (
                images.map((src, i) => (
                  <motion.div
                    key={i}
                    layoutId={`img-${src}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group rounded-2xl overflow-hidden"
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a href={src} download>
                        <button className="p-4 bg-white/20 backdrop-blur rounded-2xl">
                          <Download className="w-6 h-6" />
                        </button>
                      </a>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
