import type { RestaurantLayout } from './types';

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent?: Node;
}

function heuristic(ax: number, ay: number, bx: number, by: number): number {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

export function findPath(
  layout: RestaurantLayout,
  startX: number,
  startY: number,
  goalX: number,
  goalY: number
): { x: number; y: number }[] {
  const grid = layout.walkableGrid;
  if (!grid) return [{ x: startX, y: startY }];

  const width = layout.width;
  const height = layout.height;

  const inBounds = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < width && y < height;

  const isWalkable = (x: number, y: number) =>
    inBounds(x, y) && grid[y] && grid[y][x] !== false;

  const open: Node[] = [];
  const closed = new Set<string>();

  const start: Node = {
    x: startX,
    y: startY,
    g: 0,
    h: heuristic(startX, startY, goalX, goalY),
    get f() {
      return this.g + this.h;
    }
  } as Node;

  open.push(start);

  const key = (x: number, y: number) => `${x},${y}`;

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift() as Node;
    if (current.x === goalX && current.y === goalY) {
      const path: { x: number; y: number }[] = [];
      let node: Node | undefined = current;
      while (node) {
        path.push({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path.reverse();
    }

    closed.add(key(current.x, current.y));

    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ];

    for (const n of neighbors) {
      if (!isWalkable(n.x, n.y)) continue;
      const nKey = key(n.x, n.y);
      if (closed.has(nKey)) continue;

      const gScore = current.g + 1;
      const existing = open.find((o) => o.x === n.x && o.y === n.y);
      if (existing && gScore >= existing.g) continue;

      const node: Node = existing || {
        x: n.x,
        y: n.y,
        g: gScore,
        h: heuristic(n.x, n.y, goalX, goalY),
        f: gScore + heuristic(n.x, n.y, goalX, goalY),
        parent: current
      };
      node.g = gScore;
      node.h = heuristic(n.x, n.y, goalX, goalY);
      node.f = node.g + node.h;
      node.parent = current;

      if (!existing) {
        open.push(node);
      }
    }
  }

  return [{ x: startX, y: startY }];
}
