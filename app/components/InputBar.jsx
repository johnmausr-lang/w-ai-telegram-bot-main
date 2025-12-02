"use client";
import { motion } from "framer-motion";
import { Send, Camera, Mic } from "lucide-react";
import { haptic } from "@/lib/haptic";

export default function InputBar({ input, setInput, onSend, onImageGen, isImagePrompt }) {
  return (
    <motion.div className="fixed bottom-6 left-6 right-6 glass rounded-3xl p-5 shadow-2xl border border-white/10">
      <div className="flex items-end gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), onSend())}
          placeholder="Напиши фантазию..."
          rows={1}
          className="flex-1 bg-transparent outline-none resize-none max-h-32 text-base placeholder-[#8A8A99]"
        />

        <div className="flex items-center gap-3">
          {isImagePrompt && (
            <motion.button
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { onImageGen(); haptic("medium"); }}
              className="p-4 bg-gradient-to-br from-[#FF47A3] to-[#CC338F] rounded-2xl glow-pink"
            >
              <Camera className="w-6 h-6" />
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { onSend(); haptic(); }}
            className="p-4 bg-[#00CCFF] rounded-2xl glow-cyan"
          >
            <Send className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
