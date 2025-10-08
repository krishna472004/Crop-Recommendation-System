import * as turf from "@turf/turf";

export function getRandomPoints(polygon, count) {
  const points = turf
    .randomPoint(count, { bbox: turf.bbox(polygon) })
    .features.map((f) => f.geometry.coordinates);
  return points;
}
