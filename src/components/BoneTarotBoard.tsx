/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Skull, Anchor, HelpCircle, ShieldAlert, Heart, Orbit, Compass, AlertTriangle } from "lucide-react";
import { TarotCard, DivinationResult } from "../types";

// Defined 6 Gothic Tarot Cards
const BONE_TAROT_CARDS: TarotCard[] = [
  {
    id: "head_drowned",
    name: "溺亡者之首",
    nameEn: "Head of the Drowned",
    image: "Skull",
    meaning: "極度的情感拉扯、沈溺於過往的舊帳、拖垮理智的深淵情感",
    description: "一顆長滿珊瑚與寄生貝殼的死人頭顱，眼窩中游出青色的小魚。代表你深受過去回憶或某種無法割捨的感情折磨，正被沉重的水流拖向窒息的河泥深處。"
  },
  {
    id: "siren_tail",
    name: "海妖之尾",
    nameEn: "The Siren's Tail",
    image: "Heart",
    meaning: "有毒的美麗誘惑、欺騙性的願景、口蜜腹劍的甜密詛咒",
    description: "在波光粼粼的淺灘處，一條帶有劇毒黏液與美麗鱗片的人魚尾鰭正在拍打。這代表眼前的機會或對象極度誘人，但如果你靠得太近，水面下隱藏的獠牙會瞬間將你分屍。"
  },
  {
    id: "rusted_anchor",
    name: "鏽蝕宿命錨",
    nameEn: "Rusted Anchor",
    image: "Anchor",
    meaning: "作繭自縛的停滯、被恐懼綁架而無法前行、沉重的古老宿命",
    description: "一柄覆蓋著黑色海螅與鏽跡斑斑的腐爛巨錨，深深卡在深淵的海溝礁石縫中。這象徵著在目前的困局裡你被某個沈重的事物（家庭、創傷、恐懼）牢牢錨定，動彈不得。"
  },
  {
    id: "cursed_pearl",
    name: "詛咒黑珍珠",
    nameEn: "Cursed Pearl",
    image: "Orbit",
    meaning: "帶有劇毒的權利與財富、貪婪的深海陷阱、靈魂的昂貴抵押",
    description: "一顆躺在黑肉蚌夾縫中散發血腥魅光的黑珍珠。它代表著你所渴望、或是目前得到的世俗收穫（名發心利、晉升、權位），其實需要扣押你本就脆弱的靈魂與理智。"
  },
  {
    id: "sea_skeleton",
    name: "深海白骨骸",
    nameEn: "Abyssal Skeleton",
    image: "ShieldAlert",
    meaning: "幻象與繁華褪去、赤裸而痛苦的真相、死裡求生的重組契機",
    description: "一具斜靠在冰冷珊瑚床上的白色骨架，其上空無一物。這是最冷酷的警告，提醒你眼前的幻想即將破滅。唯有主動剝除一切虛偽的光環，直視赤裸的骨骼，方能求得一線生機。"
  },
  {
    id: "serpent_swarm",
    name: "噬魂海蛇群",
    nameEn: "Soul-Biting Serpents",
    image: "Compass",
    meaning: "暗處的嫉妒中傷、口舌與背叛流毒、劇毒的周遭環境",
    description: "一群在烏黑海藻中交織纏繞的盲眼海蛇，牠們游移不定地吐著信子。信號指向你身邊圍繞著帶有敵意的低語、背叛的隱患，或是那些偽裝成海藻攀爬到你身上的攀附者。"
  }
];

interface BoneTarotBoardProps {
  onDivinationComplete: (result: DivinationResult, card: TarotCard, userQuery: string) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}

