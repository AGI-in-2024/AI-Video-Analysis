import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { POIAnalysisResults } from '@/types/analysis';

interface POIAnalysisProps {
  results: POIAnalysisResults;
}

export function POIAnalysis({ results }: POIAnalysisProps) {
  if (!results) return <div>No POI analysis results available</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Points of Interest Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Heat Zones Analysis</h4>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <pre>{results.analysis.heatZonesAnalysis}</pre>
            </ScrollArea>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Heat Zone Coordinates</h4>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <pre>{results.analysis.heatZoneCoordinates}</pre>
            </ScrollArea>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Attention Hotspots</h4>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <pre>{results.analysis.hotspots}</pre>
            </ScrollArea>
          </div>
          <div>
            <h4 className="font-semibold mb-2">POI Labeling</h4>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <pre>{results.analysis.poiLabeling}</pre>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}