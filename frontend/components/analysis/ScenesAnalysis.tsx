import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip } from 'recharts'

interface ScenesAnalysisProps {
  results: {
    sceneCount: number
    averageSceneDuration: number
    sceneTransitions: Array<{ from: string; to: string; time: string }>
    dominantColors: Array<{ r: number; g: number; b: number }>
    sceneDescriptions: string[]
    keyScenes: Array<{ 
      time: string
      type: string
      complexity: number
      motionIntensity: number
      mood: string
      text: string
    }>
    similarityMatrix: number[][]
  }
}

export function ScenesAnalysis({ results }: ScenesAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Анализ сцен</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Общая информация</h4>
            <p>Количество сцен: {results.sceneCount}</p>
            <p>Средняя продолжительность сцены: {results.averageSceneDuration.toFixed(2)} секунд</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Ключевые сцены</h4>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              {results.keyScenes.map((scene, index) => (
                <div key={index} className="mb-4">
                  <p>{scene.time}: {scene.type}</p>
                  <p>Сложность: {scene.complexity.toFixed(2)}</p>
                  <p>Интенсивность движения: {scene.motionIntensity.toFixed(2)}</p>
                  <p>Настроение: {scene.mood}</p>
                  <p>Текст: {scene.text.slice(0, 50)}...</p>
                </div>
              ))}
            </ScrollArea>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Переходы между сценами</h4>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              {results.sceneTransitions.map((transition, index) => (
                <div key={index} className="mb-2">
                  <p>{transition.time}: {transition.from} → {transition.to}</p>
                </div>
              ))}
            </ScrollArea>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Доминирующие цвета</h4>
            <div className="flex space-x-2">
              {results.dominantColors.map((color, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
                  title={`RGB(${color.r}, ${color.g}, ${color.b})`}
                />
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Описания сцен</h4>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              {results.sceneDescriptions.map((description, index) => (
                <p key={index} className="mb-2">{description}</p>
              ))}
            </ScrollArea>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Матрица сходства сцен</h4>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <XAxis type="number" dataKey="x" name="Сцена" />
                <YAxis type="number" dataKey="y" name="Сцена" />
                <ZAxis type="number" dataKey="value" range={[0, 500]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter
                  data={results.similarityMatrix.map((row, i) => 
                    row.map((value, j) => ({ x: i, y: j, value: value * 500 }))
                  ).flat()}
                  fill="#8884d8"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}