/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function DeepSeaSound() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Audio nodes
  const rumbleOscRef = useRef<OscillatorNode | null>(null);
  const rumbleGainRef = useRef<GainNode | null>(null);
  const bubbleIntervRef = useRef<number | null>(null);

  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // 1. Create a deep abyss rumble (55Hz and 65Hz waves with dual oscillators for organic beating)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(52, ctx.currentTime); // Low abyssal tone

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(51.3, ctx.currentTime); // Beating node

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);

      // Low-pass filter to keep it subterranean and muddy
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(100, ctx.currentTime);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(filter);
      filter.connect(ctx.destination);

      osc1.start();
      osc2.start();

      rumbleOscRef.current = osc1;
      rumbleGainRef.current = gainNode;

      // 2. Synthesize random bubble pops and eerie deep sea squeaks periodically
      const triggerBubble = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === "suspended") return;
        
        const now = ctx.currentTime;
        const bubbleOsc = ctx.createOscillator();
        const bubbleGain = ctx.createGain();
        const bubbleFilter = ctx.createBiquadFilter();

        // High frequency whistle that drops like sonar or bubbles
        bubbleOsc.type = "sine";
        const startFreq = 200 + Math.random() * 400;
        bubbleOsc.frequency.setValueAtTime(startFreq, now);
        // Frequency sweep downwards/upwards for water feel
        bubbleOsc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, now + 0.6);

        bubbleGain.gain.setValueAtTime(0, now);
        bubbleGain.gain.linearRampToValueAtTime(0.08, now + 0.1);
        bubbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

        bubbleFilter.type = "bandpass";
        bubbleFilter.frequency.setValueAtTime(startFreq, now);

        bubbleOsc.connect(bubbleFilter);
        bubbleFilter.connect(bubbleGain);
        bubbleGain.connect(ctx.destination);

        bubbleOsc.start();
        bubbleOsc.stop(now + 0.6);
      };

      // Periodic trigger for water environment sounds (every 1.2 to 3 seconds)
      const intervalId = window.setInterval(() => {
        if (Math.random() > 0.3) {
          triggerBubble();
        }
      }, 1500);

      bubbleIntervRef.current = intervalId;
      setIsPlaying(true);
    } catch (e) {
      console.error("Failed to start sound synthesizer:", e);
    }
  };

  const stopAudio = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (bubbleIntervRef.current) {
      clearInterval(bubbleIntervRef.current);
      bubbleIntervRef.current = null;
    }
    setIsPlaying(false);
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  useEffect(() => {
    return () => {
      // Clean up sound context on unmount to avoid CPU leakage
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      if (bubbleIntervRef.current) {
        clearInterval(bubbleIntervRef.current);
      }
    };
  }, []);

  return (
    <button
      id="sound-toggle-btn"
      onClick={toggleSound}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all duration-300 ${
        isPlaying
          ? "border-teal-400 text-teal-400 bg-teal-950/40 shadow-[0_0_10px_rgba(20,184,166,0.2)]"
          : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
      }`}
      title={isPlaying ? "關閉深海低頻與歌聲" : "開啟深海低頻與歌聲"}
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span className="hidden sm:inline">深淵低語已開啟</span>
        </>
      ) : (
        <>
          <VolumeX className="w-4 h-4" />
          <span className="hidden sm:inline">開啟深淵低語</span>
        </>
      )}
    </button>
  );
}
