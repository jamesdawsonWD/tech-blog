export const MAP_COLS = 16;
export const MAP_ROWS = 6;
export const TILE_SIZE = 32;

// Ground tile variants (indices into the GROUND_TILES array).
// 0 = common dirt, higher = rarer patches.
export const GROUND_TILES = [
  "/sprites/tiles/ground_38.png",
  "/sprites/tiles/ground_01.png",
  "/sprites/tiles/ground_02.png",
  "/sprites/tiles/ground_03.png",
  "/sprites/tiles/ground_04.png",
  "/sprites/tiles/ground_05.png",
  "/sprites/tiles/ground_11.png",
  "/sprites/tiles/ground_18.png",
  "/sprites/tiles/ground_20.png",
  "/sprites/tiles/ground_27.png",
  "/sprites/tiles/ground_24.png",
  "/sprites/tiles/ground_43.png",
  "/sprites/tiles/ground_44.png",
];

/**
 * Ground tile legend (from art notes):
 * - ground_01: full ground tile
 * - ground_02: ground with bottom grass border
 * - ground_03: ground with bottom grass border (variant 2)
 * - ground_04: ground with bottom grass border (variant 3)
 * - ground_05: graded bottom-left corner with ground (corner round-off)
 * - ground_24: ground with grass on top and bottom-right
 * - ground_38: full grass tile
 * - ground_43: ground with grass border on left, right, and bottom
 * - ground_44: ground with grass border on left, right, and bottom
 */

export interface ObstacleDef {
  src: string;
  /** Width/height in pixels of the source image */
  w: number;
  h: number;
}

export const OBSTACLE_DEFS: Record<string, ObstacleDef> = {
  treeBig: { src: "/sprites/objects/tree-big.png", w: 66, h: 77 },
  treeSmall: { src: "/sprites/objects/tree-small.png", w: 29, h: 26 },
  bush1: { src: "/sprites/objects/bush-1.png", w: 26, h: 23 },
  bush2: { src: "/sprites/objects/bush-2.png", w: 39, h: 25 },
  tentMain: { src: "/sprites/objects/tent-main.png", w: 36, h: 51 },
  logH: { src: "/sprites/objects/log-h.png", w: 33, h: 32 },
  rockLarge: { src: "/sprites/objects/rock-large.png", w: 30, h: 18 },
};

export interface Obstacle {
  kind: keyof typeof OBSTACLE_DEFS;
  col: number;
  row: number;
}

// Hand-placed obstacles. Each blocks its cell for pathfinding.
export const OBSTACLES: Obstacle[] = [
  { kind: "treeBig", col: 2, row: 2 },
  { kind: "treeBig", col: 8, row: 1 },
  { kind: "treeBig", col: 13, row: 3 },
  { kind: "treeSmall", col: 5, row: 4 },
  { kind: "treeSmall", col: 11, row: 4 },
  { kind: "bush1", col: 0, row: 3 },
  { kind: "bush1", col: 7, row: 5 },
  { kind: "bush2", col: 10, row: 2 },
  { kind: "bush2", col: 15, row: 0 },
  { kind: "bush1", col: 4, row: 0 },
  { kind: "tentMain", col: 1, row: 5 },
  { kind: "logH", col: 12, row: 1 },
  { kind: "rockLarge", col: 3, row: 1 },
  { kind: "rockLarge", col: 9, row: 5 },
];

export interface Cell {
  col: number;
  row: number;
}

export function obstacleFootprint(obs: Obstacle): Cell[] {
  if (obs.kind === "treeBig") {
    return [
      { col: obs.col, row: obs.row },
      { col: obs.col - 1, row: obs.row },
      { col: obs.col + 1, row: obs.row },
      { col: obs.col, row: obs.row - 1 },
    ];
  }
  if (obs.kind === "bush2") {
    return [
      { col: obs.col, row: obs.row },
      { col: obs.col + 1, row: obs.row },
    ];
  }
  if (obs.kind === "tentMain" || obs.kind === "logH") {
    return [
      { col: obs.col, row: obs.row },
      { col: obs.col + 1, row: obs.row },
    ];
  }
  return [{ col: obs.col, row: obs.row }];
}