export default function BoneTarotBoard({ onDivinationComplete, isProcessing, setIsProcessing }: BoneTarotBoardProps) {
  const [query, setQuery] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const getCardIcon = (iconName: string) => {
    switch (iconName) {
      case "Skull": return <Skull className="w-10 h-10 text-teal-400" />;
      case "Anchor": return <Anchor className="w-10 h-10 text-blue-400" />;
      case "Heart": return <Heart className="w-10 h-10 text-rose-500" />;
      case "Orbit": return <Orbit className="w-10 h-10 text-amber-500" />;
      case "ShieldAlert": return <ShieldAlert className="w-10 h-10 text-slate-300" />;
      default: return <Compass className="w-10 h-10 text-red-400" />;
    }
  };

  const handleCardClick = async (card: TarotCard) => {
    if (isProcessing) return;
    
    setSelectedCardId(card.id);
    setIsProcessing(true);

    try {
      const res = await fetch("/api/fortune/tarot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardName: card.name,
          cardMeaning: card.meaning,
          query: query.trim() || "我混沌不定的未來與宿命運途"
        })
      });

      if (!res.ok) {
        throw new Error("Abyssal current disconnected.");
      }

      const data: DivinationResult = await res.json();
      
      // Delay slightly for dramatic suspense
      setTimeout(() => {
        onDivinationComplete(data, card, query.trim() || "我混沌不定的未來與宿命運途");
        setSelectedCardId(null);
        setIsProcessing(false);
      }, 1500);

    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setSelectedCardId(null);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Search Input Box with thematic elements */}
      <div className="w-full max-w-xl mb-10 px-4">
        <label htmlFor="tarot-query-input" className="block text-xs font-serif text-teal-300 mb-2 tracking-widest text-center">
          【 於海鹽黑水之上，書寫你的困惑與姓名 】
        </label>
        <div className="relative">
          <input
            id="tarot-query-input"
            type="text"
            className="w-full px-4 py-3 bg-black/80 border border-teal-950 rounded-lg text-sm text-gray-200 placeholder-teal-950 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all font-serif shadow-inner text-center"
            placeholder="例如：王小明，我想問我的愛情是否能掙脫這令人窒息的控制..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isProcessing}
          />
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
        </div>
        <p className="text-[10px] text-gray-500 text-center font-serif mt-2 italic">
          人魚只在黑潮湧上時吐露預言。輸入明確的問題與真實稱呼，方能刺入命運的鱗甲。
        </p>
      </div>

      {/* 6 Grid Face Down Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl px-4 w-full">
        {BONE_TAROT_CARDS.map((card, index) => {
          const isSelected = selectedCardId === card.id;
          const isHovered = hoveredCardId === card.id;
          
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              onMouseEnter={() => !isProcessing && setHoveredCardId(card.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              onClick={() => handleCardClick(card)}
              className={`relative aspect-[3/5] rounded-xl cursor-pointer select-none border overflow-hidden transition-all duration-300 ${
                isSelected 
                  ? "border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.5)] bg-teal-950/60 z-30 scale-105"
                  : isHovered
                    ? "border-teal-500/60 shadow-[0_0_15px_rgba(20,184,166,0.3)] bg-teal-950/20 -translate-y-2"
                    : "border-teal-950/80 bg-black/60 hover:border-teal-900"
              }`}
            >
              <AnimatePresence mode="wait">
                {isSelected ? (
                  // Flipping loading state
                  <motion.div
                    key="flipping"
                    initial={{ opacity: 0, rotateY: 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: -90 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center"
                  >
                    <div className="relative mb-3 flex items-center justify-center">
                      <div className="w-12 h-12 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      <Skull className="w-6 h-6 text-teal-500 absolute animate-pulse" />
                    </div>
                    <p className="text-xs text-teal-400 font-serif tracking-widest animate-pulse">
                      拉扯溺死繩索...
                    </p>
                    <p className="text-[9px] text-teal-700 font-mono mt-1">
                      EXTRACTING TRUTH
                    </p>
                  </motion.div>
                ) : (
                  // Normal Face Down Card Visual
                  <motion.div
                    key="back"
                    className="absolute inset-0 p-4 flex flex-col items-center justify-between"
                  >
                    {/* Dark Water filigree pattern on card background */}
                    <div className="absolute inset-1.5 border border-teal-950/40 rounded-lg pointer-events-none" />
                    <div className="absolute inset-0 bg-radial from-transparent to-teal-950/15 pointer-events-none" />

                    {/* Top Accent */}
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-mono tracking-widest text-teal-800">BONE ORACLE</span>
                      <div className="h-[1px] w-12 bg-teal-950/40 mt-1" />
                    </div>

                    {/* Central Mysterious Skeleton Signet */}
                    <div className="flex flex-col items-center justify-center relative">
                      <div className={`p-4 rounded-full border border-teal-950 bg-teal-950/5 transition-all duration-300 ${isHovered ? 'scale-110 border-teal-800 bg-teal-950/20' : ''}`}>
                        <HelpCircle className={`w-8 h-8 text-teal-950 transition-all duration-300 ${isHovered ? 'text-teal-600' : ''}`} />
                      </div>
                      {isHovered && (
                        <span className="absolute -bottom-6 text-[10px] text-teal-400 font-serif tracking-widest whitespace-nowrap animate-pulse">
                          觸碰死兆牌
                        </span>
                      )}
                    </div>

                    {/* Bottom Indicator */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-[1px] w-12 bg-teal-950/40" />
                      <span className="text-[10px] text-teal-900 font-serif">CARTE VII</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Side advice for horror ambiance */}
      <div className="mt-8 flex items-center gap-2 text-rose-500/60 font-serif text-[11px] border border-rose-950/20 bg-rose-950/5 px-4 py-2 rounded-lg max-w-md mx-4 text-center">
        <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
        <span>注意：深海牌意殘酷。每次翻牌皆會直刺命運罩門，必會剝奪一定的理智值（San 值）。</span>
      </div>
    </div>
  );
}
