import {
  CHARACTERS,
  type CharacterDef,
  Dir,
  FRAME_H,
  FRAME_W,
  frameSrc,
  loadImage,
} from "./sprites";
import {
  MAP_COLS,
  MAP_ROWS,
  TILE_SIZE,
  GROUND_TILES,
  OBSTACLES,
  OBSTACLE_DEFS,
  buildWalkable,
  groundTilePick,
} from "./map";

// ── Constants ────────────────────────────────────────────────────────────

const CANVAS_W = MAP_COLS * TILE_SIZE;
const CANVAS_H = MAP_ROWS * TILE_SIZE;
const SCALE = 2;
const MOVE_INTERVAL = 620;
const ANIM_INTERVAL = 150;
const CLICK_HIT_PADDING = 24;
const DIR_LIST = [Dir.Down, Dir.Left, Dir.Right, Dir.Up];

// ── Types ────────────────────────────────────────────────────────────────

interface Character {
  def: CharacterDef;
  sheet: HTMLImageElement;
  col: number;
  row: number;
  prevCol: number;
  prevRow: number;
  dir: Dir;
  frame: number;
  moveTimer: number;
  moving: boolean;
  path: Array<{ col: number; row: number }>;
  pathCursor: number;
  stallTicks: number;
}

// ── Connectivity helper ──────────────────────────────────────────────────

function largestConnectedRegion(
  cells: Array<{ col: number; row: number }>,
): Array<{ col: number; row: number }> {
  const set = new Set(cells.map((c) => `${c.col},${c.row}`));
  const visited = new Set<string>();
  let best: Array<{ col: number; row: number }> = [];

  for (const cell of cells) {
    const k = `${cell.col},${cell.row}`;
    if (visited.has(k)) continue;

    const component: Array<{ col: number; row: number }> = [];
    const queue = [cell];
    visited.add(k);

    while (queue.length > 0) {
      const cur = queue.shift()!;
      component.push(cur);
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nk = `${cur.col + dc},${cur.row + dr}`;
        if (set.has(nk) && !visited.has(nk)) {
          visited.add(nk);
          queue.push({ col: cur.col + dc, row: cur.row + dr });
        }
      }
    }

    if (component.length > best.length) best = component;
  }

  return best;
}

// ── Game factory ─────────────────────────────────────────────────────────

