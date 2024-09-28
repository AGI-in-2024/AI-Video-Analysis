'use client'

import { useState, useRef, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { AlertCircle, CheckCircle2, Clock, ChevronRight, Upload } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CheckedState } from "@radix-ui/react-checkbox"

interface AnalysisSettings {
  object_detection: boolean;
  ocr: boolean;
  transcription: boolean;
  ai_insights: boolean;
  audio_analysis: boolean;
  symbol_detection: boolean;
  scene_detection: boolean;
  point_of_interest: boolean;
}

// Add this type definition
type AnalysisResults = {
  summary: any;
  transcription: any;
  audio: any;
  symbols: any;
  objects: any;
  poi: any;
  scenes: any;
};

export function VideoAnalysis() {
  const [activeTab, setActiveTab] = useState("summary")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [analysisSettings, setAnalysisSettings] = useState<AnalysisSettings>({
    object_detection: true,
    ocr: true,
    transcription: true,
    ai_insights: true,
    audio_analysis: true,
    symbol_detection: true,
    scene_detection: true,
    point_of_interest: true
  })
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null)

  const tabs = [
    { value: "summary", label: "Сводка" },
    { value: "admin", label: "Админ панель" },
    { value: "transcription", label: "Транскрибация" },
    { value: "audio", label: "Аудио анализ" },
    { value: "symbols", label: "Символы" },
    { value: "objects", label: "Объекты" },
    { value: "poi", label: "Точки интереса" },
    { value: "scenes", label: "Сцены" },
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setVideoFile(file)
    }
  }

  const handleAnalyze = async () => {
    if (!videoFile) {
      alert("Please upload a video file first")
      return
    }

    setIsAnalyzing(true)
    
    const formData = new FormData()
    formData.append('video', videoFile)
    formData.append('settings', JSON.stringify(analysisSettings))

    try {
      const response = await fetch('http://localhost:5000/api/analyze-video', {
        method: 'POST',
        body: formData
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log("Received analysis results:", data)
      setAnalysisResults(data.results)
    } catch (error) {
      console.error('Error during analysis:', error)
      alert(`Error during analysis: ${error}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      <Button onClick={() => fileInputRef.current?.click()} className="mb-4">
        <Upload className="mr-2 h-4 w-4" /> Upload Video
      </Button>
      {videoFile && <p className="mb-4">Selected file: {videoFile.name}</p>}

      <Dialog>
        <DialogTrigger asChild>
          <Button disabled={!videoFile}>Analyze Video</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Analysis Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {Object.entries(analysisSettings).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked: CheckedState) => 
                    setAnalysisSettings(prev => ({ ...prev, [key]: checked === true }))
                  }
                />
                <Label htmlFor={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
              </div>
            ))}
            <Button onClick={handleAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="summary">
          <SummaryAnalysis results={analysisResults?.summary} />
        </TabsContent>
        <TabsContent value="transcription">
          <TranscriptionAnalysis results={analysisResults?.transcription} />
        </TabsContent>
        <TabsContent value="audio">
          <AudioAnalysis results={analysisResults?.audio} />
        </TabsContent>
        <TabsContent value="symbols">
          <SymbolsAnalysis results={analysisResults?.symbols} />
        </TabsContent>
        <TabsContent value="objects">
          <ObjectsAnalysis results={analysisResults?.objects} />
        </TabsContent>
        <TabsContent value="poi">
          <PointOfInterestAnalysis results={analysisResults?.poi} />
        </TabsContent>
        <TabsContent value="scenes">
          <ScenesAnalysis results={analysisResults?.scenes} />
        </TabsContent>
        <TabsContent value="admin">
          <AdminPanel setActiveTab={setActiveTab} results={analysisResults} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AdminPanel({ setActiveTab, results }: { setActiveTab: (tab: string) => void, results: AnalysisResults | null }) {
  const [customLabel, setCustomLabel] = useState("")
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])

  const predefinedLabels = [
    "Безопасно", "18+", "Насилие", "Наркотики", "Алкоголь", "Нецензурная лексика"
  ]

  const handleLabelToggle = (label: string) => {
    setSelectedLabels(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    )
  }

  const handleCustomLabelAdd = () => {
    if (customLabel && !selectedLabels.includes(customLabel)) {
      setSelectedLabels(prev => [...prev, customLabel])
      setCustomLabel("")
    }
  }

  const handleSubmit = () => {
    console.log("Submitted labels:", selectedLabels)
    // Here you would typically send this data to your backend
    alert("Видео успешно размечено!")
  }

  useEffect(() => {
    if (results) {
      // Update selectedLabels based on results
      setSelectedLabels(results.labels || [])
    }
  }, [results])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Админ панель</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Краткий обзор анализа</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Транскрибация</span>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("transcription")}>
                    Просмотр <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Аудио анализ</span>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("audio")}>
                    Просмотр <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Символы</span>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("symbols")}>
                    Просмотр <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Объекты</span>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("objects")}>
                    Просмотр <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Точки интереса</span>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("poi")}>
                    Просмотр <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Сцены</span>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("scenes")}>
                    Просмотр <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Разметка видео</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Предопределенные метки</h4>
                  <div className="flex flex-wrap gap-2">
                    {predefinedLabels.map((label) => (
                      <Badge 
                        key={label} 
                        variant={selectedLabels.includes(label) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleLabelToggle(label)}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-label">Пользовательская метка</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="custom-label" 
                      value={customLabel} 
                      onChange={(e) => setCustomLabel(e.target.value)}
                      placeholder="Введите новую метку"
                    />
                    <Button onClick={handleCustomLabelAdd}>Добавить</Button>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Выбранные метки</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLabels.map((label) => (
                      <Badge key={label} variant="secondary" className="cursor-pointer" onClick={() => handleLabelToggle(label)}>
                        {label} ✕
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Итоговый обзор и отправка</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms">Я подтверждаю, что просмотрел все разделы анализа</Label>
                </div>
                <Button onClick={handleSubmit}>Отправить разметку</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

// Update the prop types for each analysis component
function TranscriptionAnalysis({ results }: { results: any }) {
  if (!results) return <div>No transcription results available</div>

  const [selectedEvent, setSelectedEvent] = useState(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Транскрибация и анализ речи</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Статус генерации</h4>
            <p>Успех: {results.generationStatus.success ? 'Да' : 'Нет'}</p>
            <p>Модель: {results.generationStatus.model}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Языки</h4>
            <ul className="list-disc list-inside">
              {results.languages.map((lang, index) => (
                <li key={index}>{lang.name} {lang.primary ? '(основной)' : ''}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Точность синхронизации губ</h4>
            <p>{results.lipSyncAccuracy}%</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Статус субтитров</h4>
            <p>Созданы: {results.subtitlesStatus.created ? 'Д��' : 'Нет'}</p>
            <p>Синхронизированы: {results.subtitlesStatus.synchronized ? 'Да' : 'Нет'}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Ключевые события</h4>
            <ul className="list-disc list-inside">
              {results.keyEvents.map((event, index) => (
                <li key={index}>{event.time}: {event.description} (Тип: {event.type})</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Анализ настроения</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={results.sentimentAnalysis}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
            <p>Общее настроение: {results.overallSentiment.tone} (Значение: {results.overallSentiment.value})</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Анализ ключевых слов</h4>
            <ul className="list-disc list-inside">
              {results.keywordAnalysis.map((keyword, index) => (
                <li key={index}>{keyword.word} (Количество: {keyword.count}, Тип: {keyword.type})</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Текстовые метки</h4>
            {results.textLabels.map((label, index) => (
              <Badge key={index} variant="outline" className={index > 0 ? "ml-2" : ""}>{label}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryAnalysis({ results }: { results: any }) {
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

function AudioAnalysis({ results }: { results: any }) {
  if (!results) return <div>No audio analysis results available</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Анализ аудио</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Ключевые звуковые события</h4>
            <ul className="list-disc list-inside">
              {results.keyEvents.map((event, index) => (
                <li key={index}>{event.time}: {event.description}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Звуковые эффекты</h4>
            {results.soundEffects.map((effect, index) => (
              <Badge key={index} className={index > 0 ? "ml-2" : ""}>{effect}</Badge>
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Музыкальные паттерны</h4>
            {results.musicPatterns.map((pattern, index) => (
              <Badge key={index} className={index > 0 ? "ml-2" : ""}>{pattern}</Badge>
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Аудио характеристики</h4>
            <p>Темп: {results.audioFeatures.tempo.toFixed(2)} BPM</p>
            <p>Средняя высота тона: {results.audioFeatures.pitch_mean.toFixed(2)} Hz</p>
            <p>Громкость: {results.audioFeatures.loudness.toFixed(2)} RMS</p>
            <p>Среднее значение мел-спектрограммы: {results.audioFeatures.mel_spec_mean.toFixed(2)}</p>
            <p>Среднее значение хромаграммы: {results.audioFeatures.chroma_mean.toFixed(2)}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Разметка на основе звуков и музыки</h4>
            {results.labels.map((label, index) => (
              <Badge key={index} variant="outline" className={index > 0 ? "ml-2" : ""}>{label}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SymbolsAnalysis({ results }: { results: any }) {
  if (!results) return <div>No symbols analysis results available</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Анализ символов</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Выявленные символы</h4>
            <ul className="list-disc list-inside">
              {(results.detectedSymbols || []).map((symbol: any, index: number) => (
                <li key={index}>{symbol.time}: {symbol.description}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Анализ риска</h4>
            <p>Уровень риска: {results.riskAnalysis?.riskLevel || 'Unknown'}</p>
            <p>Общий риск: {(results.riskAnalysis?.overallRisk || 0).toFixed(2)}</p>
            <Badge variant="secondary">{results.riskAnalysis?.riskLabel || 'Unknown'}</Badge>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Частота появления символов</h4>
            <ul className="list-disc list-inside">
              {Object.entries(results.symbolOccurrences || {}).map(([symbol, count]) => (
                <li key={symbol}>{symbol}: {count} раз</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Категории символов</h4>
            {(results.symbolCategories || []).map((category: string, index: number) => (
              <Badge key={index} className={index > 0 ? "ml-2" : ""}>{category}</Badge>
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Разметка на базе символов</h4>
            {(results.labels || []).map((label: string, index: number) => (
              <Badge key={index} variant="outline" className={index > 0 ? "ml-2" : ""}>{label}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ObjectsAnalysis({ results }: { results: any }) {
  if (!results) return <div>No objects analysis results available</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Анализ объектов</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Категории объектов</h4>
            {results.objectCategories.map((category, index) => (
              <Badge key={index} className={index > 0 ? "ml-2" : ""}>{category}</Badge>
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Ключевые объекты</h4>
            <ul className="list-disc list-inside">
              {results.keyObjects.map((object, index) => (
                <li key={index}>{object.time}: {object.description}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Частота появления объектов</h4>
            <ul className="list-disc list-inside">
              {Object.entries(results.objectOccurrences).map(([object, count]) => (
                <li key={object}>{object}: {count} раз</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Взаимодействия объектов</h4>
            <ul className="list-disc list-inside">
              {results.objectInteractions.map((interaction, index) => (
                <li key={index}>{interaction.time}: {interaction.description}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Разметка на базе выявленных объектов</h4>
            {results.labels.map((label, index) => (
              <Badge key={index} variant="outline" className={index > 0 ? "ml-2" : ""}>{label}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PointOfInterestAnalysis({ results }: { results: any }) {
  if (!results) return <div>No point of interest analysis results available</div>

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
                <li key={index}>{zone.time}: {zone.description}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Координаты и площадь тепловых зон</h4>
            {results.heatZoneCoordinates.map((zone, index) => (
              <p key={index}>Зона {index + 1}: X: {zone.x}, Y: {zone.y}, Площадь: {zone.area}px²</p>
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Горячие точки внимания</h4>
            <ul className="list-disc list-inside">
              {results.attentionHotspots.map((hotspot, index) => (
                <li key={index}>{hotspot.time}: {hotspot.description}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Данные отслеживания взгляда</h4>
            <ul className="list-disc list-inside">
              {results.eyeTrackingData.map((data, index) => (
                <li key={index}>{data.time}: X: {data.x}, Y: {data.y}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Разметка на основе точек интереса</h4>
            {results.labels.map((label, index) => (
              <Badge key={index} variant="outline" className={index > 0 ? "ml-2" : ""}>{label}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ScenesAnalysis({ results }: { results: any }) {
  if (!results) return <div>No scenes analysis results available</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Анализ сцен</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Типы сцен</h4>
            {results.sceneTypes && results.sceneTypes.length > 0 ? (
              results.sceneTypes.map((type, index) => (
                <Badge key={index} className={index > 0 ? "ml-2" : ""}>{type}</Badge>
              ))
            ) : (
              <p>Нет доступных типов сцен</p>
            )}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Ключевые сцены</h4>
            {results.keyScenes && results.keyScenes.length > 0 ? (
              <ul className="list-disc list-inside">
                {results.keyScenes.map((scene, index) => (
                  <li key={index}>{scene.time}: {scene.type}</li>
                ))}
              </ul>
            ) : (
              <p>Нет доступных ключевых сцен</p>
            )}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Переходы между сценами</h4>
            {results.sceneTransitions && results.sceneTransitions.length > 0 ? (
              <ul className="list-disc list-inside">
                {results.sceneTransitions.map((transition, index) => (
                  <li key={index}>{transition.time}: {transition.description}</li>
                ))}
              </ul>
            ) : (
              <p>Нет доступных переходов между сценами</p>
            )}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Длительность сцен</h4>
            {results.sceneDurations && results.sceneDurations.length > 0 ? (
              <ul className="list-disc list-inside">
                {results.sceneDurations.map((duration, index) => (
                  <li key={index}>Сцена {index + 1}: {duration} секунд</li>
                ))}
              </ul>
            ) : (
              <p>Нет доступных данных о длительности сцен</p>
            )}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Разметка на базе сцен</h4>
            {results.labels && results.labels.length > 0 ? (
              results.labels.map((label, index) => (
                <Badge key={index} variant="outline" className={index > 0 ? "ml-2" : ""}>{label}</Badge>
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