import { Scene, totalFrames } from "../nvidia/data";

export const TAIL_BTC4 = 12;

/**
 * Bitcoin Parte 4: fortunas feitas e perdidas — a queda de novembro de 2026.
 * Fatos conforme CNBC, CoinDesk, Cointelegraph, Investing.com e The Block (20–21/nov/2026).
 */
export const SCENES_BTC4: Scene[] = [
  {
    id: 1,
    audio: "assets/btc4-en-1.wav",
    audioSec: 6.235,
    visual: "breakline",
    highlight: "PART 4",
    sub: "fortunes made & lost",
    caption: "*Part four:* fortunes made and lost. And right now, they are being lost. Bitcoin just crashed *below $60,000.*",
  },
  {
    id: 2,
    audio: "assets/btc4-en-2.wav",
    audioSec: 8.092,
    visual: "peaknow",
    highlight: "",
    caption: "On November 20th, Bitcoin fell under $60,000 for the first time since July. That is *less than half its record high* of about $126,000.",
  },
  {
    id: 3,
    audio: "assets/btc4-en-3.wav",
    audioSec: 5.166,
    visual: "streak",
    highlight: "",
    caption: "It is also *seven losing weeks in a row.* The longest losing streak since the crash of 2022.",
  },
  {
    id: 4,
    audio: "assets/btc4-en-4.wav",
    audioSec: 10.937,
    visual: "goldtest",
    highlight: "",
    caption:
      "So why is it falling? First, a *sell-off in AI and tech stocks.* Since early October, the S&P 500 fell about 6%. *Bitcoin fell 27%.* So much for digital gold.",
  },
  {
    id: 5,
    audio: "assets/btc4-en-5.wav",
    audioSec: 5.956,
    visual: "rates",
    highlight: "",
    caption: "Second, *interest rates.* Markets fear rates will stay high for longer, and that pulls money out of risky assets.",
  },
  {
    id: 6,
    audio: "assets/btc4-en-6.wav",
    audioSec: 5.631,
    visual: "etfout",
    highlight: "",
    caption: "Third, investors are leaving. US Bitcoin funds lost *$582 million in a single day.*",
  },
  {
    id: 7,
    audio: "assets/btc4-en-7.wav",
    audioSec: 7.372,
    visual: "liquidation",
    highlight: "",
    caption:
      "Then came the *leverage.* Traders betting with borrowed money were forced out. More than *$2 billion* in positions were wiped out in 24 hours.",
  },
  {
    id: 8,
    audio: "assets/btc4-en-8.wav",
    audioSec: 6.374,
    visual: "minecost",
    highlight: "",
    caption: "JPMorgan estimates it costs around *$86,000 to mine one Bitcoin.* The price is now far below that.",
  },
  {
    id: 9,
    audio: "assets/btc4-en-9.wav",
    audioSec: 11.308,
    visual: "history",
    highlight: "",
    caption:
      "Is this the end? Bitcoin has crashed before. *−93% in 2011, −84% in 2018, −77% in 2022.* Every time, it came back. *But the past guarantees nothing.*",
  },
  {
    id: 10,
    audio: "assets/btc4-en-10.wav",
    audioSec: 3.529,
    visual: "btccoin",
    highlight: "WILL IT\nRECOVER?",
    sub: "comment & follow",
    caption: "Will Bitcoin recover? Tell me in the comments, and *follow for part five.*",
  },
];

export const TOTAL_FRAMES_BTC4 = totalFrames(SCENES_BTC4, TAIL_BTC4);
