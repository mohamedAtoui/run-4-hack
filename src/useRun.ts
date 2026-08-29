import { useEffect, useRef, useState } from "react";

export interface RunStats {
  running: boolean;
  elapsedSec: number;
  distanceKm: number;
  paceMinPerKm: number | null; // current pace, null until enough data
  gpsError: string | null;
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function useRun() {
  const [stats, setStats] = useState<RunStats>({
    running: false,
    elapsedSec: 0,
    distanceKm: 0,
    paceMinPerKm: null,
    gpsError: null,
  });
  const watchId = useRef<number | null>(null);
  const timerId = useRef<number | null>(null);
  const lastPos = useRef<GeolocationPosition | null>(null);
  const recentSpeeds = useRef<number[]>([]); // km/h samples

  const stop = () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    if (timerId.current !== null) window.clearInterval(timerId.current);
    watchId.current = null;
    timerId.current = null;
    lastPos.current = null;
    recentSpeeds.current = [];
    setStats((s) => ({ ...s, running: false }));
  };

  const start = () => {
    setStats({
      running: true,
      elapsedSec: 0,
      distanceKm: 0,
      paceMinPerKm: null,
      gpsError: null,
    });
    timerId.current = window.setInterval(
      () => setStats((s) => ({ ...s, elapsedSec: s.elapsedSec + 1 })),
      1000,
    );
    if (!navigator.geolocation) {
      setStats((s) => ({ ...s, gpsError: "Geolocation not supported" }));
      return;
    }
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const prev = lastPos.current;
        lastPos.current = pos;
        if (!prev) return;
        const dKm = haversineKm(
          prev.coords.latitude,
          prev.coords.longitude,
          pos.coords.latitude,
          pos.coords.longitude,
        );
        const dtH = (pos.timestamp - prev.timestamp) / 3_600_000;
        if (dtH <= 0) return;
        const speed = dKm / dtH;
        recentSpeeds.current = [...recentSpeeds.current.slice(-4), speed];
        const avgSpeed =
          recentSpeeds.current.reduce((a, b) => a + b, 0) /
          recentSpeeds.current.length;
        setStats((s) => ({
          ...s,
          distanceKm: s.distanceKm + dKm,
          paceMinPerKm: avgSpeed > 0.5 ? 60 / avgSpeed : null,
          gpsError: null,
        }));
      },
      (err) => setStats((s) => ({ ...s, gpsError: err.message })),
      { enableHighAccuracy: true, maximumAge: 0 },
    );
  };

  useEffect(() => stop, []);

  return { stats, start, stop };
}
