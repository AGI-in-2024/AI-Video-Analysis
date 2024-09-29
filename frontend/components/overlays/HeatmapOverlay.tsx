import React, { useEffect, useRef } from 'react';

interface HeatmapOverlayProps {
  heatZones: Array<{ x: number; y: number; intensity: number }>;
  videoWidth: number;
  videoHeight: number;
}

export function HeatmapOverlay({ heatZones, videoWidth, videoHeight }: HeatmapOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    heatZones.forEach(zone => {
      const gradient = ctx.createRadialGradient(zone.x, zone.y, 0, zone.x, zone.y, 50);
      gradient.addColorStop(0, `rgba(255, 0, 0, ${zone.intensity})`);
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, 50, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [heatZones, videoWidth, videoHeight]);

  return (
    <canvas
      ref={canvasRef}
      width={videoWidth}
      height={videoHeight}
      className="absolute top-0 left-0 pointer-events-none"
    />
  );
}