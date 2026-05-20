/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Skull, Compass, HelpCircle, Heart, RefreshCw, 
  History, ShieldCheck, Moon, Sparkles, BookOpen 
} from "lucide-react";

import DeepSeaSound from "./components/DeepSeaSound";
import CursedOyster from "./components/CursedOyster";
import BoneTarotBoard from "./components/BoneTarotBoard";
import SirenWhispers from "./components/SirenWhispers";
import DivinationResultView from "./components/DivinationResultView";
import { DivinationResult, TarotCard, HistoryRecord } from "./types";

export default function App() {
  // Navigation tabs: 'tarot' | 'whispers' | 'oyster'
  const [activeTab, setActiveTab] = useState<'tarot' | 'whispers' | 'oyster'>('tarot');
  
  // Divination execution states
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState<DivinationResult | null>(null);
  const [selectedCard, setSelectedCard] = useState<TarotCard | undefined>(undefined);
  const [userQuery, setUserQuery] = useState("");

  // Game States: Sanity Gauge (0 - 100) persistent in localStorage
  const [sanity, setSanity] = useState<number>(100);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isCursed, setIsCursed] = useState(false); // Sanity zero trigger state

  // Load Sanity and History on mount
  useEffect(() => {
    const savedSanity = localStorage.getItem("mermaid_sanity_v2");
    if (savedSanity !== null) {
      const parsed = parseInt(savedSanity);
      setSanity(parsed);
      if (parsed <= 0) setIsCursed(true);
    }

    const savedHistory = localStorage.getItem("mermaid_history_v2");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history.");
      }
    }
  }, []);

  // Update localStorage when sanity changes
  const updateSanityState = (newSanity: number) => {
    const bounded = Math.max(0, Math.min(100, newSanity));
    setSanity(bounded);
    localStorage.setItem("mermaid_sanity_v2", bounded.toString());
    
    if (bounded <= 0) {
      setIsCursed(true);
    } else {
      setIsCursed(false);
    }
  };

  // Sound Bubble pop effect synthesized on-the-fly when key events happen
  const playFlashSynth = (freq: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq / 2, ctx.currentTime + 0.5);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  // Restoration actions + text notifications
  const handleRestoreSanity = (amount: number, type: 'salt' | 'sun' | 'water') => {
    playFlashSynth(300);
    const costTextMap = {
      salt: "你大口吸進一劑微溫的海鹽與潮汐蒸汽，咳出喉嚨中的海沙。理智稍微好轉...",
      sun: "你拼命游上海面，將乾縮的皮膚曝曬在溫熱的陽光下，海妖的呢喃漸漸遠去...",
      water: "你喝下一口古老的修道院聖水，喉嚨內灼燒的死水咒詛正在融化消失。"
    };
    alert(costTextMap[type]);
    updateSanityState(sanity + amount);
  };

  const handleResetCursedContract = () => {
    playFlashSynth(440);
    updateSanityState(100);
    setIsCursed(false);
    setHistory([]);
    localStorage.removeItem("mermaid_history_v2");
  };

  // Record a divination result
  const recordDivination = (result: DivinationResult, card?: TarotCard, queryText?: string) => {
    // Generate new record
    const newRecord: HistoryRecord = {
      id: Math.random().toString(36).substring(7),
      type: activeTab,
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
      query: queryText,
      targetCard: card?.name,
      result
    };

    const updatedHistory = [newRecord, ...history].slice(0, 50); // Keep max 50 items
    setHistory(updatedHistory);
    localStorage.setItem("mermaid_history_v2", JSON.stringify(updatedHistory));

    // Update Sanity values
    updateSanityState(sanity + result.sanImpact);
  };

  return (
    <div className="relative min-h-screen font-serif text-gray-200 select-none overflow-x-hidden p-0 m-0 bg-[#02050b]">
      {/* Absolute Dark Sea Background with fluid animation */}
      <div className="absolute inset-0 z-0 animate-water bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/25 via-[#02060c] to-[#010306] pointer-events-none" />
      
      {/* Floating glowing Bioluminescent dust particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-teal-400/20 filter blur-[4px]"
            style={{
              width: `${Math.random() * 6 + 4}px`,
              height: `${Math.random() * 6 + 4}px`,
              left: `${Math.random() * 100}%`,
              animation: `float-dust ${15 + Math.random() * 15}s linear infinite`,
              animationDelay: `${-Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Screen tint Red Pulse for low sanity */}
      <AnimatePresence>
        {sanity < 30 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-950/40 pointer-events-none z-40 transition-all duration-1000 border-4 border-red-900/40"
          />
        )}
      </AnimatePresence>

      {/* Primary Layout Structure */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6 md:py-10 flex flex-col min-h-screen">
        
        {/* Header Branding section */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-teal-900/30 pb-6 mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold tracking-widest text-teal-400 flex items-center justify-center md:justify-start gap-2 select-none">
              <Skull className="w-6 h-6 text-teal-500 animate-pulse" />
              美人魚恐怖占卜
            </h1>
            <p className="text-[10px] md:text-xs text-gray-400 tracking-wide mt-1.5 uppercase font-mono">
              ★ Cursea Deep Sea: The Abyssal Mermaid Oracle ★
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Realtime synthesized Deep Sea rumbles */}
            <DeepSeaSound />

            {/* View soul diaries history */}
            <button
              id="history-toggle"
              onClick={() => {
                setShowHistory(!showHistory);
                playFlashSynth(280);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-teal-950/80 bg-black/60 text-xs font-serif text-teal-400/80 hover:text-teal-300 transition-colors cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>{showHistory ? "回到占卜大廳" : "靈魂深處刻印"}</span>
            </button>
          </div>
        </header>

        {/* Global Game Status Banner: The Sanity gauge indicator */}
        <section className="mb-8 rounded-xl glass-panel p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className={`p-2 rounded-full ${sanity < 30 ? 'bg-red-950/50 text-red-500 animate-bounce' : 'bg-teal-950/40 text-teal-400'}`}>
              <Skull className="w-5 h-5" />
            </div>
            <div className="w-full sm:w-60">
              <div className="flex justify-between items-center text-xs font-serif mb-1">
                <span className="text-gray-400">目前理智值(SAN) :</span>
                <span className={`font-mono text-sm font-semibold ${sanity < 30 ? 'text-red-500 animate-pulse' : 'text-teal-400'}`}>
                  {sanity}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-black rounded-full overflow-hidden border border-teal-900/45">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${sanity < 30 ? 'bg-red-600' : 'bg-teal-500'}`} 
                  style={{ width: `${sanity}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-gray-500 font-serif mr-1">神經緊繃？獻祭微光以修復神智：</span>
            
            <button
              id="restore-salt"
              disabled={sanity >= 100}
              onClick={() => handleRestoreSanity(20, 'salt')}
              className="px-2.5 py-1 text-[10px] rounded border border-teal-900 bg-teal-950/20 text-teal-400 hover:bg-teal-900/60 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              吸食海鹽 (+20%)
            </button>
            <button
              id="restore-sun"
              disabled={sanity >= 100}
              onClick={() => handleRestoreSanity(35, 'sun')}
              className="px-2.5 py-1 text-[10px] rounded border border-rose-950 bg-rose-950/20 text-rose-400 hover:bg-rose-900/60 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              浮出曝曬 (+35%)
            </button>
          </div>
        </section>

        {/* Main interactive grid containing Sidebar & Control stages */}
        <main className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-grow">
          
          {/* LEFT COLUMN: Deep Sea Ambiance, Art asset display, and Tab switches */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* The beautiful generated Mermaid Art asset container */}
            <div className="rounded-xl overflow-hidden border border-teal-900/40 bg-black/60 shadow-lg relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-square">
              {/* Eerie shimmering scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_95%,rgba(0,0,0,0.35)_95%)] bg-[size:100%_12px] pointer-events-none mix-blend-overlay opacity-30 z-10" />
              <div className="absolute inset-0 deep-water-overlay z-10" />
              <img 
                src="/src/assets/images/horror_mermaid_1779260753931.png" 
                alt="Horror Mermaid Abyss" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover animate-pulse saturate-[0.8] contrast-[1.1]"
              />
              <div className="absolute bottom-3 left-3 z-20">
                <span className="text-[9px] font-mono tracking-widest text-teal-400 bg-black/80 px-2 py-0.5 rounded border border-teal-900/40">
                  DEEP SEA DWELLER #09
                </span>
              </div>
            </div>

            {/* Selection modes sidebar */}
            <div className="rounded-xl glass-panel p-4 space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-gray-500 block mb-2 px-1">
                SELECT DIVINATION INSTRUMENTS
              </span>
              
              <button
                id="tab-tarot"
                onClick={() => {
                  setActiveTab('tarot');
                  setCurrentResult(null);
                  setShowHistory(false);
                  playFlashSynth(150);
                }}
                className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-serif transition-colors flex items-center justify-between ${
                  activeTab === 'tarot' && !showHistory
                    ? 'bg-teal-950/60 text-teal-400 border border-teal-500/30'
                    : 'text-gray-400 hover:bg-teal-950/20 hover:text-gray-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Skull className="w-4 h-4 shrink-0" />
                  深海死骨牌 (骨牌羅盤)
                </span>
                <span className="text-[9px] font-mono opacity-50">6 CARDS</span>
              </button>

              <button
                id="tab-whispers"
                onClick={() => {
                  setActiveTab('whispers');
                  setCurrentResult(null);
                  setShowHistory(false);
                  playFlashSynth(180);
                }}
                className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-serif transition-colors flex items-center justify-between ${
                  activeTab === 'whispers' && !showHistory
                    ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                    : 'text-gray-400 hover:bg-rose-950/20 hover:text-gray-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 shrink-0" />
                  海妖窒息面審 (問答低語)
                </span>
                <span className="text-[9px] font-mono opacity-50">AI ANSWER</span>
              </button>

              <button
                id="tab-oyster"
                onClick={() => {
                  setActiveTab('oyster');
                  setCurrentResult(null);
                  setShowHistory(false);
                  playFlashSynth(210);
                }}
                className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-serif transition-colors flex items-center justify-between ${
                  activeTab === 'oyster' && !showHistory
                    ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                    : 'text-gray-400 hover:bg-amber-950/20 hover:text-gray-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  血珠每日靈籤 (蚌腹獻祭)
                </span>
                <span className="text-[9px] font-mono opacity-50">CLAM DRAW</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMNS: Divine execution canvases or History screen */}
          <div className="lg:col-span-3 min-h-[500px] flex flex-col justify-start">
            <AnimatePresence mode="wait">
              
              {/* STAGE A: Cursed State (Sanity hits zero!) */}
              {isCursed ? (
                <motion.div
                  key="cursed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border-2 border-red-900 bg-red-950/20 p-8 text-center flex flex-col items-center justify-center my-auto min-h-[450px]"
                >
                  <Skull className="w-16 h-16 text-red-500 animate-bounce mb-4" />
                  <h2 className="text-xl font-bold font-serif text-red-400 tracking-widest mb-3">
                    【 警告：理智瓦解，你被海妖完全侵占 】
                  </h2>
                  <p className="text-xs text-gray-300 max-w-lg mb-6 leading-relaxed font-serif indent-6 text-justify">
                    冰冷刺骨的海水已經沒過了你的雙眼，你的肋骨長出了幽暗的魚尾、鱗片正在你撕裂的皮膚下緩緩滋生。
                    你大口吞下著漆黑的水，陸地上所有的愛恨、事業與生活已化作荒誕的泡影。
                    你已成為深海死海中、為大祭司服役的盲眼侍女 (人魚死侍) 之一。你...再也無法回到水面了。
                  </p>
                  <button
                    id="break-cursed-contract"
                    onClick={handleResetCursedContract}
                    className="py-3 px-6 rounded bg-red-800 hover:bg-red-700 text-red-100 border border-red-500 text-xs font-serif tracking-widest transition-transform hover:scale-105 cursor-pointer"
                  >
                    撕碎海妖之契約（破除血痕咒詛 ‧ 洗滌靈魂）
                  </button>
                </motion.div>
              ) 
              
              /* STAGE B: Traditional Custom Soul diaries history log */
              : showHistory ? (
                <motion.div
                  key="history-panel"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="rounded-2xl glass-panel p-6 select-none"
                >
                  <h3 className="text-base font-serif font-semibold text-teal-400 mb-4 pb-2 border-b border-teal-950/60 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    靈魂刻印日記 ‧ 過去死兆軌跡 ({history.length})
                  </h3>
                  
                  {history.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 font-serif text-xs">
                      「 宿命的羊皮紙上尚無墨跡。去觸碰牌卡或拋問，留下一鱗半爪。 」
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {history.map((record) => (
                        <div key={record.id} className="p-4 rounded-lg bg-black/60 border border-teal-950/40 text-xs text-justify">
                          <div className="flex justify-between items-center mb-2 text-[10px] text-gray-500 font-serif border-b border-teal-950/20 pb-1">
                            <span>占卜型態：{
                              record.type === 'tarot' ? '死骨牌' : record.type === 'whispers' ? '海妖面審' : '血珠籤'
                            } ‧ {record.timestamp}</span>
                            <span className="text-rose-500 font-semibold">{record.result.sanVerdict} (理智 {record.result.sanImpact}%)</span>
                          </div>
                          {record.query && <p className="text-teal-300 font-serif mb-1 italic">問：「 {record.query} 」{record.targetCard && `【 ${record.targetCard} 】`}</p>}
                          <p className="text-gray-400 capitalize whitespace-pre-wrap leading-relaxed mt-1">
                            警語：{record.result.warning}<br />
                            幻象：{record.result.vision}<br />
                            代價：{record.result.price}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button
                    id="back-lobby-btn"
                    onClick={() => setShowHistory(false)}
                    className="w-full mt-6 py-2.5 bg-teal-950/20 text-teal-400 font-serif text-xs border border-teal-950/60 rounded hover:bg-teal-950/40 transition-colors"
                  >
                    返回占卜大廳
                  </button>
                </motion.div>
              )

              /* STAGE C: Result disclosures with nice animations */
              : currentResult ? (
                <motion.div
                  key="result-stage"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                >
                  <DivinationResultView
                    result={currentResult}
                    card={selectedCard}
                    query={userQuery}
                    onBack={() => {
                      setCurrentResult(null);
                      setSelectedCard(undefined);
                      setUserQuery("");
                      playFlashSynth(350);
                    }}
                  />
                </motion.div>
              )

              /* STAGE D: Menu selections rendering interactive tabs */
              : (
                <motion.div
                  key="normal-stage"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full"
                >
                  {activeTab === 'tarot' && (
                    <BoneTarotBoard
                      isProcessing={isProcessing}
                      setIsProcessing={setIsProcessing}
                      onDivinationComplete={(result, card, query) => {
                        setSelectedCard(card);
                        setUserQuery(query);
                        setCurrentResult(result);
                        recordDivination(result, card, query);
                      }}
                    />
                  )}

                  {activeTab === 'whispers' && (
                    <SirenWhispers
                      isProcessing={isProcessing}
                      setIsProcessing={setIsProcessing}
                      onDivinationComplete={(result, query) => {
                        setUserQuery(query);
                        setCurrentResult(result);
                        recordDivination(result, undefined, query);
                      }}
                    />
                  )}

                  {activeTab === 'oyster' && (
                    <CursedOyster
                      onOracleRevealed={(sanCost, title) => {
                        // Oyster is a quick oracle, we simply trigger sanity changes in background
                        // to keep UX highly fluid
                        updateSanityState(sanity + sanCost);
                      }}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Outer Minimalist footer block */}
        <footer className="mt-16 border-t border-teal-900/10 pt-6 pb-2 text-center text-xs text-gray-600 font-serif select-none">
          <p>© {new Date().getFullYear()} 美人魚驚悚水下命理殿 ‧ 深淵之眼直視你的靈魄</p>
          <p className="text-[10px] mt-1 text-slate-800 tracking-wider">
            DEEP UNDER SEA CURSED PROPHET ‧ SAN: BOUND BY COLD WATER CRUSTS
          </p>
        </footer>
      </div>
    </div>
  );
}
