import React from 'react'
import { AnalysisResults } from '@/types/analysis'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ObjectsAnalysisProps {
  results: AnalysisResults['objects']
}

export function ObjectsAnalysis({ results }: ObjectsAnalysisProps) {
  if (!results) {
    return <div className="text-gray-400">Результаты анализа объектов недоступны.</div>
  }

  const {
    objectCategories,
    keyObjects,
    objectOccurrences,
    objectInteractions,
    sceneClassifications,
    labels
  } = results

  const chartData = Object.entries(objectOccurrences || {}).map(([name, value]) => ({ name, value }))

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-100">Анализ объектов</CardTitle>
      </CardHeader>
      <CardContent className="text-gray-300">
        <h3 className="text-xl font-semibold mb-2">Категории объектов</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {objectCategories && objectCategories.map((category: string, index: number) => (
            <Badge key={index} variant="secondary">{category}</Badge>
          ))}
        </div>

        <h3 className="text-xl font-semibold mb-2">Ключевые объекты</h3>
        <ul className="list-disc pl-5 mb-4">
          {keyObjects && keyObjects.map((object: { time: string; description: string }, index: number) => (
            <li key={index}>{object.time}: {object.description}</li>
          ))}
        </ul>

        <h3 className="text-xl font-semibold mb-2">Частота появления объектов</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>

        <h3 className="text-xl font-semibold mb-2 mt-4">Взаимодействия объектов</h3>
        <ul className="list-disc pl-5 mb-4">
          {objectInteractions && objectInteractions.map((interaction: { time: string; description: string }, index: number) => (
            <li key={index}>{interaction.time}: {interaction.description}</li>
          ))}
        </ul>

        <h3 className="text-xl font-semibold mb-2">Классификация сцен</h3>
        <ul className="list-disc pl-5 mb-4">
          {sceneClassifications && sceneClassifications.map((classification: { time: string; scene: string }, index: number) => (
            <li key={index}>{classification.time}: {classification.scene}</li>
          ))}
        </ul>

        <h3 className="text-xl font-semibold mb-2">Метки</h3>
        <div className="flex flex-wrap gap-2">
          {labels && labels.map((label: string, index: number) => (
            <Badge key={index} variant="outline">{label}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}