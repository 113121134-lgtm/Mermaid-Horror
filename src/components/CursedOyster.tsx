/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, RefreshCcw } from "lucide-react";

interface CursedOysterProps {
  onOracleRevealed: (sanCost: number, title: string) => void;
}

const oysterFortunes = [
  {
    title: "深水溺咒",
    content: "今天，不要與任何眼角帶有潮濕水氣的人直視。那不是淚，是深海滲出的鹹水。若是看進去了，你的理智將悄然流失。",
    color: "from-teal-900 to-black",
    pearlColor: "bg-radial from-teal-300 via-emerald-600 to-teal-950",
    sanCost: -5,
  },
  {
    title: "海妖嘆息",
    content: "你最近瘋狂追尋的某個美好希望，不過是深海巨型鮟鱇魚額前擺動的致命螢光。光芒熄滅時，便是巨口嚙咬之日。",
    color: "from-purple-900 to-black",
    pearlColor: "bg-radial from-purple-300 via-fuchsia-700 to-purple-950",
    sanCost: -7,
  },
  {
    title: "骨碎重壓",
    content: "在一千公尺的深淵水底，連堅不可摧的鋼鐵與骨骼都會被壓扁。你過度的執念與頑固正是這沉重的海水，學會妥協吧，否則會先聽見骨裂聲。",
    color: "from-cyan-950 to-black",
    pearlColor: "bg-radial from-cyan-300 via-blue-700 to-cyan-950",
    sanCost: -4,
  },
  {
    title: "惡水噬心",
    content: "吐出你珍藏自傲的真心吧，就像人魚吐出胃腹中死沉的礁砂。如果不快點說出腐爛的秘密，那秘密將在你胸腔內長出黑色的水螅。",
    color: "from-red-950 to-black",
    pearlColor: "bg-radial from-red-300 via-rose-700 to-red-950",
    sanCost: -8,
  },
  {
    title: "寄生低語",
    content: "路邊偶然聽到的微弱哼唱，是塞壬的聲線。今晚入睡前，你會發現在極度安靜時，你的雙耳深處也正跟著一同震動、哼鳴...",
    color: "from-amber-950 to-black",
    pearlColor: "bg-radial from-amber-200 via-amber-600 to-amber-950",
    sanCost: -6,
  },
  {
    title: "死礁沉淪",
    content: "走在路上請不要回頭。有些東西正拖著濕漉漉的衣角跟在你身後，那是由你過往愧疚揉捏而成的死礁女鬼，只要你回顧一次，她便將你拉下一英尋。",
    color: "from-slate-900 to-black",
    pearlColor: "bg-radial from-slate-200 via-slate-600 to-zinc-950",
    sanCost: -5,
  }
];

