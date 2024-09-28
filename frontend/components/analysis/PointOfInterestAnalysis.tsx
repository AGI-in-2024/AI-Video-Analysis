import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnalysisResults, HeatZone, HeatZoneCoordinate, AttentionHotspot, EyeTrackingData } from '@/types/analysis'
import { format } from 'date-fns';

export function PointOfInterestAnalysis({ results }: { results: AnalysisResults['poi'] }) {
  if (!results) return <div>No point of interest analysis results available</div>

  const formatTimestamp = (seconds: number) => {
    const date = new Date(seconds * 1000);
    return format(date, 'mm:ss');
  };

  const interpretHeatZones = (heatZones: HeatZone[]) => {
    if (heatZones.length === 0) return "No significant heat zones detected.";
    const maxIntensity = Math.max(...heatZones.map(zone => zone.intensity));
    const maxSize = Math.max(...heatZones.map(zone => zone.size));
    return `The most intense heat zone has an intensity of ${maxIntensity.toFixed(2)} and covers an area of ${maxSize.toFixed(2)} px². This suggests a strong focus point in the video.`;
  };

  const interpretHotspots = (hotspots: AttentionHotspot[]) => {
    if (hotspots.length === 0) return "No significant hotspots detected.";
    const maxIntensity = Math.max(...hotspots.map(spot => spot.intensity));
    return `The most intense hotspot has an intensity of ${maxIntensity.toFixed(2)}. This indicates a key area of viewer attention.`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Анализ точек интереса</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Тепловые зоны внимания</h4>
            <ul className="list-disc list-inside">
              {results.heatZones.map((zone, index) => (
                <li key={index}>
                  Зона {index + 1}: Интенсивность: {zone.intensity.toFixed(2)}, Размер: {zone.size.toFixed(2)} px²
                  {zone.timestamp && <span> (Время: {formatTimestamp(zone.timestamp)})</span>}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-gray-600">{interpretHeatZones(results.heatZones)}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Координаты и площадь тепловых зон</h4>
            {results.heatZoneCoordinates.map((zone, index) => (
              <p key={index}>
                Зона {index + 1}: X: {zone.x}, Y: {zone.y}, Ширина: {zone.width}, Высота: {zone.height}
                {zone.timestamp && <span> (Время: {formatTimestamp(zone.timestamp)})</span>}
              </p>
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Горячие точки внимания</h4>
            <ul className="list-disc list-inside">
              {results.attentionHotspots.map((hotspot, index) => (
                <li key={index}>
                  X: {hotspot.x}, Y: {hotspot.y}, Интенсивность: {hotspot.intensity.toFixed(2)}
                  {hotspot.timestamp && <span> (Время: {formatTimestamp(hotspot.timestamp)})</span>}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-gray-600">{interpretHotspots(results.attentionHotspots)}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Данные отслеживания взгляда</h4>
            <ul className="list-disc list-inside">
              {results.eyeTrackingData.map((data, index) => (
                <li key={index}>
                  Время: {formatTimestamp(data.timestamp)}, X: {data.x}, Y: {data.y}, Длительность: {data.duration}мс
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Разметка на основе точек интереса</h4>
            {results.labels.map((label: string, index: number) => (
              <Badge key={index} variant="outline" className={index > 0 ? "ml-2" : ""}>{label}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}