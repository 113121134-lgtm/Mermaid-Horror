/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini SDK successfully initialized with user API key.");
  } catch (err) {
    console.error("Failed to initialize Gemini SDK:", err);
  }
} else {
  console.warn("No valid GEMINI_API_KEY found. Falling back to default thematic simulation.");
}

// -------------------------------------------------------------
// Atmospheric Mock Fallbacks for Resilient Offline/No-Key Mode
// -------------------------------------------------------------
const mockProphecies = [
  {
    warning: "冰冷的鹽水正慢慢灌入你的肺葉，掙扎只會加快下沉的速度...",
    vision: "在深邃的黑泥中，你看見自己被無數隻長滿鱗片的冰冷死骸手臂緩緩拉下。海水淹沒了視線，最後一幕是深淵人魚正盯著你的雙眼，撕扯你無謂的執念與妄想。",
    price: "真相的代價是學會割捨。過度眷戀水面上的溫暖，只會讓你在深海中墜落得更快。閉上雙眼，接受墜落吧。",
    sanImpact: -18,
    sanVerdict: "靈魂溺水"
  },
  {
    warning: "美麗的歌聲在珊瑚叢中歌唱，但別忘了，美麗之下是尖銳的人魚獠牙。",
    vision: "一隻帶著腐肉與鱗片的美麗人魚向你游來。她張開血盆大口，噴吐出漆黑如墨的怨念。你發現你夢寐以求的彼岸，不過是這場佈滿水母劇毒的祭壇。",
    price: "你所渴望的承諾、或是渴望得到的解脫，背後索求的是你靈魂的一大塊血肉。別急著獻祭，先看清那雙發光的死魚眼。",
    sanImpact: -25,
    sanVerdict: "噬咬幻覺"
  },
  {
    warning: "廢棄的船骸沉睡在海底深處，你以為發現了寶藏，但那只是死亡的誘餌。",
    vision: "黑色的雜草將你裸露的腳踝緩緩纏繞。在腐爛的鐵錨周圍，浮沉著生前與你相關之人的破敗面孔。他們口中默唸著你的名字，引誘你加入這場永無止盡的深海長眠。",
    price: "困住你的不是外界，而是你給自己鑄造的、帶著寄生貝殼的沉重宿命。若想解脫，唯有忍痛切斷你被水螅啃蝕的手指。",
    sanImpact: -12,
    sanVerdict: "深淵停滯"
  },
  {
    warning: "黑珍珠在黏糊的蚌殼內散發出誘人的幽光，想拿到它，手就不能怕痛。",
    vision: "你將雙手伸入那碩大的血紅色蚌殼。就在碰到黑珍珠的瞬間，布滿倒鉤的帶齒蚌殼猛然閉合！溫熱的鮮血在漆黑冰冷的海水中散開，引來無數飢餓的幽靈魚狂歡。",
    price: "財富或名利是深海的毒藥。你過度的執念已經成了引誘掠食者的血腥味。學會吐出你嘴中的泡沫，或許還能留存一絲清醒。",
    sanImpact: -22,
    sanVerdict: "貪婪之噬"
  },
  {
    warning: "水面波光粼粼看似平靜，但你正漫步在通往海溝最黑暗裂縫的邊緣。",
    vision: "海水溫度急遽下降，你感覺心臟跳動變得極其遲鈍。海水壓榨著你的肋骨，海溝中傳來遠古海怪的咆哮聲，你只是牠利齒夾縫間的一粒微不足道的骨屑。",
    price: "直面眼前的巨大危機，不要假裝它不存在。越是逃避到平靜的海灘，背後的黑潮巨浪越會將你徹底打碎。直視未知的恐懼吧。",
    sanImpact: -30,
    sanVerdict: "黑潮狂亂"
  }
];

// Helper to generate a contextual output if Gemini fails or is missing
function getThematicFallback(queryText: string, cardName?: string): typeof mockProphecies[0] {
  const base = mockProphecies[Math.floor(Math.random() * mockProphecies.length)];
  let prefix = "";
  if (cardName) {
    prefix = `抽到了【${cardName}】。`;
  }
  return {
    ...base,
    vision: `${prefix}針對你所詢問的「${queryText || "未知的命運詛咒"}」，${base.vision}`
  };
}

// -------------------------------------------------------------
// Core Divination API routes
// -------------------------------------------------------------

