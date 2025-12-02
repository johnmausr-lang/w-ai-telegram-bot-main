"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

export default function VoiceWave({ onTranscript }) {
  const [isRecording, setIsRecording] = useState(false);
  const [waveData, setWaveData] = useState([]);
  const mediaRecorderRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    if (!isRecording) return;

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const tick = () => {
        const buffer = new Uint8Array(analyser.fftSize);
        analyser.getByteFrequencyData(buffer);
        const avg = buffer.reduce((a, b) => a + b) / buffer.length;
        setWaveData(prev => [...prev.slice(-30), avg / 255]);
        if (isRecording) requestAnimationFrame(tick);
      };
      tick();
    });
  }, [isRecording]);

  const toggle = () => setIsRecording(prev => !prev);

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onPointerDown={toggle}
      onPointerUp={toggle}
      onPointerLeave={() => setIsRecording(false)}
      className="relative p-4 rounded-2xl glass"
    >
      {isRecording ? (
        <div className="flex items-center gap-1">
          {waveData.map((v, i) => (
            <motion.div
              key={i}
              animate={{ height: `${v * 100}%` }}
              className="w-1 bg-[#FF47A3] rounded-full"
              style={{ height: "4px" }}
            />
          ))}
        </div>
      ) : (
        <Mic className="w-6 h-6 text-[#FF47A3]" />
      )}
    </motion.button>
  );
}
