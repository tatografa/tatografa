import { staticFile } from "remotion";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Quadros extras depois da fala (respiro) e atraso do áudio dentro da cena.
export const TAIL_FRAMES = 10;
export const AUDIO_DELAY = 4;

export const NVIDIA_GREEN = "#76B900";

export type Scene = {
  id: number;
  /** Arquivo de narração em public/assets */
  audio: string;
  /** Duração REAL do áudio em segundos (medida com ffprobe) */
  audioSec: number;
  /** Imagem de fundo em public/assets */
  bg: string;
  /** Texto grande em destaque no centro */
  highlight: string;
  /** Subtítulo menor abaixo do destaque (opcional) */
  sub?: string;
  /** Legenda (o que é falado) exibida na parte de baixo */
  caption: string;
  /** Tipo visual especial */
  kind?: "core3d" | "counter";
  /** Para o contador numérico (kind: 'counter') */
  counterTo?: number;
  counterPrefix?: string;
  counterSuffix?: string;
};

export const SCENES: Scene[] = [
  {
    id: 1,
    audio: "assets/narr-1.mp3",
    audioSec: 9.43,
    bg: "assets/bg-0.jpg",
    highlight: "US$ 4 TRILHÕES",
    sub: "o valor de mercado hoje",
    caption:
      "Em 1993, três engenheiros se juntaram num restaurante pra fundar uma empresa. Hoje, ela vale mais de quatro trilhões de dólares.",
    kind: "core3d",
  },
  {
    id: 2,
    audio: "assets/narr-2.mp3",
    audioSec: 4.78,
    bg: "assets/bg-1.jpg",
    highlight: "NVIDIA",
    sub: "Califórnia, EUA · 1993",
    caption: "O nome? NVIDIA. Nascida na Califórnia, no coração do Vale do Silício.",
  },
  {
    id: 3,
    audio: "assets/narr-3.mp3",
    audioSec: 9.038,
    bg: "assets/bg-2.jpg",
    highlight: "A GPU",
    sub: "as placas de vídeo dos games",
    caption:
      "Ela ficou famosa nos anos noventa, criando as GPUs: as placas de vídeo que dão vida aos videogames.",
  },
  {
    id: 4,
    audio: "assets/narr-4.mp3",
    audioSec: 4.389,
    bg: "assets/bg-3.jpg",
    highlight: "INTELIGÊNCIA\nARTIFICIAL",
    sub: "a virada de chave",
    caption: "Mas a verdadeira revolução veio com a inteligência artificial.",
  },
  {
    id: 5,
    audio: "assets/narr-5.mp3",
    audioSec: 5.433,
    bg: "assets/bg-3.jpg",
    highlight: "O MOTOR DA IA",
    sub: "quase toda IA roda em chips NVIDIA",
    caption: "Hoje, quase toda inteligência artificial do planeta roda em chips da NVIDIA.",
  },
  {
    id: 6,
    audio: "assets/narr-6.mp3",
    audioSec: 5.695,
    bg: "assets/bg-5.jpg",
    highlight: "",
    sub: "de faturamento no último ano",
    caption: "No último ano, a empresa faturou mais de cento e trinta bilhões de dólares.",
    kind: "counter",
    counterPrefix: "US$ ",
    counterTo: 130.5,
    counterSuffix: " BI",
  },
  {
    id: 7,
    audio: "assets/narr-7.mp3",
    audioSec: 5.695,
    bg: "assets/bg-4.jpg",
    highlight: "DATA CENTERS",
    sub: "onde a IA é treinada",
    caption: "A maior parte vem dos data centers que treinam os modelos de inteligência artificial.",
  },
  {
    id: 8,
    audio: "assets/narr-8.mp3",
    audioSec: 7.758,
    bg: "assets/bg-5.jpg",
    highlight: "+36.000",
    sub: "funcionários · a empresa nº 1 do mundo",
    caption: "Com mais de trinta e seis mil funcionários, a NVIDIA se tornou a empresa mais valiosa do mundo.",
  },
  {
    id: 9,
    audio: "assets/narr-9.mp3",
    audioSec: 7.393,
    bg: "assets/bg-0.jpg",
    highlight: "PARTE 2\nEM BREVE",
    sub: "segue aqui 👊",
    caption: "De uma placa de videogame ao cérebro da inteligência artificial. Segue aqui pra parte dois!",
    kind: "core3d",
  },
];

export const sceneFrames = (s: Scene) => Math.round(s.audioSec * FPS) + TAIL_FRAMES;

export const TOTAL_FRAMES = SCENES.reduce((acc, s) => acc + sceneFrames(s), 0);

export const musicFile = () => staticFile("assets/musica.mp3");
export const sceneAudio = (s: Scene) => staticFile(s.audio);
export const sceneBg = (s: Scene) => staticFile(s.bg);
