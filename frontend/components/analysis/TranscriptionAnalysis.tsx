import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { AnalysisResults, Language, KeyEvent, Keyword } from '@/types/analysis'

export function TranscriptionAnalysis({ results }: { results: AnalysisResults['transcription'] }) {
  if (!results) return <div>No transcription results available</div>

  const { transcription, analysis } = results;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Транскрибация и анализ речи</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Статус генерации</h4>
            <p>Успех: {analysis.generationStatus?.success ? 'Да' : 'Нет'}</p>
            <p>Модель: {analysis.generationStatus?.model}</p>
          </div>
          {analysis.languages && analysis.languages.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Языки</h4>
              <ul className="list-disc list-inside">
                {analysis.languages.map((lang: Language, index: number) => (
                  <li key={index}>{lang.name} {lang.primary ? '(основной)' : ''}</li>
                ))}
              </ul>
            </div>
          )}
          {typeof analysis.lipSyncAccuracy === 'number' && (
            <div>
              <h4 className="font-semibold mb-2">Точность синхронизации губ</h4>
              <p>{analysis.lipSyncAccuracy.toFixed(2)}%</p>
            </div>
          )}
          {analysis.subtitlesStatus && (
            <div>
              <h4 className="font-semibold mb-2">Статус субтитров</h4>
              <p>Созданы: {analysis.subtitlesStatus.created ? 'Да' : 'Нет'}</p>
              <p>Синхронизированы: {analysis.subtitlesStatus.synchronized ? 'Да' : 'Нет'}</p>
            </div>
          )}
          {analysis.keyEvents && analysis.keyEvents.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Ключевые события</h4>
              <ul className="list-disc list-inside">
                {analysis.keyEvents.map((event: KeyEvent, index: number) => (
                  <li key={index}>{event.time}: {event.description} (Тип: {event.type})</li>
                ))}
              </ul>
            </div>
          )}
          {analysis.sentimentAnalysis && analysis.sentimentAnalysis.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Анализ настроения</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analysis.sentimentAnalysis}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sentiment" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
              {analysis.overallSentiment && (
                <p>Общее настроение: {analysis.overallSentiment.tone} (Значение: {analysis.overallSentiment.value.toFixed(2)})</p>
              )}
            </div>
          )}
          {analysis.keywordAnalysis && analysis.keywordAnalysis.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Анализ ключевых слов</h4>
              <ul className="list-disc list-inside">
                {analysis.keywordAnalysis.map((keyword: Keyword, index: number) => (
                  <li key={index}>{keyword.word} (Количество: {keyword.count}, Тип: {keyword.type})</li>
                ))}
              </ul>
            </div>
          )}
          {analysis.textLabels && analysis.textLabels.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Текстовые метки</h4>
              {analysis.textLabels.map((label: string, index: number) => (
                <Badge key={index} variant="outline" className={index > 0 ? "ml-2" : ""}>{label}</Badge>
              ))}
            </div>
          )}
          {transcription && (
            <div>
              <h4 className="font-semibold mb-2">Транскрипция</h4>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <p>{transcription}</p>
              </ScrollArea>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}