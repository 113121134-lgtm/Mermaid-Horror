/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Eye, Brain, EyeOff, Loader } from "lucide-react";
import { DivinationResult } from "../types";

interface SirenWhispersProps {
  onDivinationComplete: (result: DivinationResult, userQuery: string) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}

export default function SirenWhispers({ onDivinationComplete, isProcessing, setIsProcessing }: SirenWhispersProps) {
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [isStaringCode, setIsStaringCode] = useState(true);

  // Spooky thoughts corresponding to typing state
  const getAmbianceText = () => {
    if (isProcessing) return "人魚正在舔舐你的靈魂邊緣...";
    if (question.length > 20) return "死寂的水底，聽見了你沉重的呼吸與不甘...";
    if (question.length > 5) return "人魚的眼瞼微顫，她感知到了你的痛苦...";
    if (name.length > 0) return "名字已被海水滲透，你的靈魂已被鎖定...";
    return "凝視深淵，在黑水中吐露你的不解與恐懼...";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isProcessing || !name.trim() || !question.trim()) return;

    setIsProcessing(true);

    try {
      const res = await fetch("/api/fortune/whisper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          question: question.trim()
        })
      });

      if (!res.ok) {
        throw new Error("Drowning in the black stream.");
      }

      const data: DivinationResult = await res.json();
      
      setTimeout(() => {
        onDivinationComplete(data, question.trim());
        setIsProcessing(false);
      }, 1800);

    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl glass-panel relative overflow-hidden p-6 md:p-8">
      {/* Background radial gradient representing a massive biological monster eye glow */}
      <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full filter blur-3xl transition-all duration-1000 ${
        isProcessing ? "bg-red-950/40 animate-ping" : "bg-teal-950/20"
      }`} />

      {/* Ambiance header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-teal-950/60">
        <div className="flex items-center gap-2">
          {isStaringCode ? (
            <Eye className="w-4 h-4 text-rose-500 animate-pulse" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-600" />
          )}
          <span className="text-xs font-mono text-gray-400 tracking-wider">
            ABYSSAL RADAR: ACTIVE
          </span>
        </div>
        <button
          id="staring-toggle-btn"
          onClick={() => setIsStaringCode(!isStaringCode)}
          className="text-[10px] text-teal-800 hover:text-teal-400 font-serif"
          type="button"
        >
          {isStaringCode ? "關閉海妖視線" : "開啟海妖視線"}
        </button>
      </div>

      {/* Visual Indicator of Mermaid's focus */}
      {isStaringCode && (
        <div className="h-28 mb-6 rounded-lg bg-black/60 border border-teal-950/30 overflow-hidden flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-t from-teal-950/20 to-transparent pointer-events-none" />
          
          {/* Creepy pulsating lines represent sonar radar */}
          <div className="absolute inset-x-0 h-[1px] bg-teal-500/25 top-1/2 -translate-y-1/2 animate-pulse" />
          <div className="absolute w-24 h-24 rounded-full border border-teal-500/10 animate-ping duration-[4000ms]" />

          <div className="text-center z-10 px-4">
            <motion.p
              key={getAmbianceText()}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-teal-400/80 font-serif italic tracking-wide"
            >
              「 {getAmbianceText()} 」
            </motion.p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="user-name" className="block text-xs font-serif text-teal-400 mb-1.5 tracking-wider">
            提供你的稱呼 ‧ 供人魚吸食餘燼
          </label>
          <input
            id="user-name"
            type="text"
            required
            className="w-full px-4 py-2.5 bg-black/95 border border-teal-950 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-rose-900 focus:ring-1 focus:ring-rose-800/30 transition-all font-serif"
            placeholder="例如：王小明（或任何你被呼喚的印記）"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        <div>
          <label htmlFor="user-question" className="block text-xs font-serif text-teal-400 mb-1.5 tracking-wider">
            寫下盤據在你胸口、使你窒息的疑問
          </label>
          <textarea
            id="user-question"
            required
            rows={4}
            className="w-full px-4 py-2.5 bg-black/95 border border-teal-950 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-rose-900 focus:ring-1 focus:ring-rose-800/30 transition-all font-serif resize-none"
            placeholder="例如：我該繼續堅持目前的這份工作嗎？還是人魚有其他的召喚？我渴望突破現狀..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        {/* Action Button */}
        <button
          id="sacrifice-soul-btn"
          type="submit"
          disabled={isProcessing || !name.trim() || !question.trim()}
          className={`w-full py-3.5 px-6 rounded-lg font-serif tracking-widest text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isProcessing
              ? "bg-rose-950/40 text-rose-500/70 border border-rose-900/30 cursor-not-allowed"
              : name.trim() && question.trim()
                ? "bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800/60 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                : "bg-teal-950/20 text-teal-900 border border-teal-950/30 cursor-not-allowed"
          }`}
        >
          {isProcessing ? (
            <>
              <Loader className="w-4 h-4 animate-spin text-rose-500" />
              <span>正與深海大祭司進行意識連接...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-rose-400" />
              <span>獻祭靈魂 ‧ 聽取海妖低語</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
