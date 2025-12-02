"use client";
import { motion } from "framer-motion";
import { Menu, Camera } from "lucide-react";

export default function ChatHeader({
  partnerGender,
  style,
  nsfwLevel,
  setNsfwLevel,
  onOpenSidebar,
  onOpenGallery,
}) {
  return (
    <div className="fixed top-0 inset-x-0 bg-[#1C1C23]/80 backdrop-blur-2xl z-40 p-5 flex items-center justify-between">
      <button onClick={onOpenSidebar}>
        <Menu className="w-7 h-7 text-[#FF47A3]" />
      </button>

      <div className="text-center">
        <p className="font-bold text-lg">{partnerGender} • {style}</p>
        <div className="flex items-center gap-2 mt-2 justify-center">
          <span className="text-xs text-[#FF47A3]">NSFW</span>
          <input
            type="range"
            min="0"
            max="100"
            value={nsfwLevel}
            onChange={(e) => setNsfwLevel(+e.target.value)}
            className="w-32 accent-[#FF47A3]"
          />
          <span className="text-xs text-[#FF47A3]">{nsfwLevel}%</span>
        </div>
      </div>

      <button onClick={onOpenGallery}>
        <Camera className="w-7 h-7 text-[#FF47A3]" />
      </button>
    </div>
  );
}