// API Route 1: Tarot Card Divination
app.post("/api/fortune/tarot", async (req, res) => {
  const { cardName, cardMeaning, query } = req.body;
  const userQuery = query || "我未來的命運與方向";

  const promptText = `這是一位迷茫的求問者，他在『深海人魚恐怖占卜』中抽到了這張牌：
牌名：【${cardName}】
牌意：${cardMeaning}
他的求問問題是：「${userQuery}」

請針對抽到的牌意和他的求問，為他撰寫恐怖占卜。`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction: `你是一位居住在深邃漆黑死寂深海中的恐怖人魚大祭司。你的口吻冰冷、帶有黏稠與窒息的死寂感。
無論用戶詢問什麼或抽到什麼牌，你都必須將答案包裝在詭異、致命、帶有詛咒的深海幽暗意象中。
你的回答必須深度呼應他的牌意和他的具體問題，禁止給予千篇一律的官方心靈雞湯。你代表深海的冰冷絕對真理。
你必須提供具體詳細、具有極強恐怖文學氣息與畫面感的內容。
你必須採用繁體中文（Taiwanese Traditional Chinese）回傳，嚴格遵循提供的 JSON 格式。`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              warning: { type: Type.STRING, description: "一段簡短、帶有詩意與詛咒感的海妖驚悚警示低語，字數 40-60 字。例如：『別在午夜凝視平靜的海，水下有千百隻眼睛...』" },
              vision: { type: Type.STRING, description: "對未來的具體恐怖深海景象描繪，需深度連結用戶問題與牌意，極具水下窒息畫面感，字數 150-250 字。例如：『在黑色的海黏土中，你看見你所珍視的愛情...』" },
              price: { type: Type.STRING, description: "以深海為隱喻的命運黑暗警告、代價或清醒建議，字數 60-100 字。例如：『要逃離水淹，就必須主動獻祭你的聲音。』" },
              sanImpact: { type: Type.INTEGER, description: "理智值消耗。一個 -5 ~ -40 之間的整數。" },
              sanVerdict: { type: Type.STRING, description: "一條四字或五字的恐怖理智判定評語（例如：'窒息性失智'、'暗礁幻碎'）。" }
            },
            required: ["warning", "vision", "price", "sanImpact", "sanVerdict"]
          }
        }
      });

      const text = response.text;
      if (text) {
        const result = JSON.parse(text.trim());
        return res.json(result);
      }
    } catch (err) {
      console.error("Gemini API error during Tarot compilation, swapping to fallback:", err);
    }
  }

  // Fallback if AI SDK fails or is offline
  const fallbackResult = getThematicFallback(userQuery, cardName);
  return res.json(fallbackResult);
});

// API Route 2: Free-text Whispers Question Divination
app.post("/api/fortune/whisper", async (req, res) => {
  const { name, question } = req.body;
  const userName = name || "無名溺水者";
  const userQuestion = question || "在深海迷航";

  const promptText = `求問者姓名：${userName}
他的求問問題：「${userQuestion}」

請針對他的提問與名諱，調用深海人魚之靈的感知，為他揭開黑暗深淵的恐怖真相。`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction: `你是一隻深藏於極度冰冷海底、雙目已盲卻能看穿人命運的恐怖海妖。
你對陸地上的「${userName}」的命運求問「${userQuestion}」感到悲憫又飢餓。
你必須將他的名字與他的疑惑編織在帶有詛咒的海妖吟唱與深黑水底意象中。
你不能給他虛假的安慰，而必須揭露這場問題底下最赤裸而令人顫慄的海洋隱喻。
你必須採用繁體中文（Taiwanese Traditional Chinese）回傳，嚴格遵循指定的 JSON 格式。`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              warning: { type: Type.STRING, description: "一首短小驚悚的海妖之歌、警示、或讖言，字數 40-60 字。必須代入並針對「${userName}」的名字與靈性。" },
              vision: { type: Type.STRING, description: "為他構建的深海命運窒息幻象，極具驚悚小說質感與黏稠黑水氣息，字數 150-250 字。" },
              price: { type: Type.STRING, description: "真切深刻、融入深海隱喻的命運諫言或生存代價，字數 60-100 字。" },
              sanImpact: { type: Type.INTEGER, description: "理智消耗程度 (-5 至 -40 的整數)。" },
              sanVerdict: { type: Type.STRING, description: "恐怖的四字或五字理智判定評語。" }
            },
            required: ["warning", "vision", "price", "sanImpact", "sanVerdict"]
          }
        }
      });

      const text = response.text;
      if (text) {
        const result = JSON.parse(text.trim());
        return res.json(result);
      }
    } catch (err) {
      console.error("Gemini API error during Whisper compilation, swapping to fallback:", err);
    }
  }

  // Fallback
  const fallbackResult = getThematicFallback(userQuestion);
  fallbackResult.warning = `「${userName}」，${fallbackResult.warning}`;
  return res.json(fallbackResult);
});

// -------------------------------------------------------------
// Serve Static Assets & SPA Client Handling with Vite support
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Integrate Vite in development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware loaded support successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Deep-sea Mermaid Horrors active on port http://localhost:${PORT}`);
  });
}

startServer();