/** Pre-computed walkability grid. true = walkable. */
export function buildWalkable(): boolean[][] {
  const grid: boolean[][] = [];
  for (let r = 0; r < MAP_ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < MAP_COLS; c++) {
      grid[r][c] = true;
    }
  }
  for (const obs of OBSTACLES) {
    for (const cell of obstacleFootprint(obs)) {
      if (
        cell.col >= 0 &&
        cell.col < MAP_COLS &&
        cell.row >= 0 &&
        cell.row < MAP_ROWS
      ) {
        grid[cell.row][cell.col] = false;
      }
    }
  }
  return grid;
}

export interface GroundTilePick {
  index: number;
  rotationDeg: 0 | 90 | 180 | 270;
}

/**
 * Hand-editable tile classifiers.
 *
 * 0 = full grass
 * 1 = full road
 * 2 = road with grass border on top
 * 3 = road with grass border on right
 * 4 = road with grass border on bottom
 * 5 = road with grass border on left
 * 6 = road corner with grass top-left
 * 7 = road corner with grass top-right
 * 8 = road corner with grass bottom-right
 * 9 = road corner with grass bottom-left
 * 10 = grass tile adjacent to road
 * 11 = road with grass on left+right+bottom (variant A, tile 43)
 * 12 = road with grass on left+right+bottom (variant B, tile 44)
 * 13 = road blend tile (top + bottom-right grass, tile 24)
 */
export const GroundClass = {
  Grass: 0,
  Road: 1,
  RoadBorderGrassTop: 2,
  RoadBorderGrassRight: 3,
  RoadBorderGrassBottom: 4,
  RoadBorderGrassLeft: 5,
  RoadCornerGrassTopLeft: 6,
  RoadCornerGrassTopRight: 7,
  RoadCornerGrassBottomRight: 8,
  RoadCornerGrassBottomLeft: 9,
  GrassNearRoad: 10,
  RoadTriBorderLRBVariantA: 11,
  RoadTriBorderLRBVariantB: 12,
  RoadBlendTopBottomRight: 13,
} as const;

export type GroundClass =
  (typeof GroundClass)[keyof typeof GroundClass];

const G = GroundClass.Grass;
const R = GroundClass.Road;
const RT = GroundClass.RoadBorderGrassTop;
const RR = GroundClass.RoadBorderGrassRight;
const RB = GroundClass.RoadBorderGrassBottom;
const RL = GroundClass.RoadBorderGrassLeft;
const RTL = GroundClass.RoadCornerGrassTopLeft;
const RTR = GroundClass.RoadCornerGrassTopRight;
const RBR = GroundClass.RoadCornerGrassBottomRight;
const RBL = GroundClass.RoadCornerGrassBottomLeft;
const GN = GroundClass.GrassNearRoad;

const TILE_INDEX = {
  GrassFull: 0, // ground_38
  RoadFull: 1, // ground_01
  RoadBorderBottomA: 2, // ground_02
  RoadBorderBottomB: 3, // ground_03
  RoadBorderBottomC: 4, // ground_04
  RoadCornerBottomLeft: 5, // ground_05
  RoadBlendTopBottomRight: 10, // ground_24
  RoadTriLRBVariantA: 11, // ground_43
  RoadTriLRBVariantB: 12, // ground_44
} as const;

function borderVariantIndex(col: number, row: number) {
  const hash = (col * 19 + row * 37) % 3;
  if (hash === 0) return TILE_INDEX.RoadBorderBottomA;
  if (hash === 1) return TILE_INDEX.RoadBorderBottomB;
  return TILE_INDEX.RoadBorderBottomC;
}

function isRoadLike(tileClass: GroundClass | undefined): boolean {
  return (
    tileClass !== undefined &&
    tileClass !== GroundClass.Grass &&
    tileClass !== GroundClass.GrassNearRoad
  );
}

function classAt(col: number, row: number): GroundClass | undefined {
  return GROUND_CLASS_MASK[row]?.[col];
}

function triVariantIndex(col: number, row: number): number {
  return (col + row) % 2 === 0
    ? TILE_INDEX.RoadTriLRBVariantA
    : TILE_INDEX.RoadTriLRBVariantB;
}

