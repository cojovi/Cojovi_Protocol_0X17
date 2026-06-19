export const CINE_FRAME_COUNT = 169;

export const cineFramePath = (n: number) =>
  `/frames2/frame_${String(n).padStart(4, "0")}.jpg`;

export type Beat = {
  id: string;
  show: number;
  hide: number;
  label: string;
  quote: string;
  speaker: string;
  film: string;
};

export const BEATS: Beat[] = [
  {
    id: "b1",
    show: 0.1,
    hide: 0.3,
    label: "01 — Deploy",
    quote: "Energy core engaged. Ground smoke clearing.",
    speaker: "Protocol 0X17",
    film: "ARCHIVE — 002",
  },
  {
    id: "b2",
    show: 0.35,
    hide: 0.55,
    label: "02 — Pulse",
    quote: "Binary surge at maximum. The hand holds the line.",
    speaker: "Operator",
    film: "PULSE LOG — 017",
  },
  {
    id: "b3",
    show: 0.6,
    hide: 0.8,
    label: "03 — Dissolve",
    quote: "Frame logged. Stream fading to archive grey.",
    speaker: "Protocol 0X17",
    film: "FINAL FRAME",
  },
];

export const CINE_INTRO_FADE_END = 0.08;

/** Cover-crop focal point when the frame overflows the canvas (0 = left/top, 1 = right/bottom). */
export const CINE_FRAME_FOCUS_X = 0.5;
export const CINE_FRAME_FOCUS_X_MOBILE = 0.5;
export const CINE_FRAME_FOCUS_Y = 0.48;
export const CINE_FRAME_FOCUS_Y_MOBILE = 0.44;
export const CINE_FRAME_MOBILE_SCALE = 1.3;
