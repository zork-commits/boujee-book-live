import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker, LatLngBoundsExpression } from "leaflet";
// Deliberately NOT a static top-level import: leaflet.css must never enter the
// SSR/server bundle graph (only src/components — client-loaded via the effect below).

export type MapPoint = {
  key: string;
  lat: number;
  lng: number;
  label: string;
  /** "gold" = pro, "ink" = customer */
  variant: "gold" | "ink";
  stale?: boolean;
};

/**
 * Leaflet + OpenStreetMap live map. Client-only (Leaflet needs `window`),
 * so callers must render it after mount — this component guards anyway.
 */
export function LiveMap({ points, className }: { points: MapPoint[]; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  // Latest points, readable from the async init path — avoids the race where the
  // map finishes initializing after the last points-effect run.
  const pointsRef = useRef<MapPoint[]>(points);
  pointsRef.current = points;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [L] = await Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]);
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
      }).setView([40.71, -73.99], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      mapRef.current = map;
      await draw(); // draw whatever points arrived while the map was initializing
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function draw() {
    {
      const map = mapRef.current;
      if (!map) return;
      const points = pointsRef.current;
      const L = await import("leaflet");
      const seen = new Set<string>();
      for (const p of points) {
        seen.add(p.key);
        const html = `
          <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-4px)">
            <div style="padding:2px 8px;border-radius:999px;background:${p.variant === "gold" ? "#d4a843" : "#1c1a17"};color:${p.variant === "gold" ? "#1c1a17" : "#fff"};font-size:10px;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.25);opacity:${p.stale ? 0.55 : 1}">${p.label}</div>
            <div style="width:14px;height:14px;border-radius:999px;background:${p.variant === "gold" ? "#d4a843" : "#1c1a17"};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);margin-top:2px;opacity:${p.stale ? 0.55 : 1}"></div>
          </div>`;
        const icon = L.divIcon({ html, className: "", iconSize: [0, 0], iconAnchor: [0, 18] });
        const existing = markersRef.current.get(p.key);
        if (existing) {
          existing.setLatLng([p.lat, p.lng]);
          existing.setIcon(icon);
        } else {
          markersRef.current.set(p.key, L.marker([p.lat, p.lng], { icon }).addTo(map));
        }
      }
      for (const [key, marker] of markersRef.current) {
        if (!seen.has(key)) {
          marker.remove();
          markersRef.current.delete(key);
        }
      }
      if (points.length > 0) {
        const bounds: LatLngBoundsExpression = points.map((p) => [p.lat, p.lng] as [number, number]);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
      }
    }
  }

  useEffect(() => {
    void draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  return <div ref={containerRef} className={className} aria-label="Live map" />;
}