function autoPickRoadTile(col: number, row: number): GroundTilePick {
  const topGrass = !isRoadLike(classAt(col, row - 1));
  const rightGrass = !isRoadLike(classAt(col + 1, row));
  const bottomGrass = !isRoadLike(classAt(col, row + 1));
  const leftGrass = !isRoadLike(classAt(col - 1, row));
  const grassCount =
    Number(topGrass) +
    Number(rightGrass) +
    Number(bottomGrass) +
    Number(leftGrass);

  if (grassCount === 0) {
    return { index: TILE_INDEX.RoadFull, rotationDeg: 0 };
  }

  if (grassCount === 1) {
    if (topGrass) return { index: borderVariantIndex(col, row), rotationDeg: 180 };
    if (rightGrass) return { index: borderVariantIndex(col, row), rotationDeg: 270 };
    if (bottomGrass) return { index: borderVariantIndex(col, row), rotationDeg: 0 };
    return { index: borderVariantIndex(col, row), rotationDeg: 90 };
  }

  if (grassCount === 2) {
    if (topGrass && leftGrass) {
      return { index: TILE_INDEX.RoadCornerBottomLeft, rotationDeg: 90 };
    }
    if (topGrass && rightGrass) {
      return { index: TILE_INDEX.RoadCornerBottomLeft, rotationDeg: 180 };
    }
    if (bottomGrass && rightGrass) {
      return { index: TILE_INDEX.RoadCornerBottomLeft, rotationDeg: 270 };
    }
    if (bottomGrass && leftGrass) {
      return { index: TILE_INDEX.RoadCornerBottomLeft, rotationDeg: 0 };
    }
  }

  if (grassCount === 3) {
    const index = triVariantIndex(col, row);
    if (!topGrass) return { index, rotationDeg: 0 };
    if (!rightGrass) return { index, rotationDeg: 270 };
    if (!bottomGrass) return { index, rotationDeg: 180 };
    return { index, rotationDeg: 90 };
  }

  return { index: TILE_INDEX.RoadCornerBottomLeft, rotationDeg: 0 };
}

export const GROUND_CLASS_MASK: GroundClass[][] = [
  [G, G, G, G, G, G, G, GN, RTL, RTR, GN, G, G, G, G, G],
  [GN, GN, GN, GN, GN, GN, GN, GN, RL, RR, GN, GN, GN, GN, GN, GN],
  [RTL, RT, RT, RT, RT, RT, RT, RT, R, R, RT, RT, RT, RT, RT, RTR],
  [GN, GN, RBL, RB, RB, R, R, R, R, R, R, RB, RB, RBR, GN, GN],
  [G, G, GN, GN, GN, RBL, RB, RB, RB, RB, RBR, GN, GN, GN, G, G],
  [G, G, G, G, G, GN, GN, GN, GN, GN, GN, G, G, G, G, G],
];

export function groundTilePick(col: number, row: number): GroundTilePick {
  const tileClass =
    GROUND_CLASS_MASK[row]?.[col] ?? GroundClass.Grass;

  switch (tileClass) {
    case GroundClass.Road:
      return autoPickRoadTile(col, row);
    case GroundClass.RoadBorderGrassTop:
      return { index: borderVariantIndex(col, row), rotationDeg: 180 };
    case GroundClass.RoadBorderGrassRight:
      return { index: borderVariantIndex(col, row), rotationDeg: 270 };
    case GroundClass.RoadBorderGrassBottom:
      return { index: borderVariantIndex(col, row), rotationDeg: 0 };
    case GroundClass.RoadBorderGrassLeft:
      return { index: borderVariantIndex(col, row), rotationDeg: 90 };
    case GroundClass.RoadCornerGrassTopLeft:
      return { index: TILE_INDEX.RoadCornerBottomLeft, rotationDeg: 90 };
    case GroundClass.RoadCornerGrassTopRight:
      return { index: TILE_INDEX.RoadCornerBottomLeft, rotationDeg: 180 };
    case GroundClass.RoadCornerGrassBottomRight:
      return { index: TILE_INDEX.RoadCornerBottomLeft, rotationDeg: 270 };
    case GroundClass.RoadCornerGrassBottomLeft:
      return { index: TILE_INDEX.RoadCornerBottomLeft, rotationDeg: 0 };
    case GroundClass.RoadTriBorderLRBVariantA:
      return { index: TILE_INDEX.RoadTriLRBVariantA, rotationDeg: 0 };
    case GroundClass.RoadTriBorderLRBVariantB:
      return { index: TILE_INDEX.RoadTriLRBVariantB, rotationDeg: 0 };
    case GroundClass.RoadBlendTopBottomRight:
      return { index: TILE_INDEX.RoadBlendTopBottomRight, rotationDeg: 0 };
    case GroundClass.GrassNearRoad:
      return { index: TILE_INDEX.GrassFull, rotationDeg: 0 };
    case GroundClass.Grass:
    default:
      return { index: TILE_INDEX.GrassFull, rotationDeg: 0 };
  }
}