export default function CursedOyster({ onOracleRevealed }: CursedOysterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [currentFortune, setCurrentFortune] = useState<typeof oysterFortunes[0] | null>(null);

  const handleOpenShell = () => {
    if (isOpening) return;
    
    if (isOpen) {
      // Close it first to allow reset/retry
      setIsOpen(false);
      setCurrentFortune(null);
      return;
    }

    setIsOpening(true);
    // Draw a random index
    const randomIndex = Math.floor(Math.random() * oysterFortunes.length);
    const fortune = oysterFortunes[randomIndex];

    // Slow creepy reveal animation
    setTimeout(() => {
      setCurrentFortune(fortune);
      setIsOpen(true);
      setIsOpening(false);
      onOracleRevealed(fortune.sanCost, `血珠祭：${fortune.title}`);
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl glass-panel relative overflow-hidden min-h-[350px]">
      <div className="absolute inset-0 bg-gradient-to-t from-teal-950/10 to-transparent pointer-events-none" />
      
      <h3 className="text-lg font-serif tracking-wider text-rose-400 mb-2 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
        血珠獻祭 ‧ 每日靈籤
      </h3>
      <p className="text-xs text-gray-400 font-serif mb-8 text-center max-w-sm">
        點擊古老的人魚骨蚌，向深海獻祭你的專注，剖開堅硬的甲殼，取走帶有詛咒或啟示的血黑珍珠。
      </p>

      {/* Oyster Shell Visual with Framer Motion */}
      <div className="relative w-48 h-40 flex items-center justify-center cursor-pointer select-none" onClick={handleOpenShell}>
        {/* Deep sea glowing background spot */}
        <div className={`absolute w-32 h-32 rounded-full filter blur-xl transition-all duration-1000 ${
          isOpen ? "bg-rose-500/20 scale-125" : "bg-teal-500/5 scale-75"
        }`} />

        {/* Top Shell */}
        <motion.div
          animate={
            isOpen 
              ? { rotateX: -75, y: -45, z: 20 } 
              : isOpening 
                ? { y: [0, -10, 0, -5], rotateX: [0, -15, 0, -12] }
                : { rotateX: 0, y: 0 }
          }
          transition={{ duration: isOpen ? 1 : 0.8, ease: "easeInOut" }}
          style={{ originY: 0.1, transformStyle: "preserve-3d" }}
          className="absolute top-8 w-40 h-16 bg-gradient-to-b from-teal-900 to-teal-950/90 rounded-t-full border-t border-teal-500/30 flex items-center justify-center shadow-lg z-20"
        >
          {/* Shell Grooves */}
          <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,rgba(0,0,0,0.8)_10px)] rounded-t-full" />
          <div className="absolute w-6 h-4 bg-teal-950/80 rounded-full border border-teal-500/20 top-1 shadow-inner" />
        </motion.div>

        {/* Center Glowing Pearl (Only visible when open or opening slightly) */}
        <AnimatePresence>
          {(isOpen || isOpening) && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0.3, opacity: 0.5 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="absolute z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(251,113,133,0.6)]"
            >
              <div className={`w-full h-full rounded-full animate-pulse shadow-inner ${
                currentFortune ? currentFortune.pearlColor : "bg-radial from-rose-300 via-rose-600 to-rose-950"
              }`} />
              <div className="absolute w-2 h-2 rounded-full bg-white/70 top-1.5 left-1.5 filter blur-[0.5px]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Shell */}
        <div className="absolute bottom-8 w-40 h-16 bg-gradient-to-b from-teal-950 to-teal-900rounded-b-full border-b border-teal-500/20 flex items-center justify-center shadow-2xl z-0">
          <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,rgba(0,0,0,0.8)_10px)] rounded-b-full" />
          {/* Interior flesh look */}
          <div className="w-32 h-10 bg-gradient-to-t from-red-950/60 to-rose-900/60 rounded-full border border-rose-900/40 shadow-inner mt-2 flex items-center justify-center">
            {isOpening && !isOpen && (
              <span className="text-[10px] text-rose-400 font-mono tracking-widest animate-pulse">正在撬開宿命...</span>
            )}
          </div>
        </div>
      </div>

      {/* Fortune Statement */}
      <div className="w-full mt-4 min-h-[140px] flex items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {isOpen && currentFortune ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-4 py-3 rounded-lg border border-red-950/40 bg-red-950/10 w-full"
            >
              <div className="flex justify-between items-center mb-1 border-b border-red-950/30 pb-1">
                <span className="text-red-400 font-serif font-semibold text-sm">【{currentFortune.title}】</span>
                <span className="text-xs text-rose-500 font-mono">理智流失 {Math.abs(currentFortune.sanCost)}%</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-serif text-justify">
                {currentFortune.content}
              </p>
              <button
                id="reset-oyster-btn"
                onClick={handleOpenShell}
                className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-serif text-rose-400/80 hover:text-rose-300 transition-colors pr-1 cursor-pointer"
              >
                <RefreshCcw className="w-3 h-3" />
                重新蓋上蚌殼獻祭
              </button>
            </motion.div>
          ) : !isOpen && !isOpening ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-gray-500 font-serif italic"
            >
              等待觸摸蚌腹，獲取海妖對你的暗黑警兆...
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
