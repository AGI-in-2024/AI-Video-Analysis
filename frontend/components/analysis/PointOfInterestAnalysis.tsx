import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnalysisResults, HeatZone, HeatZoneCoordinate, AttentionHotspot, EyeTrackingData } from '@/types/analysis'
import { format } from 'date-fns';

export function PointOfInterestAnalysis({ results }: { results: AnalysisResults['poi'] }) {
  if (!results) return <div className="text-gray-400">No point of interest analysis results available</div>

  const formatTimestamp = (seconds: number) => {
    const date = new Date(seconds * 1000);
    return format(date, 'mm:ss');
  };

  // ... (rest of the helper functions) ...

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-100">Анализ точек интереса</CardTitle>
      </CardHeader>
      <CardContent className="text-gray-300">
        <div className="space-y-4">
          {/* ... (rest of the component) ... */}
        </div>
      </CardContent>
    </Card>
  )
}