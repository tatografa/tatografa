import { Scene, totalFrames } from "./data";

export const TAIL_P3 = 12;

/**
 * Parte 3: como a NVIDIA ganha dinheiro e o que pode derrubá-la.
 * Nas legendas, trechos entre *asteriscos* ficam em destaque verde.
 */
export const SCENES_P3: Scene[] = [
  {
    id: 1,
    audio: "assets/narr3-en-1.wav",
    audioSec: 5.213,
    visual: "core",
    highlight: "PART 3",
    sub: "how the money machine works",
    caption: "*Part three.* NVIDIA makes money like no other company on Earth. Here is how, and what could bring it down.",
  },
  {
    id: 2,
    audio: "assets/narr3-en-2.wav",
    audioSec: 7.5,
    visual: "donut",
    highlight: "",
    caption:
      "Last year, NVIDIA made *$130 billion*. Almost *90%* came from one thing: data center chips for AI.",
  },
  {
    id: 3,
    audio: "assets/narr3-en-3.wav",
    audioSec: 5.55,
    visual: "waffle",
    highlight: "",
    caption: "And the margins are insane. For every dollar of revenue, about *75 cents* is pure gross profit.",
  },
  {
    id: 4,
    audio: "assets/narr3-en-4.wav",
    audioSec: 6.56,
    visual: "supply",
    highlight: "",
    caption: "Here is the twist: NVIDIA does not build a single chip itself. Every one is manufactured by *TSMC, in Taiwan*.",
  },
  {
    id: 5,
    audio: "assets/narr3-en-5.wav",
    audioSec: 6.502,
    visual: "stock",
    highlight: "",
    caption: "Investors noticed. *$1,000* of NVIDIA stock in 2015 is worth more than *$200,000* today.",
  },
  {
    id: 6,
    audio: "assets/narr3-en-6.wav",
    audioSec: 8.278,
    visual: "rivals",
    highlight: "",
    caption:
      "Rivals are coming: AMD, Intel, even Google, Amazon and Microsoft. Yet NVIDIA still holds *over 80%* of the AI chip market.",
  },
  {
    id: 7,
    audio: "assets/narr3-en-7.wav",
    audioSec: 11.865,
    visual: "crash",
    highlight: "",
    caption:
      "January 2025: Chinese startup DeepSeek claimed to train top AI for a fraction of the cost. NVIDIA lost nearly *$600 billion in one day*, the biggest loss in stock market history.",
  },
  {
    id: 8,
    audio: "assets/narr3-en-8.wav",
    audioSec: 5.817,
    visual: "risks",
    highlight: "",
    caption: "The biggest risks? *Export bans* to China, dependence on *Taiwan*, and customers building *their own chips*.",
  },
  {
    id: 9,
    audio: "assets/narr3-en-9.wav",
    audioSec: 8.499,
    visual: "future",
    highlight: "",
    caption:
      "What is next? Blackwell and Rubin chips, humanoid robots, self-driving cars and AI factories. Jensen calls it *the next industrial revolution*.",
  },
  {
    id: 10,
    audio: "assets/narr3-en-10.wav",
    audioSec: 3.913,
    visual: "cta",
    highlight: "PART 4?",
    sub: "you decide · comment & follow",
    caption: "Part four? You decide. Comment which company you want next, and *follow for more*.",
  },
];

export const TOTAL_FRAMES_P3 = totalFrames(SCENES_P3, TAIL_P3);
