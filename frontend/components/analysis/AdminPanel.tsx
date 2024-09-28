import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AnalysisResults, AdminDecision } from '@/types/analysis'

export function AdminPanel({ results, setActiveTab, onDecisionMade }: { 
  results: AnalysisResults, 
  setActiveTab: (tab: string) => void,
  onDecisionMade: (decision: AdminDecision) => void
}) {
  const [contentLabel, setContentLabel] = useState<AdminDecision['contentLabel']>('white')
  const [adSuitability, setAdSuitability] = useState(50)
  const [copyrightViolation, setCopyrightViolation] = useState(false)
  const [prohibitedContent, setProhibitedContent] = useState(false)
  const [recommendationLevel, setRecommendationLevel] = useState<AdminDecision['recommendationLevel']>('Neutral')

  useEffect(() => {
    if (results.adminDecision) {
      setContentLabel(results.adminDecision.contentLabel)
      setAdSuitability(results.adminDecision.adSuitability)
      setCopyrightViolation(results.adminDecision.copyrightViolation)
      setProhibitedContent(results.adminDecision.prohibitedContent)
      setRecommendationLevel(results.adminDecision.recommendationLevel)
    }
  }, [results.adminDecision])

  const analyzeContent = () => {
    setAdSuitability(75)
    setCopyrightViolation(results.audio?.musicPatterns?.some(pattern => pattern.length > 0) ?? false)
    setProhibitedContent(results.symbols?.detectedSymbols?.some(symbol => symbol.symbol === 'swastika') ?? false)
  }

  const saveDecision = () => {
    const decision: AdminDecision = {
      contentLabel,
      adSuitability,
      copyrightViolation,
      prohibitedContent,
      recommendationLevel
    }
    onDecisionMade(decision)
  }

  const handleContentLabel = (label: AdminDecision['contentLabel']) => {
    setContentLabel(label)
  }

  const handleRecommendationLevel = (level: AdminDecision['recommendationLevel']) => {
    setRecommendationLevel(level)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Панель администратора</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Маркировка контента</h4>
            <div className="flex space-x-2">
              {(['white', 'gray', 'black', '18+'] as AdminDecision['contentLabel'][]).map((label) => (
                <Button
                  key={label}
                  variant={contentLabel === label ? "default" : "outline"}
                  onClick={() => handleContentLabel(label)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Пригодность для рекламы</h4>
            <Slider
              value={[adSuitability]}
              onValueChange={(value) => setAdSuitability(value[0])}
              max={100}
              step={1}
            />
            <p className="mt-2">Пригодность: {adSuitability}%</p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="copyright"
              checked={copyrightViolation}
              onCheckedChange={setCopyrightViolation}
            />
            <Label htmlFor="copyright">Нарушение авторских прав</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="prohibited"
              checked={prohibitedContent}
              onCheckedChange={setProhibitedContent}
            />
            <Label htmlFor="prohibited">Запрещенный контент</Label>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Уровень рекомендации</h4>
            <div className="flex flex-wrap gap-2">
              {(['Highly Recommended', 'Recommended', 'Neutral', 'Not Recommended', 'Highly Not Recommended'] as AdminDecision['recommendationLevel'][]).map((level) => (
                <Button
                  key={level}
                  variant={recommendationLevel === level ? "default" : "outline"}
                  onClick={() => handleRecommendationLevel(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={analyzeContent} className="w-full">
            Анализировать контент
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => setActiveTab('audio')}>Аудио анализ</Button>
            <Button onClick={() => setActiveTab('symbols')}>Анализ символов</Button>
            <Button onClick={() => setActiveTab('objects')}>Анализ объектов</Button>
            <Button onClick={() => setActiveTab('scenes')}>Анализ сцен</Button>
          </div>
        </div>
      </CardContent>
      <Button onClick={saveDecision} className="w-full mt-4">
        Сохранить решение
      </Button>
    </Card>
  )
}