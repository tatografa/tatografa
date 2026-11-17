import { Scene, totalFrames } from "../nvidia/data";

export const TAIL_BTC1 = 12;

/** Bitcoin Parte 1: como o Bitcoin nasceu (2008 → hoje). */
export const SCENES_BTC1: Scene[] = [
  {
    id: 1,
    audio: "assets/btc1-en-1.wav",
    audioSec: 9.16,
    visual: "btccoin",
    highlight: "PART 1",
    sub: "how Bitcoin was born",
    caption:
      "*Part one:* how Bitcoin was born. In 2008, the financial system almost collapsed. Weeks later, a stranger published *nine pages* that changed money forever.",
  },
  {
    id: 2,
    audio: "assets/btc1-en-2.wav",
    audioSec: 8.011,
    visual: "crisis",
    highlight: "",
    caption:
      "September 2008. *Lehman Brothers collapses.* Banks that gambled with other people's money get rescued with taxpayer cash. Trust is destroyed.",
  },
  {
    id: 3,
    audio: "assets/btc1-en-3.wav",
    audioSec: 9.346,
    visual: "whitepaper",
    highlight: "",
    caption:
      "On October 31st, 2008, someone called *Satoshi Nakamoto* emailed a cryptography mailing list. The subject: *Bitcoin, a peer-to-peer electronic cash system.*",
  },
  {
    id: 4,
    audio: "assets/btc1-en-4.wav",
    audioSec: 7.465,
    visual: "ledger",
    highlight: "",
    caption:
      "The idea was radical. Money with *no bank, no government, no middleman.* Just one shared ledger that thousands of computers check at the same time.",
  },
  {
    id: 5,
    audio: "assets/btc1-en-5.wav",
    audioSec: 8.475,
    visual: "genesis",
    highlight: "",
    caption:
      "On January 3rd, 2009, Satoshi mined the *very first block.* Hidden inside it was a newspaper headline: *Chancellor on brink of second bailout for banks.*",
  },
  {
    id: 6,
    audio: "assets/btc1-en-6.wav",
    audioSec: 6.316,
    visual: "firsttx",
    highlight: "",
    caption:
      "Nine days later came the *first Bitcoin transaction ever.* Satoshi sent 10 coins to a programmer named *Hal Finney.*",
  },
  {
    id: 7,
    audio: "assets/btc1-en-7.wav",
    audioSec: 8.568,
    visual: "pizza",
    highlight: "",
    caption:
      "In May 2010, Laszlo Hanyecz paid *10,000 Bitcoin* for two pizzas. *$41* back then. Today, the most expensive meal in history.",
  },
  {
    id: 8,
    audio: "assets/btc1-en-8.wav",
    audioSec: 6.954,
    visual: "vanish",
    highlight: "",
    caption:
      "Then, in 2011, *Satoshi vanished.* He left behind roughly *1 million Bitcoin* that have never moved. Not a single coin.",
  },
  {
    id: 9,
    audio: "assets/btc1-en-9.wav",
    audioSec: 5.596,
    visual: "growth",
    highlight: "",
    caption: "From nine pages and zero dollars, Bitcoin grew into a *trillion dollar asset* in just 16 years.",
  },
  {
    id: 10,
    audio: "assets/btc1-en-10.wav",
    audioSec: 3.75,
    visual: "btccoin",
    highlight: "PART 2",
    sub: "how Bitcoin actually works",
    caption: "Part two: how Bitcoin actually works. *Follow so you don't miss it.*",
  },
];

export const TOTAL_FRAMES_BTC1 = totalFrames(SCENES_BTC1, TAIL_BTC1);
