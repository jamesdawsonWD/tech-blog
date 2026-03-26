export const FRAME_W = 32;
export const FRAME_H = 32;
export const SHEET_COLS = 4;
export const SHEET_ROWS = 13;

export const Dir = {
  Down: 0,
  Left: 1,
  Right: 2,
  Up: 3,
} as const;

export type Dir = (typeof Dir)[keyof typeof Dir];

const DIR_ROW_START: Record<Dir, number> = {
  [Dir.Down]: 0,
  // These sprite sheets use Right before Left in row groups.
  [Dir.Right]: 4,
  [Dir.Left]: 8,
  [Dir.Up]: 12,
};

export interface CharacterDef {
  id: string;
  label: string;
  src: string;
}

export const CHARACTERS: CharacterDef[] = [
  { id: "cat-orange", label: "Orange Cat", src: "/sprites/cat-orange.png" },
  { id: "cat-gray", label: "Gray Cat", src: "/sprites/cat-gray.png" },
  { id: "fox", label: "Fox", src: "/sprites/fox.png" },
  { id: "raccoon", label: "Raccoon", src: "/sprites/raccoon.png" },
  { id: "bird-blue", label: "Blue Bird", src: "/sprites/bird-blue.png" },
];

/** Returns the source rect {sx, sy, sw, sh} for a given direction + frame. */
export function frameSrc(dir: Dir, frame: number) {
  const col = frame % SHEET_COLS;
  // Directions are grouped by row bands; animation advances via columns.
  const row = DIR_ROW_START[dir];
  return {
    sx: col * FRAME_W,
    sy: row * FRAME_H,
    sw: FRAME_W,
    sh: FRAME_H,
  };
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
