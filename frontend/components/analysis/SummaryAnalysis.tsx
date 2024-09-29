import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AnalysisResults, AdminDecision } from '@/types/analysis'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface SummaryAnalysisProps {
  results: AnalysisResults['summary']
  onDecisionMade: (decision: AdminDecision) => void
}

export function SummaryAnalysis({ results, onDecisionMade }: SummaryAnalysisProps) {
  if (!results) return <div className="text-gray-400">Результаты анализа недоступны</div>

  const pieChartData = {
    labels: ['Позитивный', 'Нейтральный', 'Негативный'],
    datasets: [
      {
        data: [results.sentimentPositive, results.sentimentNeutral, results.sentimentNegative],
        backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
      },
    ],
  }

  const adOpportunities = [
    { time: "0:15", description: "Спокойная сцена, подходит для ненавязчивой рекламы" },
    { time: "1:45", description: "Высокая вовлеченность, отличное место для рекламы" },
    { time: "3:30", description: "Естественная пауза в контенте, идеально для вставки рекламы" },
  ]

  const contentIssues = [
    { type: "Запрещенный звук", time: "0:45", description: "Обнаружена потенциальная речь ненависти" },
    { type: "Неприемлемое изображение", time: "2:10", description: "Возможная нагота или насилие" },
    { type: "Нарушение авторских прав", time: "3:55", description: "Обнаружена защищенная авторским правом музыка" },
  ]

  const specialSymbols = [
    { symbol: "Свастика", time: "1:20", context: "Исторический документальный контекст" },
    { symbol: "Знак банды", time: "2:35", context: "Потенциальная пропаганда насилия" },
  ]

  const potentialClips = [
    { start: "0:30", end: "0:45", description: "Энергичный сегмент, подходит для шортс" },
    { start: "2:15", end: "2:30", description: "Забавный момент, достойный клипа" },
    { start: "4:00", end: "4:15", description: "Неожиданное откровение, хорошо для тизеров" },
  ]

  const handleContentLabel = (label: AdminDecision['contentLabel']) => {
    onDecisionMade({ contentLabel: label } as AdminDecision)
  }

  const handleAdSuitability = (suitability: number) => {
    onDecisionMade({ adSuitability: suitability } as AdminDecision)
  }

  const handleCopyrightViolation = (violation: boolean) => {
    onDecisionMade({ copyrightViolation: violation } as AdminDecision)
  }

  const handleProhibitedContent = (prohibited: boolean) => {
    onDecisionMade({ prohibitedContent: prohibited } as AdminDecision)
  }

  const handleRecommendationLevel = (level: AdminDecision['recommendationLevel']) => {
    onDecisionMade({ recommendationLevel: level } as AdminDecision)
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-100">Сводка модератора</CardTitle>
      </CardHeader>
      <CardContent className="text-gray-300 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-gray-100">Общая информация</h4>
              <div className="grid grid-cols-2 gap-2">
                <p className="font-medium">Длительность:</p>
                <p>{results.duration || 'Н/Д'}</p>
                <p className="font-medium">Общий тон:</p>
                <p>{results.overallTone || 'Н/Д'}</p>
                <p className="font-medium">Уровень риска:</p>
                <Badge variant={
                  results.riskLevel === 'Low' ? 'secondary' : 
                  results.riskLevel === 'Medium' ? 'default' : 
                  'destructive'
                }>
                  {results.riskLevel || 'Н/Д'}
                </Badge>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-100">Анализ настроения</h4>
              <div className="w-full h-48">
                <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-gray-100">Возможности для рекламы</h4>
              <ul className="list-disc list-inside space-y-1">
                {adOpportunities.map((opportunity, index) => (
                  <li key={index}>
                    <span className="font-medium">{opportunity.time}:</span> {opportunity.description}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-100">Проблемы с контентом</h4>
              <ul className="list-disc list-inside space-y-1">
                {contentIssues.map((issue, index) => (
                  <li key={index}>
                    <span className="font-medium">{issue.type} в {issue.time}:</span> {issue.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 text-gray-100">Обнаруженные специальные символы</h4>
            <ul className="list-disc list-inside space-y-1">
              {specialSymbols.map((symbol, index) => (
                <li key={index}>
                  <span className="font-medium">{symbol.symbol} в {symbol.time}:</span> {symbol.context}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-gray-100">Потенциальные клипы для шортс</h4>
            <ul className="list-disc list-inside space-y-1">
              {potentialClips.map((clip, index) => (
                <li key={index}>
                  <span className="font-medium">{clip.start} - {clip.end}:</span> {clip.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="font-semibold mb-2 text-gray-100">Решения модератора</h4>
          <div className="space-y-2">
            <div>
              <p className="font-medium mb-1">Метка контента:</p>
              <div className="flex space-x-2">
                {(['white', 'gray', 'black', '18+'] as const).map((label) => (
                  <Button key={label} onClick={() => handleContentLabel(label)} variant="outline" size="sm">
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-medium mb-1">Пригодность для рекламы (0-10):</p>
              <input 
                type="range" 
                min="0" 
                max="10" 
                className="w-full" 
                onChange={(e) => handleAdSuitability(parseInt(e.target.value))}
              />
            </div>
            <div>
              <p className="font-medium mb-1">Нарушение авторских прав:</p>
              <div className="flex space-x-2">
                <Button onClick={() => handleCopyrightViolation(true)} variant="outline" size="sm">Да</Button>
                <Button onClick={() => handleCopyrightViolation(false)} variant="outline" size="sm">Нет</Button>
              </div>
            </div>
            <div>
              <p className="font-medium mb-1">Запрещенный контент:</p>
              <div className="flex space-x-2">
                <Button onClick={() => handleProhibitedContent(true)} variant="outline" size="sm">Да</Button>
                <Button onClick={() => handleProhibitedContent(false)} variant="outline" size="sm">Нет</Button>
              </div>
            </div>
            <div>
              <p className="font-medium mb-1">Уровень рекомендации:</p>
              <div className="flex flex-wrap gap-2">
                {(['Highly Recommended', 'Recommended', 'Neutral', 'Not Recommended', 'Highly Not Recommended'] as const).map((level) => (
                  <Button key={level} onClick={() => handleRecommendationLevel(level)} variant="outline" size="sm">
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}