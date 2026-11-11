import { Scene, totalFrames } from "./data";

// Parte 2: ritmo um pouco mais rápido (respiro menor entre falas).
export const TAIL_P2 = 12;

export const SCENES_P2: Scene[] = [
  {
    id: 1,
    audio: "assets/narr2-en-1.wav",
    audioSec: 4.075,
    visual: "core",
    highlight: "PART 2",
    sub: "this is where it gets wild",
    caption: "This is part two of the NVIDIA story. And trust me, this is where it gets wild.",
  },
  {
    id: 2,
    audio: "assets/narr2-en-2.wav",
    audioSec: 6.188,
    visual: "countdown",
    highlight: "30 DAYS",
    sub: "from bankruptcy · 1996",
    caption: "In 1996, NVIDIA was just thirty days away from going bankrupt. Its very first chip had flopped.",
  },
  {
    id: 3,
    audio: "assets/narr2-en-3.wav",
    audioSec: 5.608,
    visual: "rain",
    highlight: "",
    sub: "RIVA 128 · units sold in 4 months",
    caption: "Then came the RIVA 128. It sold a million units in just four months, and saved the company.",
    counterTo: 1000000,
    counterDecimals: 0,
  },
  {
    id: 4,
    audio: "assets/narr2-en-4.wav",
    audioSec: 7.059,
    visual: "code",
    highlight: "CUDA",
    sub: "2006 · GPUs beyond games",
    caption:
      "In 2006, NVIDIA made its smartest bet ever: CUDA. Software that let anyone use GPUs for much more than games.",
  },
  {
    id: 5,
    audio: "assets/narr2-en-5.wav",
    audioSec: 7.488,
    visual: "neural",
    highlight: "ALEXNET",
    sub: "2012 · trained on 2 NVIDIA GPUs",
    caption:
      "In 2012, researchers trained a breakthrough AI called AlexNet on just two NVIDIA graphics cards. The AI era had begun.",
  },
  {
    id: 6,
    audio: "assets/narr2-en-6.wav",
    audioSec: 6.792,
    visual: "chat",
    highlight: "2022",
    sub: "ChatGPT sparks the AI race",
    caption: "Then, in 2022, ChatGPT arrived, and every tech giant on the planet raced to buy NVIDIA chips.",
  },
  {
    id: 7,
    audio: "assets/narr2-en-7.wav",
    audioSec: 6.037,
    visual: "datacenter",
    highlight: "TENS OF\nTHOUSANDS",
    sub: "of dollars per AI chip",
    caption:
      "A single top AI chip can cost tens of thousands of dollars, and companies are buying them by the hundreds of thousands.",
  },
  {
    id: 8,
    audio: "assets/narr2-en-8.wav",
    audioSec: 5.828,
    visual: "spotlight",
    highlight: "JENSEN HUANG",
    sub: "co-founder & CEO since 1993",
    caption: "Leading it all since day one is co-founder and CEO Jensen Huang, famous for his black leather jacket.",
  },
  {
    id: 9,
    audio: "assets/narr2-en-9.wav",
    audioSec: 5.55,
    visual: "aiflow",
    label: "CUDA",
    highlight: "THE MOAT",
    sub: "millions of developers locked in",
    caption: "But the real secret isn't just hardware. It's CUDA: millions of developers locked into NVIDIA's ecosystem.",
  },
  {
    id: 10,
    audio: "assets/narr2-en-10.wav",
    audioSec: 6.85,
    visual: "cta",
    highlight: "WOULD YOU\nHAVE BET?",
    sub: "comment & follow 👊",
    caption:
      "So, would you have bet on NVIDIA back in 1996? Tell me in the comments, and follow for more company stories.",
  },
];

export const TOTAL_FRAMES_P2 = totalFrames(SCENES_P2, TAIL_P2);
