import { Scene, totalFrames } from "../nvidia/data";

export const TAIL_BTC3 = 12;

/**
 * Bitcoin Parte 3: quem é Satoshi Nakamoto?
 * Os "suspeitos" são teorias públicas; cada um aparece com a negativa
 * ou a decisão judicial correspondente. Ninguém é apontado como Satoshi.
 */
export const SCENES_BTC3: Scene[] = [
  {
    id: 1,
    audio: "assets/btc3-en-1.wav",
    audioSec: 7.593,
    visual: "hood",
    highlight: "PART 3",
    sub: "who is Satoshi Nakamoto?",
    caption:
      "*Part three:* who is Satoshi Nakamoto? The creator of Bitcoin holds a fortune that would make him one of the richest people on Earth. And *nobody knows who he is.*",
  },
  {
    id: 2,
    audio: "assets/btc3-en-2.wav",
    audioSec: 7.605,
    visual: "profile",
    highlight: "",
    caption:
      "Satoshi claimed to be a *37-year-old man living in Japan*. But he wrote flawless English, with *British spellings*, and quoted a London newspaper.",
  },
  {
    id: 3,
    audio: "assets/btc3-en-3.wav",
    audioSec: 5.445,
    visual: "team",
    highlight: "",
    caption: "Satoshi may not even be one person. Many believe it was *a small team.* Nobody has ever proven anything.",
  },
  {
    id: 4,
    audio: "assets/btc3-en-4.wav",
    audioSec: 9.915,
    visual: "suspect",
    label: "dorian",
    highlight: "",
    caption:
      "In 2014, Newsweek named *Dorian Nakamoto*, a retired engineer in California. He denied it. And Satoshi's old account posted one line: *I am not Dorian Nakamoto.*",
  },
  {
    id: 5,
    audio: "assets/btc3-en-5.wav",
    audioSec: 8.51,
    visual: "suspect",
    label: "hal",
    highlight: "",
    caption:
      "*Hal Finney*, the first person to ever receive Bitcoin, lived a few blocks from Dorian. He always *denied being Satoshi*, and passed away in 2014.",
  },
  {
    id: 6,
    audio: "assets/btc3-en-6.wav",
    audioSec: 5.224,
    visual: "suspect",
    label: "szabo",
    highlight: "",
    caption: "*Nick Szabo* designed a system called *bit gold*, ten years before Bitcoin. He has denied it too.",
  },
  {
    id: 7,
    audio: "assets/btc3-en-7.wav",
    audioSec: 6.908,
    visual: "suspect",
    label: "wright",
    highlight: "",
    caption: "Then there is *Craig Wright*, who claimed for years that he was Satoshi. In 2024, a *UK High Court ruled that he is not.*",
  },
  {
    id: 8,
    audio: "assets/btc3-en-8.wav",
    audioSec: 5.968,
    visual: "untouched",
    highlight: "",
    caption: "The proof would be simple: *move just one of Satoshi's early coins.* In more than fifteen years, it has *never happened.*",
  },
  {
    id: 9,
    audio: "assets/btc3-en-9.wav",
    audioSec: 5.155,
    visual: "noleader",
    highlight: "",
    caption: "Maybe that is the point. A money with *no leader* has no leader to arrest, to bribe, or to pressure.",
  },
  {
    id: 10,
    audio: "assets/btc3-en-10.wav",
    audioSec: 4.307,
    visual: "btccoin",
    highlight: "PART 4",
    sub: "fortunes made & lost",
    caption: "Part four: the fortunes made and lost with Bitcoin. *Follow so you don't miss it.*",
  },
];

export const TOTAL_FRAMES_BTC3 = totalFrames(SCENES_BTC3, TAIL_BTC3);
