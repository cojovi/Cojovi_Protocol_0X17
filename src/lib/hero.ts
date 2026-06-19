export const FRAME_COUNT = 169;

export const framePath = (n: number) =>
  `/frames/frame_${String(n).padStart(4, "0")}.jpg`;

export type Dialogue = {
  id: string;
  show: number;
  hide: number;
  quote: string;
  speaker: string;
  film: string;
};

export const DIALOGUES: Dialogue[] = [
  {
    id: "d1",
    show: 0.1,
    hide: 0.3,
    quote: "Every system starts with a single pulse of energy.",
    speaker: "Protocol 0X17",
    film: "SYS.LOG — 001",
  },
  {
    id: "d2",
    show: 0.35,
    hide: 0.55,
    quote: "Binary in. Signal out. The stream never lies.",
    speaker: "Operator",
    film: "ARCHIVE — 017",
  },
  {
    id: "d3",
    show: 0.6,
    hide: 0.8,
    quote: "Hold the line. The core is still burning.",
    speaker: "Protocol 0X17",
    film: "LIVE FEED",
  },
];

export const HERO_TEXT_FADE_END = 0.08;

/** Cover-crop focal point when the frame overflows the canvas (0 = left/top, 1 = right/bottom). */
export const FRAME_FOCUS_X = 0.58;
export const FRAME_FOCUS_X_MOBILE = 0.65;
export const FRAME_FOCUS_Y = 0.5;
export const FRAME_FOCUS_Y_MOBILE = 0.44;
export const FRAME_MOBILE_SCALE = 1.3;
