import { motion } from "framer-motion";
import LiveAvatar from "./LiveAvatar";
import NsfwRing from "./NsfwRing";

export default function ChatHeader({ partnerGender, style, nsfwLevel, setShowMenu, setShowGallery }) {
  return (
    <motion.div className="fixed top-0 inset-x-0 glass z-50 px-5 py-4 flex items-center justify-between">
      <button onClick={setShowMenu}><Menu className="w-6 h-6 text-accent-pink" /></button>
      
      <div className="relative">
        <LiveAvatar gender={partnerGender} nsfwLevel={nsfwLevel} />
        <NsfwRing level={nsfwLevel} />
      </div>

      <div className="text-center">
        <p className="font-semibold">{partnerGender} • {style}</p>
        <p className="text-xs text-accent-cyan">онлайн</p>
      </div>

      <button onClick={setShowGallery}><Camera className="w-6 h-6 text-accent-pink" /></button>
    </motion.div>
  );
}
