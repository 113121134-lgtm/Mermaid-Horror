/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Skull, AlertTriangle, ShieldCheck, Moon, ArrowLeft, Send } from "lucide-react";
import { DivinationResult, TarotCard } from "../types";

interface DivinationResultViewProps {
  result: DivinationResult;
  card?: TarotCard;
  query: string;
  onBack: () => void;
}

export default function DivinationResultView({ result, card, query, onBack }: DivinationResultViewProps) {
  // Simple typewriter states
  const [typedWarning, setTypedWarning] = useState("");
  const [typedVision, setTypedVision] = useState("");
  const [typedPrice, setTypedPrice] = useState("");

  const [warningFinished, setWarningFinished] = useState(false);
  const [visionFinished, setVisionFinished] = useState(false);

  // Typewriter effect logic
  useEffect(() => {
    let wIndex = 0;
    const wText = result.warning;
    setTypedWarning("");
    setTypedVision("");
    setTypedPrice("");
    setWarningFinished(false);
    setVisionFinished(false);

    const wTimer = setInterval(() => {
      if (wIndex < wText.length) {
        setTypedWarning((prev) => prev + wText.charAt(wIndex));
        wIndex++;
      } else {
        clearInterval(wTimer);
        setWarningFinished(true);
      }
    }, 30);

    return () => clearInterval(wTimer);
  }, [result.warning]);

  useEffect(() => {
    if (!warningFinished) return;
    
    let vIndex = 0;
    const vText = result.vision;
    const vTimer = setInterval(() => {
      if (vIndex < vText.length) {
        setTypedVision((prev) => prev + vText.charAt(vIndex));
        vIndex++;
      } else {
        clearInterval(vTimer);
        setVisionFinished(true);
      }
    }, 15);

    return () => clearInterval(vTimer);
  }, [warningFinished, result.vision]);

  useEffect(() => {
    if (!visionFinished) return;

    let pIndex = 0;
    const pText = result.price;
    const pTimer = setInterval(() => {
      if (pIndex < pText.length) {
        setTypedPrice((prev) => prev + pText.charAt(pIndex));
        pIndex++;
      } else {
        clearInterval(pTimer);
      }
    }, 25);

    return () => clearInterval(pTimer);
  }, [visionFinished, result.price]);

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl glass-panel relative overflow-hidden p-6 md:p-8 border-rose-950/40">
      {/* Absolute bloody pulse backdrop */}
      <div className="absolute inset-0 bg-radial from-rose-950/10 via-transparent to-transparent pointer-events-none" />

      {/* Header back button */}
      <button
        id="result-back-btn"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-xs font-serif text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        返回深海大廳
      </button>

      {/* Query Title */}
      <div className="mb-6 p-4 rounded-lg bg-black/60 border border-teal-950/40">
        <span className="text-[10px] font-mono tracking-widest text-teal-600 block mb-1">求問之事</span>
        <p className="text-sm font-serif text-gray-300 italic">「 {query} 」</p>
      </div>

      {/* Tarot Card Specific disclosures */}
      {card && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-4 rounded-xl border border-teal-950 bg-teal-950/10 flex flex-col md:flex-row items-center gap-4"
        >
          <div className="w-16 h-24 bg-black/80 rounded-lg border border-teal-500/30 flex flex-col items-center justify-center shrink-0 shadow-lg">
            <span className="text-[7px] text-teal-700 font-mono tracking-widest mt-1">TAROT</span>
            <div className="my-auto">
              <Skull className="w-6 h-6 text-teal-500 animate-pulse" />
            </div>
            <span className="text-[8px] text-teal-500 font-serif pb-1">BONE CARD</span>
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-sm font-serif text-teal-300 font-semibold mb-1">
              翻出死兆牌：【 {card.name} 】 ({card.nameEn})
            </h4>
            <div className="text-[11px] font-serif text-teal-700 mb-2 font-medium">牌意代表：{card.meaning}</div>
            <p className="text-[11px] text-gray-400 font-serif leading-relaxed italic text-justify">
              {card.description}
            </p>
          </div>
        </motion.div>
      )}

      {/* Prophecy Content */}
      <div className="space-y-6 md:space-y-8 font-serif">
        {/* Warning Section */}
        <div>
          <h4 className="text-xs font-bold tracking-widest text-rose-500 mb-2 flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            【 海妖之警示 Whispering 】
          </h4>
          <div className="p-4 rounded-lg bg-red-950/10 border border-red-950/20 text-sm text-rose-400/90 leading-relaxed italic text-center font-medium min-h-[48px]">
            {typedWarning}
            {!warningFinished && <span className="inline-block w-1.5 h-4 bg-rose-500 ml-1 animate-ping" />}
          </div>
        </div>

        {/* Vision Section */}
        <div>
          <h4 className="text-xs font-bold tracking-widest text-teal-400 mb-2 flex items-center gap-1.5">
            <Skull className="w-3.5 h-3.5 text-teal-500" />
            【 深海之幻象 Vision 】
          </h4>
          <div className="p-4 rounded-lg bg-black/60 border border-teal-950/30 text-xs text-justify text-gray-300 leading-relaxed indent-6 min-h-[100px]">
            {typedVision}
            {warningFinished && !visionFinished && (
              <span className="inline-block w-1.5 h-3 bg-teal-500 ml-1 animate-ping" />
            )}
          </div>
        </div>

        {/* Price / Advice Section */}
        <div>
          <h4 className="text-xs font-bold tracking-widest text-amber-500 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            【 真相的代價 Sacrifice 】
          </h4>
          <div className="p-4 rounded-lg bg-black/60 border border-amber-950/20 text-xs text-justify text-amber-400/90 leading-relaxed min-h-[64px]">
            {typedPrice}
            {visionFinished && typedPrice.length < result.price.length && (
              <span className="inline-block w-1.5 h-3 bg-amber-500 ml-1 animate-ping" />
            )}
          </div>
        </div>
      </div>

      {/* Sanity gauge visual effect */}
      <div className="mt-8 pt-6 border-t border-teal-950/60 font-serif">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span className="text-xs text-rose-400 tracking-wider">命運撕裂 ‧ 理智判定：</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded border border-rose-950 bg-red-950/20 text-rose-400 font-mono">
            {result.sanVerdict}
          </span>
        </div>
        <div className="relative h-2.5 bg-black rounded-full overflow-hidden border border-teal-950">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: `${100 - Math.abs(result.sanImpact)}%` }}
            transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-500 to-rose-600 rounded-full"
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 mt-1.5">
          <span>餘溫尚存的清醒</span>
          <span className="text-rose-500 font-mono">理智流失 {result.sanImpact}%</span>
        </div>
      </div>

      {/* Footer Return */}
      <button
        id="result-back-home-btn"
        onClick={onBack}
        className="w-full mt-8 py-3 bg-teal-950/30 hover:bg-teal-950/50 text-teal-400 hover:text-teal-300 font-serif text-xs rounded-lg border border-teal-950 transition-all text-center cursor-pointer"
      >
        合上雙眼 ‧ 游回水面
      </button>
    </div>
  );
}
