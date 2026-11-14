import { Scene, totalFrames } from "./data";

export const TAIL_P4 = 12;

/** Parte 4: o homem por trás da NVIDIA — como Jensen Huang comanda a empresa. */
export const SCENES_P4: Scene[] = [
  {
    id: 1,
    audio: "assets/narr4-en-1.wav",
    audioSec: 7.221,
    visual: "core",
    highlight: "PART 4",
    sub: "the man behind NVIDIA",
    caption: "*Part four:* the man behind NVIDIA. How Jensen Huang runs a $4 trillion company, and why he says it is always *30 days from dying*.",
  },
  {
    id: 2,
    audio: "assets/narr4-en-2.wav",
    audioSec: 7.558,
    visual: "timeline",
    highlight: "",
    caption: "Born in Taiwan in 1963, he moved to America as a kid. As a teenager, he *washed dishes* and cleaned tables at Denny's.",
  },
  {
    id: 3,
    audio: "assets/narr4-en-3.wav",
    audioSec: 7.512,
    visual: "napkin",
    highlight: "",
    caption: "Thirty years later, in 1993, he co-founded NVIDIA at a *Denny's booth* in San Jose. The idea was sketched over coffee.",
  },
  {
    id: 4,
    audio: "assets/narr4-en-4.wav",
    audioSec: 6.06,
    visual: "orgchart",
    highlight: "",
    caption: "His management style is wild. Around *60 people* report directly to him. And he refuses to do *one-on-one meetings*.",
  },
  {
    id: 5,
    audio: "assets/narr4-en-5.wav",
    audioSec: 5.666,
    visual: "inbox",
    highlight: "",
    caption: "Instead, any employee can email him the *top five things* on their mind. He reads hundreds of these every week.",
  },
  {
    id: 6,
    audio: "assets/narr4-en-6.wav",
    audioSec: 4.865,
    visual: "quote",
    highlight: "",
    caption: "There is no five-year plan. His motto: *our company is always 30 days from going out of business.*",
  },
  {
    id: 7,
    audio: "assets/narr4-en-7.wav",
    audioSec: 9.102,
    visual: "deal",
    highlight: "",
    caption: "He bets big on deals, too. In 2020 he bought *Mellanox for $7 billion*. Today, networking is a *$10B+ a year* business inside NVIDIA.",
  },
  {
    id: 8,
    audio: "assets/narr4-en-8.wav",
    audioSec: 5.909,
    visual: "blocked",
    highlight: "",
    caption: "In 2020 he also tried to buy *Arm for $40 billion*. Two years later, regulators *killed the deal*.",
  },
  {
    id: 9,
    audio: "assets/narr4-en-9.wav",
    audioSec: 8.057,
    visual: "spotlight",
    highlight: "$100B+",
    sub: "net worth · owns ~3.5% of NVIDIA",
    caption: "Today he owns about *3.5%* of NVIDIA, worth well over *$100 billion*. And yes, he has the company logo *tattooed on his arm*.",
  },
  {
    id: 10,
    audio: "assets/narr4-en-10.wav",
    audioSec: 3.262,
    visual: "cta",
    highlight: "PART 5?",
    sub: "you decide · comment & follow",
    caption: "Part five? Tell me which company you want next, and *follow for more*.",
  },
];

export const TOTAL_FRAMES_P4 = totalFrames(SCENES_P4, TAIL_P4);
