import { Scene, totalFrames } from "../nvidia/data";

export const TAIL_BTC2 = 12;

/** Bitcoin Parte 2: como o Bitcoin funciona de verdade. */
export const SCENES_BTC2: Scene[] = [
  {
    id: 1,
    audio: "assets/btc2-en-1.wav",
    audioSec: 7.001,
    visual: "btccoin",
    highlight: "PART 2",
    sub: "how Bitcoin actually works",
    caption: "*Part two:* how Bitcoin actually works. No bank, no boss, no central server. So who keeps track of the money? *Everyone does.*",
  },
  {
    id: 2,
    audio: "assets/btc2-en-2.wav",
    audioSec: 7.163,
    visual: "blockchain",
    highlight: "",
    caption: "Every Bitcoin transaction ever made is written in one public record, called *the blockchain*. Anyone in the world can download a copy.",
  },
  {
    id: 3,
    audio: "assets/btc2-en-3.wav",
    audioSec: 6.861,
    visual: "anatomy",
    highlight: "",
    caption: "Roughly *every ten minutes*, a new block is added. Each block holds a few thousand transactions, plus *the fingerprint of the block before it*.",
  },
  {
    id: 4,
    audio: "assets/btc2-en-4.wav",
    audioSec: 6.92,
    visual: "tamper",
    highlight: "",
    caption: "Change one old transaction, and that block's fingerprint changes. *Every block after it breaks.* That is why the past cannot be rewritten.",
  },
  {
    id: 5,
    audio: "assets/btc2-en-5.wav",
    audioSec: 7.326,
    visual: "mining",
    highlight: "",
    caption: "So who adds the blocks? *Miners.* Machines all over the world race to solve a guessing puzzle, making *quintillions of guesses* every second.",
  },
  {
    id: 6,
    audio: "assets/btc2-en-6.wav",
    audioSec: 6.002,
    visual: "reward",
    highlight: "",
    caption: "The first to find the answer adds the next block, and earns *brand new Bitcoin* as a reward. This is called *proof of work*.",
  },
  {
    id: 7,
    audio: "assets/btc2-en-7.wav",
    audioSec: 5.19,
    visual: "cap",
    highlight: "",
    caption: "But there will only ever be *21 million Bitcoin*. The limit is written into the code. *Nobody can print more.*",
  },
  {
    id: 8,
    audio: "assets/btc2-en-8.wav",
    audioSec: 8.034,
    visual: "halving",
    highlight: "",
    caption: "Every four years, *the reward is cut in half*. It started at 50 coins per block. Since the 2024 halving, it is just *3.125*.",
  },
  {
    id: 9,
    audio: "assets/btc2-en-9.wav",
    audioSec: 6.351,
    visual: "keys",
    highlight: "",
    caption: "To own Bitcoin, you only need a *private key*: a secret number. Lose it, and your coins are *gone forever*. No bank can help you.",
  },
  {
    id: 10,
    audio: "assets/btc2-en-10.wav",
    audioSec: 3.704,
    visual: "btccoin",
    highlight: "PART 3",
    sub: "who is Satoshi Nakamoto?",
    caption: "Part three: who is Satoshi Nakamoto? *Follow so you don't miss it.*",
  },
];

export const TOTAL_FRAMES_BTC2 = totalFrames(SCENES_BTC2, TAIL_BTC2);
