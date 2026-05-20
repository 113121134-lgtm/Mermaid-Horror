/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DivinationResult {
  warning: string;      // Spooky poetic warning / riddle
  vision: string;       // Detailed deep-sea horror vision
  price: string;        // Metaphorical advice / price of truth
  sanImpact: number;    // Change in Sanity value (typically negative, e.g., -15)
  sanVerdict: string;   // Shorthand verdict phrase
}

export interface TarotCard {
  id: string;
  name: string;
  nameEn: string;
  image: string; // Tailwind pattern / icon or visual element
  meaning: string;
  description: string;
}

export interface HistoryRecord {
  id: string;
  type: 'tarot' | 'whisper' | 'pearl';
  timestamp: string;
  query?: string;
  targetCard?: string;
  result: DivinationResult;
}
