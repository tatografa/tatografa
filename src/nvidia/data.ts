import { staticFile } from "remotion";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const TAIL_FRAMES = 18; // respiro após a fala
export const OUTRO_EXTRA = 36; // hold extra na última cena
export const AUDIO_DELAY = 5;

export const NVIDIA_GREEN = "#76B900";

export type VisualKind =
  | "core"
  | "map"
  | "gpu"
  | "neural"
  | "aiflow"
  | "chart"
  | "datacenter"
  | "world"
  | "cta"
  | "countdown"
  | "rain"
  | "code"
  | "chat"
  | "spotlight";

export type Scene = {
  id: number;
  audio: string;
  audioSec: number;
  visual: VisualKind;
  highlight: string;
  sub?: string;
  caption: string;
  counterTo?: number;
  counterPrefix?: string;
  counterSuffix?: string;
  /** casas decimais do contador (padrão 1) */
  counterDecimals?: number;
  /** rótulo do chip no visual "aiflow" (padrão "AI") */
  label?: string;
};

export const SCENES: Scene[] = [
  {
    id: 1,
    audio: "assets/narr-en-1.wav",
    audioSec: 9.172,
    visual: "core",
    highlight: "$4 TRILLION",
    sub: "what it is worth today",
    caption:
      "In 1993, three engineers met at a roadside diner in California and sketched out a company. Three decades later, it is worth over four trillion dollars.",
  },
  {
    id: 2,
    audio: "assets/narr-en-2.wav",
    audioSec: 4.354,
    visual: "map",
    highlight: "NVIDIA",
    sub: "Santa Clara, California · 1993",
    caption: "The name? NVIDIA. Born in Santa Clara, right in the heart of Silicon Valley.",
  },
  {
    id: 3,
    audio: "assets/narr-en-3.wav",
    audioSec: 5.898,
    visual: "gpu",
    highlight: "THE GPU",
    sub: "the chip behind every game",
    caption:
      "In the nineties, it became famous for inventing the GPU: the graphics chip that brought video games to life.",
  },
  {
    id: 4,
    audio: "assets/narr-en-4.wav",
    audioSec: 3.274,
    visual: "neural",
    highlight: "A.I.",
    sub: "the real revolution",
    caption: "But the real revolution came later, with artificial intelligence.",
  },
  {
    id: 5,
    audio: "assets/narr-en-5.wav",
    audioSec: 5.097,
    visual: "aiflow",
    highlight: "THE ENGINE OF AI",
    sub: "nearly all AI runs on NVIDIA",
    caption: "Today, almost all of the world's AI is trained and powered by NVIDIA chips.",
  },
  {
    id: 6,
    audio: "assets/narr-en-6.wav",
    audioSec: 5.12,
    visual: "chart",
    highlight: "",
    sub: "revenue last year",
    caption: "Last year alone, the company pulled in more than one hundred and thirty billion dollars in revenue.",
    counterPrefix: "$",
    counterTo: 130.5,
    counterSuffix: "B",
  },
  {
    id: 7,
    audio: "assets/narr-en-7.wav",
    audioSec: 4.435,
    visual: "datacenter",
    highlight: "DATA CENTERS",
    sub: "where AI is trained",
    caption: "And most of that comes from data centers: the giant computers that train AI models.",
  },
  {
    id: 8,
    audio: "assets/narr-en-8.wav",
    audioSec: 4.911,
    visual: "world",
    highlight: "+36,000",
    sub: "employees · the #1 company on Earth",
    caption: "With more than thirty-six thousand employees, NVIDIA became the most valuable company on Earth.",
  },
  {
    id: 9,
    audio: "assets/narr-en-9.wav",
    audioSec: 5.132,
    visual: "cta",
    highlight: "PART 2\nSOON",
    sub: "follow for more 👊",
    caption: "From a simple gaming card, to the brain of modern artificial intelligence. Follow for part two!",
  },
];

/** Duração de uma cena em quadros: fala + respiro (+ hold extra se for a última). */
export const sceneFrames = (s: Scene, isLast: boolean, tail: number = TAIL_FRAMES) =>
  Math.round(s.audioSec * FPS) + tail + (isLast ? OUTRO_EXTRA : 0);

export const totalFrames = (scenes: Scene[], tail: number = TAIL_FRAMES) =>
  scenes.reduce((acc, s, i) => acc + sceneFrames(s, i === scenes.length - 1, tail), 0);

export const TOTAL_FRAMES = totalFrames(SCENES);

export const musicFile = () => staticFile("assets/musica.mp3");
export const sceneAudio = (s: Scene) => staticFile(s.audio);
