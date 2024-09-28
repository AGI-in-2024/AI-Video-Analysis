import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnalysisResults } from '@/types/analysis'

export function SummaryAnalysis({ results }: { results: AnalysisResults['summary'] }) {
  if (!results) return <div>No analysis results available</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Сводка анализа видео</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Общая информация</h4>
            <p>Длительность: {results.duration || 'N/A'}</p>
            <p>Общая тональность: {results.overallTone || 'N/A'}</p>
            <p>Уровень риска: {results.riskLevel || 'N/A'}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Ключевые моменты</h4>
            {results.keyMoments && Object.keys(results.keyMoments).length > 0 ? (
              <ul className="list-disc list-inside">
                {Object.entries(results.keyMoments).map(([key, value]) => (
                  <li key={key}>{key}: {value}</li>
                ))}
              </ul>
            ) : (
              <p>Нет доступных ключевых моментов</p>
            )}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Общая разметка</h4>
            {results.labels && results.labels.length > 0 ? (
              results.labels.map((label: string) => (
                <Badge key={label} variant="outline" className="mr-2">{label}</Badge>
              ))
            ) : (
              <p>Нет доступных меток</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}