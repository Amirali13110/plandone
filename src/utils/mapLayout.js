function createCurvePath(points) {
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midY = (prev.y + curr.y) / 2;
    path += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }
  return path;
}

export function buildForestLayout(levelCount) {
  const width = 560;
  const stepY = 172;
  const totalStops = Math.max(1, levelCount) + 2; // Start + levels + Goal
  const height = 285 + (totalStops - 1) * stepY;

  // Build stops from bottom (Start) to top (Goal)
  const stops = [];
  for (let i = 0; i < totalStops; i++) {
    const isStartOrEnd = i === 0 || i === totalStops - 1;
    const offset = i % 2 === 1 ? -135 : 135;
    stops.push({
      x: isStartOrEnd ? width / 2 : width / 2 + offset,
      y: height - 145 - i * stepY,
    });
  }

  // Place trees along the left and right edges away from the trail
  const trees = [];
  for (let row = 0; row < Math.ceil(height / 110); row++) {
    const baseY = 66 + row * 110;
    const spots = [
      { x: 44 + ((row * 23) % 34), y: baseY + ((row * 17) % 24) },
      { x: width - 46 - ((row * 29) % 34), y: baseY + ((row * 19) % 24) },
    ];

    spots.forEach((spot, side) => {
      const isClear = stops.every((s) => Math.hypot(s.x - spot.x, s.y - spot.y) >= 105);
      if (isClear && spot.y < height - 35) {
        trees.push({
          ...spot,
          scale: 0.92 + ((row + side) % 3) * 0.16,
          variant: (row + side) % 3 === 0 ? 'oak' : 'pine',
          delay: (row * 0.7 + side * 1.1) % 4,
        });
      }
    });
  }

  const fireflies = Array.from({ length: 18 }, (_, i) => ({
    x: 45 + ((i * 137) % (width - 90)),
    y: 70 + ((i * 193) % (height - 140)),
    r: 2.5 + (i % 3) * 1.1,
    delay: (i * 0.45) % 5,
    duration: 4.5 + (i % 4) * 1.3,
  }));

  return {
    width,
    height,
    start: stops[0],
    end: stops[stops.length - 1],
    levelPoints: stops.slice(1, -1),
    fullPathD: createCurvePath(stops),
    trees,
    fireflies,
  };
}
