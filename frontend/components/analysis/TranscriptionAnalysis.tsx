import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { AnalysisResults } from '@/types/analysis'

interface TranscriptionAnalysisProps {
  results: AnalysisResults['transcription'];
}

export function TranscriptionAnalysis({ results }: TranscriptionAnalysisProps) {
  if (!results || !results.text) {
    return <div className="text-gray-400">Данные транскрипции недоступны.</div>
  }

  const mockKeywords = [
    { word: "инновация", count: 5, type: "positive" },
    { word: "вызов", count: 3, type: "neutral" },
    { word: "неудача", count: 2, type: "negative" },
    { word: "реклама", count: 1, type: "adPlacement" },
    { word: "авторские права", count: 2, type: "copyright" },
    { word: "запрещенный", count: 1, type: "prohibited" },
  ]

  const mockSpeakers = [
    { name: "Спикер 1", duration: "2:15", sentiment: "positive" },
    { name: "Спикер 2", duration: "1:45", sentiment: "neutral" },
    { name: "Спикер 3", duration: "0:30", sentiment: "negative" },
  ]

  const mockAdPlacements = [
    { time: "1:30", description: "Подходящее место для рекламы" },
    { time: "3:45", description: "Возможность вставки рекламы" },
  ]

  const mockContentLabels = [
    { time: "0:45", label: "18+", reason: "Нецензурная лексика" },
    { time: "2:10", label: "gray", reason: "Спорный контент" },
  ]

  const mockCopyrightIssues = [
    { time: "1:15", description: "Упоминание защищенного бренда" },
    { time: "4:20", description: "Цитата из защищенного произведения" },
  ]

  const mockPotentialClips = [
    { start: "0:30", end: "0:45", description: "Яркая цитата, подходит для шортс" },
    { start: "3:15", end: "3:30", description: "Эмоциональный момент, хорош для клипа" },
  ]

  // Используем реальный текст из результатов, если он есть, иначе используем заглушку
  const paragraphs = results.text ? results.text.split('\n\n') : [
    "Это пример текста транскрипции. В реальном сценарии здесь будет отображаться фактическая транскрипция видео.",
    "Каждый параграф представляет собой отдельную часть речи или диалога из видео.",
    "Транскрипция помогает модераторам быстро просмотреть содержание видео без необходимости его просмотра."
  ]

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-100">Анализ транскрипции</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2 text-gray-100">Ключевые слова</h4>
          <div className="flex flex-wrap gap-2">
            {mockKeywords.map((keyword, index) => (
              <Badge key={index} variant={keyword.type as "default" | "secondary" | "destructive"}>
                {keyword.word} ({keyword.count})
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-gray-100">Спикеры</h4>
          <div className="grid grid-cols-3 gap-2">
            {mockSpeakers.map((speaker, index) => (
              <div key={index} className="flex flex-col">
                <span>{speaker.name}</span>
                <span>{speaker.duration}</span>
                <Badge variant={speaker.sentiment as "default" | "secondary" | "destructive"}>{speaker.sentiment}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-gray-100">Потенциальные места для рекламы</h4>
          <ul className="list-disc list-inside">
            {mockAdPlacements.map((placement, index) => (
              <li key={index}>{placement.time} - {placement.description}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-gray-100">Метки контента</h4>
          <ul className="list-disc list-inside">
            {mockContentLabels.map((label, index) => (
              <li key={index}>{label.time} - {label.label} ({label.reason})</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-gray-100">Проблемы с авторскими правами</h4>
          <ul className="list-disc list-inside">
            {mockCopyrightIssues.map((issue, index) => (
              <li key={index}>{issue.time} - {issue.description}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-gray-100">Потенциальные клипы</h4>
          <ul className="list-disc list-inside">
            {mockPotentialClips.map((clip, index) => (
              <li key={index}>{clip.start} - {clip.end}: {clip.description}</li>
            ))}
          </ul>
        </div>
        <ScrollArea className="h-[400px] pr-4">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-gray-300 mb-4 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}