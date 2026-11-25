import { Scene, totalFrames } from "./data";

export const TAIL_P5 = 12;

/** Parte 5: a saída e a volta de Jensen Huang (nov/2026). */
export const SCENES_P5: Scene[] = [
  {
    id: 1,
    audio: "assets/narr5-en-1.wav",
    audioSec: 6.327,
    visual: "core",
    highlight: "PART 5",
    sub: "the exit and the return",
    caption: "*Part five:* the exit and the return. Jensen Huang quit NVIDIA, and *eleven days later*, he was back.",
  },
  {
    id: 2,
    audio: "assets/narr5-en-2.wav",
    audioSec: 7.941,
    visual: "filing",
    highlight: "",
    caption: "On November 12, NVIDIA announced Jensen Huang had *resigned as CEO*, effective immediately. After *33 years*, the founder was out.",
  },
  {
    id: 3,
    audio: "assets/narr5-en-3.wav",
    audioSec: 6.687,
    visual: "headlines",
    highlight: "",
    caption: "NVIDIA gave *no official reason*. But it followed reports of affairs, including one Huang admitted to, with an *alleged Chinese spy*.",
  },
  {
    id: 4,
    audio: "assets/narr5-en-4.wav",
    audioSec: 7.256,
    visual: "interim",
    highlight: "",
    caption: "CFO *Colette Kress* became interim CEO. And for the first time ever, the board named a separate chairman, *Harvey Jones*.",
  },
  {
    id: 5,
    audio: "assets/narr5-en-5.wav",
    audioSec: 7.152,
    visual: "plunge",
    highlight: "",
    caption: "Investors panicked. Within a week, the stock fell as much as *19%*, wiping out more than *$850 billion*.",
  },
  {
    id: 6,
    audio: "assets/narr5-en-6.wav",
    audioSec: 5.445,
    visual: "noreturn",
    highlight: "",
    caption: "On November 17, the chairman said the board *did not intend to reinstate him*. It looked like the end of an era.",
  },
  {
    id: 7,
    audio: "assets/narr5-en-7.wav",
    audioSec: 7.419,
    visual: "pressure",
    highlight: "",
    caption: "Then *Washington stepped in*. President Trump said he pushed NVIDIA's board to bring Huang back, and said his return posed *no security risk*.",
  },
  {
    id: 8,
    audio: "assets/narr5-en-8.wav",
    audioSec: 6.954,
    visual: "reinstated",
    highlight: "",
    caption: "On November 23, the board voted *unanimously* to reinstate him as CEO. *Eleven days* after he left.",
  },
  {
    id: 9,
    audio: "assets/narr5-en-9.wav",
    audioSec: 4.876,
    visual: "surge",
    highlight: "",
    caption: "The stock jumped *31% in a single day*. NVIDIA's best day since *2003*.",
  },
  {
    id: 10,
    audio: "assets/narr5-en-10.wav",
    audioSec: 6.606,
    visual: "probe",
    highlight: "",
    caption: "But it's not over. An *independent committee* is still investigating, and *California's attorney general* is probing NVIDIA too.",
  },
  {
    id: 11,
    audio: "assets/narr5-en-11.wav",
    audioSec: 3.204,
    visual: "cta",
    highlight: "BACK",
    sub: "should he have returned?",
    caption: "Should he have come back? *Tell me in the comments*, and follow for more.",
  },
];

export const TOTAL_FRAMES_P5 = totalFrames(SCENES_P5, TAIL_P5);