export async function createGame(
  canvas: HTMLCanvasElement,
  targetPanel: HTMLDivElement,
  options?: {
    mode?: "default" | "captcha";
    onFoundChange?: (value: boolean) => void;
    onWrongGuess?: () => void;
  },
) {
  const edgeInset = options?.mode === "captcha" ? 1 : 0;
  const ctx = canvas.getContext("2d")!;
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  canvas.style.width = `${CANVAS_W * SCALE}px`;
  canvas.style.height = `${CANVAS_H * SCALE}px`;
  canvas.style.imageRendering = "pixelated";
  ctx.imageSmoothingEnabled = false;

  // ── Load images ──────────────────────────────────────────────────────

  const groundImgs = await Promise.all(GROUND_TILES.map(loadImage));

  const obstacleImgs: Record<string, HTMLImageElement> = {};
  for (const [key, def] of Object.entries(OBSTACLE_DEFS)) {
    obstacleImgs[key] = await loadImage(def.src);
  }

  const sortedObstacles = [...OBSTACLES].sort((a, b) => {
    const ay = a.row * TILE_SIZE + TILE_SIZE;
    const by = b.row * TILE_SIZE + TILE_SIZE;
    return ay - by;
  });

  const sheets: Map<string, HTMLImageElement> = new Map();
  for (const c of CHARACTERS) {
    sheets.set(c.id, await loadImage(c.src));
  }

  // ── Pre-render ground to offscreen canvas ────────────────────────────

  const groundCanvas = document.createElement("canvas");
  groundCanvas.width = CANVAS_W;
  groundCanvas.height = CANVAS_H;
  const gctx = groundCanvas.getContext("2d")!;
  gctx.imageSmoothingEnabled = false;

  function drawGroundTile(
    target: CanvasRenderingContext2D,
    img: HTMLImageElement,
    dx: number,
    dy: number,
    rotationDeg: 0 | 90 | 180 | 270,
  ) {
    if (rotationDeg === 0) {
      target.drawImage(img, dx, dy);
      return;
    }
    target.save();
    target.translate(dx + TILE_SIZE / 2, dy + TILE_SIZE / 2);
    target.rotate((rotationDeg * Math.PI) / 180);
    target.drawImage(img, -TILE_SIZE / 2, -TILE_SIZE / 2);
    target.restore();
  }

  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      const pick = groundTilePick(c, r);
      drawGroundTile(
        gctx,
        groundImgs[pick.index],
        c * TILE_SIZE,
        r * TILE_SIZE,
        pick.rotationDeg,
      );
    }
  }

  // ── Walkability ──────────────────────────────────────────────────────

  const walkable = buildWalkable();

  const allWalkable: Array<{ col: number; row: number }> = [];
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      if (
        walkable[row][col] &&
        col >= edgeInset &&
        col < MAP_COLS - edgeInset &&
        row >= edgeInset &&
        row < MAP_ROWS - edgeInset
      ) {
        allWalkable.push({ col, row });
      }
    }
  }

  const walkableCells = largestConnectedRegion(allWalkable);

  function isFree(col: number, row: number, exclude?: Character): boolean {
    if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return false;
    if (
      col < edgeInset ||
      col >= MAP_COLS - edgeInset ||
      row < edgeInset ||
      row >= MAP_ROWS - edgeInset
    ) {
      return false;
    }
    if (!walkable[row][col]) return false;
    for (const ch of characters) {
      if (ch === exclude) continue;
      if (ch.col === col && ch.row === row) return false;
    }
    return true;
  }

  function key(col: number, row: number) {
    return `${col},${row}`;
  }

  function neighbors(col: number, row: number) {
    return [
      { col, row: row - 1 },
      { col: col + 1, row },
      { col, row: row + 1 },
      { col: col - 1, row },
    ].filter(
      (p) =>
        p.col >= 0 &&
        p.col < MAP_COLS &&
        p.row >= 0 &&
        p.row < MAP_ROWS &&
        p.col >= edgeInset &&
        p.col < MAP_COLS - edgeInset &&
        p.row >= edgeInset &&
        p.row < MAP_ROWS - edgeInset &&
        walkable[p.row][p.col],
    );
  }

  function bfsPath(
    start: { col: number; row: number },
    goal: { col: number; row: number },
  ) {
    if (start.col === goal.col && start.row === goal.row) return [start];
    const queue = [start];
    const parent = new Map<string, string>();
    const seen = new Set<string>([key(start.col, start.row)]);

    while (queue.length > 0) {
      const cur = queue.shift()!;
      for (const n of neighbors(cur.col, cur.row)) {
        const nk = key(n.col, n.row);
        if (seen.has(nk)) continue;
        seen.add(nk);
        parent.set(nk, key(cur.col, cur.row));
        if (n.col === goal.col && n.row === goal.row) {
          const path = [goal];
          let curKey = nk;
          while (parent.has(curKey)) {
            const p = parent.get(curKey)!;
            const [pc, pr] = p.split(",").map(Number);
            path.push({ col: pc, row: pr });
            if (pc === start.col && pr === start.row) break;
            curKey = p;
          }
          return path.reverse();
        }
        queue.push(n);
      }
    }
    return null;
  }

  function makeLoopPath(start: { col: number; row: number }) {
    const minLen = 12;
    for (let attempt = 0; attempt < 30; attempt++) {
      const waypoints = [start];
      const waypointCount = 3 + Math.floor(Math.random() * 3);
      while (waypoints.length < waypointCount + 1) {
        const candidate =
          walkableCells[Math.floor(Math.random() * walkableCells.length)];
        const dist =
          Math.abs(candidate.col - start.col) + Math.abs(candidate.row - start.row);
        if (dist >= 4) waypoints.push(candidate);
      }

      const cycleTargets = [...waypoints.slice(1), start];
      let ok = true;
      let full: Array<{ col: number; row: number }> = [start];
      let cur = start;
      for (const target of cycleTargets) {
        const seg = bfsPath(cur, target);
        if (!seg || seg.length < 2) {
          ok = false;
          break;
        }
        full = full.concat(seg.slice(1));
        cur = target;
      }
      if (!ok) continue;

      // Remove adjacent duplicates and keep a meaningful loop.
      const loop: Array<{ col: number; row: number }> = [];
      for (const p of full) {
        const last = loop[loop.length - 1];
        if (!last || last.col !== p.col || last.row !== p.row) loop.push(p);
      }
      // Collapse A->B->A oscillation patterns that can create visible ping-ponging.
      let changed = true;
      while (changed && loop.length >= 3) {
        changed = false;
        for (let i = 1; i < loop.length - 1; i++) {
          const a = loop[i - 1];
          const c = loop[i + 1];
          if (a.col === c.col && a.row === c.row) {
            loop.splice(i, 1);
            changed = true;
            break;
          }
        }
      }
      if (loop.length >= minLen) return loop;
    }

    // Fallback: local short patrol around start.
    const n = neighbors(start.col, start.row);
    return [start, ...n, start];
  }

  function dirFromStep(dc: number, dr: number): Dir {
    if (dr < 0) return Dir.Up;
    if (dr > 0) return Dir.Down;
    if (dc < 0) return Dir.Left;
    return Dir.Right;
  }

  // ── Spawn characters ─────────────────────────────────────────────────

  const characters: Character[] = [];

  function spawnCharacters() {
    characters.length = 0;
    const used = new Set<string>();

    const midRow = Math.floor(MAP_ROWS / 2);
    const midCol = Math.floor(MAP_COLS / 2);
    const count = CHARACTERS.length;
    const startCol = midCol - Math.floor(count / 2);

    for (let i = 0; i < CHARACTERS.length; i++) {
      const def = CHARACTERS[i];
      let col = startCol + i;
      let row = midRow;

      if (!walkable[row]?.[col] || used.has(`${col},${row}`)) {
        const sorted = [...walkableCells].sort(
          (a, b) =>
            Math.abs(a.col - (startCol + i)) +
            Math.abs(a.row - midRow) -
            (Math.abs(b.col - (startCol + i)) + Math.abs(b.row - midRow)),
        );
        const fallback = sorted.find((c) => !used.has(`${c.col},${c.row}`));
        if (fallback) {
          col = fallback.col;
          row = fallback.row;
        }
      }

      used.add(`${col},${row}`);
      characters.push({
        def,
        sheet: sheets.get(def.id)!,
        col,
        row,
        prevCol: col,
        prevRow: row,
        dir: DIR_LIST[Math.floor(Math.random() * 4)],
        frame: 0,
        moveTimer: Math.random() * MOVE_INTERVAL,
        moving: false,
        path: [],
        pathCursor: 0,
        stallTicks: 0,
      });
    }

    for (const ch of characters) {
      ch.path = makeLoopPath({ col: ch.col, row: ch.row });
      ch.pathCursor = 0;
    }
  }

  // ── Target selection ─────────────────────────────────────────────────

  let targetIdx = 0;
  let found = false;
  let wrongFlash = 0;

  function pickTarget() {
    targetIdx = Math.floor(Math.random() * CHARACTERS.length);
    found = false;
    wrongFlash = 0;
    options?.onFoundChange?.(false);
    renderTargetPanel();
  }

  // ── Target panel (HTML below canvas) ─────────────────────────────────

  let targetAnimFrame = 0;

  function renderTargetPanel() {
    const def = CHARACTERS[targetIdx];
    targetPanel.innerHTML = "";
    if (options?.mode === "captcha") {
      const wrapper = document.createElement("div");
      wrapper.style.cssText =
        "width:100%;height:100%;display:flex;align-items:center;justify-content:center;";

      const spriteCanvas = document.createElement("canvas");
      spriteCanvas.width = FRAME_W;
      spriteCanvas.height = FRAME_H;
      spriteCanvas.style.width = `${FRAME_W * SCALE}px`;
      spriteCanvas.style.height = `${FRAME_H * SCALE}px`;
      spriteCanvas.style.imageRendering = "pixelated";
      spriteCanvas.id = "target-sprite";

      wrapper.appendChild(spriteCanvas);
      targetPanel.appendChild(wrapper);
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.style.cssText =
      "display:flex;align-items:center;gap:12px;justify-content:center;padding:10px 14px;border:1px solid #3f3f46;border-radius:10px;background:#111827;color:#e5e7eb;font-family:ui-sans-serif,system-ui,sans-serif;";

    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = FRAME_W;
    spriteCanvas.height = FRAME_H;
    spriteCanvas.style.width = `${FRAME_W * SCALE}px`;
    spriteCanvas.style.height = `${FRAME_H * SCALE}px`;
    spriteCanvas.style.imageRendering = "pixelated";
    spriteCanvas.id = "target-sprite";

    const label = document.createElement("span");
    label.style.cssText = "font-size:14px;font-weight:700;line-height:1.25;";
    label.textContent = found
      ? `Found! Target was ${def.label}. Click map to replay.`
      : `Target: ${def.label} (click this character)`;

    wrapper.appendChild(spriteCanvas);
    wrapper.appendChild(label);
    targetPanel.appendChild(wrapper);
  }

  function updateTargetSprite() {
    const spriteCanvas = targetPanel.querySelector("#target-sprite") as HTMLCanvasElement | null;
    if (!spriteCanvas) return;
    const sctx = spriteCanvas.getContext("2d")!;
    sctx.imageSmoothingEnabled = false;
    sctx.clearRect(0, 0, FRAME_W, FRAME_H);
    const sheet = sheets.get(CHARACTERS[targetIdx].id)!;
    const src = frameSrc(Dir.Down, targetAnimFrame);
    sctx.drawImage(sheet, src.sx, src.sy, src.sw, src.sh, 0, 0, FRAME_W, FRAME_H);
  }

  // ── AI movement ──────────────────────────────────────────────────────

  function updateCharacters(dt: number) {
    function isImmediateBacktrack(
      ch: Character,
      next: { col: number; row: number },
    ): boolean {
      return next.col === ch.prevCol && next.row === ch.prevRow;
    }

    for (const ch of characters) {
      ch.moveTimer -= dt;
      if (ch.moveTimer <= 0) {
        ch.moveTimer = MOVE_INTERVAL;
        if (ch.path.length < 2) {
          ch.path = makeLoopPath({ col: ch.col, row: ch.row });
          ch.pathCursor = 0;
        }

        // Follow precomputed loop path; if blocked by another character,
        // try nearby forward nodes first to keep motion natural.
        let moved = false;
        const loopLen = ch.path.length;
        for (let i = 1; i <= Math.min(4, loopLen); i++) {
          const nextIdx = (ch.pathCursor + i) % loopLen;
          const next = ch.path[nextIdx];
          const dc = next.col - ch.col;
          const dr = next.row - ch.row;
          if (Math.abs(dc) + Math.abs(dr) !== 1) continue;
          if (!isFree(next.col, next.row, ch)) continue;
          if (isImmediateBacktrack(ch, next)) continue;

          ch.prevCol = ch.col;
          ch.prevRow = ch.row;
          ch.col = next.col;
          ch.row = next.row;
          ch.pathCursor = nextIdx;
          ch.dir = dirFromStep(dc, dr);
          ch.moving = true;
          moved = true;
          break;
        }
        // Last resort anti-deadlock: search full loop if local options fail.
        if (!moved) {
          for (let i = 5; i <= loopLen; i++) {
            const nextIdx = (ch.pathCursor + i) % loopLen;
            const next = ch.path[nextIdx];
            const dc = next.col - ch.col;
            const dr = next.row - ch.row;
            if (Math.abs(dc) + Math.abs(dr) !== 1) continue;
            if (!isFree(next.col, next.row, ch)) continue;
            if (isImmediateBacktrack(ch, next)) continue;

            ch.prevCol = ch.col;
            ch.prevRow = ch.row;
            ch.col = next.col;
            ch.row = next.row;
            ch.pathCursor = nextIdx;
            ch.dir = dirFromStep(dc, dr);
            ch.moving = true;
            moved = true;
            break;
          }
        }
        if (!moved) {
          // Opportunistic sidestep helps break local deadlocks between characters.
          const freeN = neighbors(ch.col, ch.row).filter((n) =>
            isFree(n.col, n.row, ch),
          );
          if (freeN.length > 0) {
            const nonBacktrack = freeN.filter((n) => !isImmediateBacktrack(ch, n));
            const pool = nonBacktrack.length > 0 ? nonBacktrack : freeN;
            const next = pool[Math.floor(Math.random() * pool.length)];
            ch.prevCol = ch.col;
            ch.prevRow = ch.row;
            ch.col = next.col;
            ch.row = next.row;
            ch.dir = dirFromStep(ch.col - ch.prevCol, ch.row - ch.prevRow);
            ch.moving = true;
            ch.path = makeLoopPath({ col: ch.col, row: ch.row });
            ch.pathCursor = 0;
            moved = true;
          }
        }
        if (!moved) {
          ch.moving = false;
          ch.dir = DIR_LIST[Math.floor(Math.random() * DIR_LIST.length)];
          ch.path = makeLoopPath({ col: ch.col, row: ch.row });
          ch.pathCursor = 0;
          ch.stallTicks += 1;
        } else {
          ch.stallTicks = 0;
        }
      }
    }
  }

  // ── Click handling ───────────────────────────────────────────────────

  function handleClick(e: MouseEvent) {
    if (found) {
      spawnCharacters();
      pickTarget();
      return;
    }

    if (wrongFlash > 0) return;

    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / SCALE;
    const my = (e.clientY - rect.top) / SCALE;
    const targetId = CHARACTERS[targetIdx].id;

    let clickedTarget = false;
    for (const ch of characters) {
      const px = ch.col * TILE_SIZE + TILE_SIZE / 2 - FRAME_W / 2;
      const py = ch.row * TILE_SIZE + TILE_SIZE - FRAME_H;
      if (
        mx >= px - CLICK_HIT_PADDING &&
        mx < px + FRAME_W + CLICK_HIT_PADDING &&
        my >= py - CLICK_HIT_PADDING &&
        my < py + FRAME_H + CLICK_HIT_PADDING
      ) {
        if (ch.def.id === targetId) {
          clickedTarget = true;
        }
      }
    }

    if (clickedTarget) {
      found = true;
      options?.onFoundChange?.(true);
      renderTargetPanel();
      return;
    }

    // Any map click that is not the target should consume a life.
    wrongFlash = 300;
    options?.onWrongGuess?.();
  }

  canvas.addEventListener("click", handleClick);
  canvas.style.cursor = "pointer";

  // ── Render loop ──────────────────────────────────────────────────────

  let lastTime = 0;
  let animAccum = 0;
  let running = true;

  function render(now: number) {
    if (!running) return;
    const dt = lastTime ? now - lastTime : 16;
    lastTime = now;
    animAccum += dt;

    // Step character animation frames
    if (animAccum >= ANIM_INTERVAL) {
      animAccum -= ANIM_INTERVAL;
      for (const ch of characters) {
        ch.frame = (ch.frame + 1) % 4;
      }
      targetAnimFrame = (targetAnimFrame + 1) % 4;
      updateTargetSprite();
    }

    // Wrong-click flash decay
    if (wrongFlash > 0) wrongFlash = Math.max(0, wrongFlash - dt);

    updateCharacters(dt);

    // ── Draw ──────────────────────────────────────────────────────────

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Ground
    ctx.drawImage(groundCanvas, 0, 0);

    // Characters sorted by row (painter's algorithm)
    const sorted = [...characters].sort((a, b) => a.row - b.row);

    for (const ch of sorted) {
      // Lerp position for smooth movement
      const progress = Math.min(1, 1 - ch.moveTimer / MOVE_INTERVAL);
      let drawCol: number, drawRow: number;
      if (ch.moving && progress < 1) {
        drawCol = ch.prevCol + (ch.col - ch.prevCol) * progress;
        drawRow = ch.prevRow + (ch.row - ch.prevRow) * progress;
      } else {
        drawCol = ch.col;
        drawRow = ch.row;
        ch.moving = false;
      }

      const px = drawCol * TILE_SIZE + TILE_SIZE / 2 - FRAME_W / 2;
      const py = drawRow * TILE_SIZE + TILE_SIZE - FRAME_H;

      const idleFrame = ch.frame % 4 < 2 ? 0 : 1;
      const src = frameSrc(ch.dir, ch.moving ? ch.frame : idleFrame);
      ctx.drawImage(ch.sheet, src.sx, src.sy, src.sw, src.sh, px, py, FRAME_W, FRAME_H);

      // Highlight if found
      if (found && ch.def.id === CHARACTERS[targetIdx].id) {
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 2;
        ctx.strokeRect(px - 2, py - 2, FRAME_W + 4, FRAME_H + 4);
      }
    }

    // Obstacles on top so sprites don't appear to stand over trees/logs.
    for (const obs of sortedObstacles) {
      const def = OBSTACLE_DEFS[obs.kind];
      const img = obstacleImgs[obs.kind];
      const dx = obs.col * TILE_SIZE + TILE_SIZE / 2 - def.w / 2;
      const dy = obs.row * TILE_SIZE + TILE_SIZE - def.h;
      ctx.drawImage(img, dx, dy, def.w, def.h);
    }

    // Wrong-click red flash overlay
    if (wrongFlash > 0) {
      ctx.fillStyle = `rgba(239, 68, 68, ${wrongFlash / 800})`;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    requestAnimationFrame(render);
  }

  // ── Init ─────────────────────────────────────────────────────────────

  spawnCharacters();
  pickTarget();
  updateTargetSprite();
  requestAnimationFrame(render);

  return {
    destroy() {
      running = false;
      canvas.removeEventListener("click", handleClick);
    },
  };
}
