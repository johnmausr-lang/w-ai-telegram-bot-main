// Временно — просто красивый аватар
export default function LiveAvatar({ nsfwLevel = 50 }) {
  return (
    <div className="relative">
      <div className="w-20 h-20 bg-gradient-to-br from-[#FF47A3] to-[#CC338F] rounded-full animate-pulse" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl">NSFW</span>
      </div>
    </div>
  );
}
