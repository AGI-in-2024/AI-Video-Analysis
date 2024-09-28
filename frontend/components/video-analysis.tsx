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
import { Switch } from "@/components/ui/switch"
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogCancel, 
  AlertDialogAction 
} from "@/components/ui/alert-dialog"

interface AnalysisSettings {
  summary: boolean;
  object_detection: boolean;
  transcription: boolean;
  audio_analysis: boolean;
  symbol_detection: boolean;
  scene_detection: boolean;
  point_of_interest: boolean;
}

interface AdvancedSettings {
  summary: boolean;
  object_detection: boolean;
  transcription: boolean;
  audio_analysis: boolean;
  symbol_detection: boolean;
  scene_detection: boolean;
  point_of_interest: boolean;
}

// Add these type definitions at the top of the file
type Language = {
  name: string;
  primary: boolean;
};

type KeyEvent = {
  time: string;
  description: string;
  type: string;
};

type Keyword = {
  word: string;
  count: number;
  type: string;
};

type HeatZone = {
  time: string;
  description: string;
};

type HeatZoneCoordinate = {
  x: number;
  y: number;
  area: number;
};

type AttentionHotspot = {
  time: string;
  description: string;
};

type EyeTrackingData = {
  time: string;
  x: number;
  y: number;
};

type KeyScene = {
  time: string;
  type: string;
};

type SceneTransition = {
  time: string;
  description: string;
};

type AnalysisResults = {
  summary?: {
    duration: string;
    overallTone: string;
    riskLevel: string;
    keyMoments: Record<string, string>;
    labels: string[];
  };
  transcription?: {
    transcription: string;
    analysis: {
      generationStatus: {
        success: boolean;
        model: string;
      };
      languages: Language[];
      lipSyncAccuracy: number;
      subtitlesStatus: {
        created: boolean;
        synchronized: boolean;
      };
      keyEvents: KeyEvent[];
      sentimentAnalysis: any[]; // Update this type if you have more specific information
      overallSentiment: {
        tone: string;
        value: number;
      };
      keywordAnalysis: Keyword[];
      textLabels: string[];
    };
  };
  audio?: {
    keyEvents: KeyEvent[];
    soundEffects: string[];
    musicPatterns: string[];
    audioFeatures: {
      tempo: number;
      pitch_mean: number;
      loudness: number;
      mel_spec_mean: number;
      chroma_mean: number;
    };
    labels: string[];
  };
  symbols?: {
    detectedSymbols: KeyEvent[];
    riskAnalysis: {
      riskLevel: string;
      overallRisk: number;
      riskLabel: string;
    };
    symbolOccurrences: Record<string, number>;
    symbolCategories: string[];
    labels: string[];
  };
  objects?: {
    objectCategories: string[];
    keyObjects: KeyEvent[];
    objectOccurrences: Record<string, number>;
    objectInteractions: KeyEvent[];
    labels: string[];
  };
  poi?: {
    heatZones: HeatZone[];
    heatZoneCoordinates: HeatZoneCoordinate[];
    attentionHotspots: AttentionHotspot[];
    eyeTrackingData: EyeTrackingData[];
    labels: string[];
  };
  scenes?: {
    sceneTypes: string[];
    keyScenes: KeyScene[];
    sceneTransitions: SceneTransition[];
    sceneDurations: number[];
    labels: string[];
  };
};

export function VideoAnalysis() {
  const [activeTab, setActiveTab] = useState("summary")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([])
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [analysisSettings, setAnalysisSettings] = useState<AnalysisSettings>({
    summary: false,
    object_detection: false,
    transcription: false,
    audio_analysis: false,
    symbol_detection: false,
    scene_detection: false,
    point_of_interest: false
  })
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    summary: false,
    object_detection: false,
    transcription: false,
    audio_analysis: false,
    symbol_detection: false,
    scene_detection: false,
    point_of_interest: false
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
    setShowAnalysisDialog(true)
    setAnalysisProgress(0)
    setAnalysisLogs([])
    
    const formData = new FormData()
    formData.append('video', videoFile)
    formData.append('settings', JSON.stringify(analysisSettings))
    formData.append('advancedSettings', JSON.stringify(advancedSettings))

    try {
      const response = await fetch('http://localhost:5000/api/analyze-video', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Response body is not readable')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = new TextDecoder().decode(value)
        const lines = text.split('\n').filter(line => line.trim() !== '')

        lines.forEach(line => {
          try {
            const data = JSON.parse(line)
            if (data.progress) {
              setAnalysisProgress(data.progress)
            }
            if (data.log) {
              setAnalysisLogs(prev => [...prev, data.log])
            }
            if (data.results) {
              setAnalysisResults(data.results)
            }
          } catch (e) {
            console.error('Error parsing line:', line, e)
          }
        })
      }

    } catch (error) {
      console.error('Error during analysis:', error)
      alert(`Error during analysis: ${error}`)
    } finally {
      setIsAnalyzing(false)
      setShowAnalysisDialog(false)
    }
  }

  const handleToggleAllSettings = (checked: boolean) => {
    setAnalysisSettings(prev => {
      const newSettings = { ...prev }
      Object.keys(newSettings).forEach(key => {
        newSettings[key as keyof AnalysisSettings] = checked
      })
      return newSettings
    })
  }

  const handleToggleAllAdvanced = (checked: boolean) => {
    setAdvancedSettings(prev => {
      const newSettings = { ...prev }
      Object.keys(newSettings).forEach(key => {
        newSettings[key as keyof AdvancedSettings] = checked
      })
      return newSettings
    })
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
            <div className="flex justify-between items-center">
              <Label>Select All</Label>
              <Checkbox
                checked={Object.values(analysisSettings).every(Boolean)}
                onCheckedChange={handleToggleAllSettings}
              />
            </div>
            {Object.entries(analysisSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between space-x-2">
                <Label htmlFor={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={value}
                    onCheckedChange={(checked: CheckedState) => 
                      setAnalysisSettings(prev => ({ ...prev, [key]: checked === true }))
                    }
                  />
                  <Switch
                    checked={advancedSettings[key as keyof AdvancedSettings]}
                    onCheckedChange={(checked) => 
                      setAdvancedSettings(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center">
              <Label>Use Advanced Algorithms for All</Label>
              <Switch
                checked={Object.values(advancedSettings).every(Boolean)}
                onCheckedChange={handleToggleAllAdvanced}
              />
            </div>
            <Button onClick={handleAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Analysis Progress</AlertDialogTitle>
            <AlertDialogDescription>
              <Progress value={analysisProgress} className="w-full" />
              <ScrollArea className="h-[200px] w-full mt-4">
                {analysisLogs.map((log, index) => (
                  <p key={index}>{log}</p>
                ))}
              </ScrollArea>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    "Безопасно", "18+", "Насилие", "Наркотики", "Алкогоь", "Нецензурная лексика"
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
    if (results && results.summary) {
      setSelectedLabels(results.summary.labels || [])
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
function TranscriptionAnalysis({ results }: { results: AnalysisResults['transcription'] }) {
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
                <p>Общее настроение: {analysis.overallSentiment.tone} (Значие: {analysis.overallSentiment.value.toFixed(2)})</p>
              )}
            </div>
          )}
          {analysis.keywordAnalysis && analysis.keywordAnalysis.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Анализ ключевых слов</h4>
              <ul className="list-disc list-inside">
                {analysis.keywordAnalysis.map((keyword, index) => (
                  <li key={index}>{keyword.word} (Количество: {keyword.count}, Тип: {keyword.type})</li>
                ))}
              </ul>
            </div>
          )}
          {analysis.textLabels && analysis.textLabels.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Текстовые метки</h4>
              {analysis.textLabels.map((label, index) => (
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

function SummaryAnalysis({ results }: { results: AnalysisResults['summary'] }) {
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

function AudioAnalysis({ results }: { results: AnalysisResults['audio'] }) {
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
              {results.keyEvents.map((event: KeyEvent, index: number) => (
                <li key={index}>{event.time}: {event.description}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Звуковые эффекты</h4>
            {results.soundEffects.map((effect: string, index: number) => (
              <Badge key={index} className={index > 0 ? "ml-2" : ""}>{effect}</Badge>
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Музыкальные паттерны</h4>
            {results.musicPatterns.map((pattern: string, index: number) => (
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
            <h4 className="font-semibold mb-2">Разметка на основе звуко и музыки</h4>
            {results.labels.map((label: string, index: number) => (
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
              {Object.entries(results.symbolOccurrences || {}).map(([symbol, count]: [string, unknown]) => (
                <li key={symbol}>{symbol}: {count as number} раз</li>
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
            {results.objectCategories.map((category: string, index: number) => (
              <Badge key={index} className={index > 0 ? "ml-2" : ""}>{category}</Badge>
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Ключевые объекты</h4>
            <ul className="list-disc list-inside">
              {results.keyObjects.map((object: KeyEvent, index: number) => (
                <li key={index}>{object.time}: {object.description}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Частота появления объектов</h4>
            <ul className="list-disc list-inside">
              {Object.entries(results.objectOccurrences || {}).map(([object, count]: [string, unknown]) => (
                <li key={object}>{object}: {count as number} раз</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Взаимодействия объектов</h4>
            <ul className="list-disc list-inside">
              {results.objectInteractions.map((interaction: KeyEvent, index: number) => (
                <li key={index}>{interaction.time}: {interaction.description}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Размтка на базе выявленных объектов</h4>
            {results.labels.map((label: string, index: number) => (
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
              {results.heatZones.map((zone: HeatZone, index: number) => (
                <li key={index}>{zone.time}: {zone.description}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Координаты и площадь тепловых зон</h4>
            {results.heatZoneCoordinates.map((zone: HeatZoneCoordinate, index: number) => (
              <p key={index}>Зона {index + 1}: X: {zone.x}, Y: {zone.y}, Площадь: {zone.area}px²</p>
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Горячие точки внимания</h4>
            <ul className="list-disc list-inside">
              {results.attentionHotspots.map((hotspot: AttentionHotspot, index: number) => (
                <li key={index}>{hotspot.time}: {hotspot.description}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Данные отслеживания взгляда</h4>
            <ul className="list-disc list-inside">
              {results.eyeTrackingData.map((data: EyeTrackingData, index: number) => (
                <li key={index}>{data.time}: X: {data.x}, Y: {data.y}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Разметка на основе точек итереса</h4>
            {results.labels.map((label: string, index: number) => (
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
              results.sceneTypes.map((type: string, index: number) => (
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
                {results.keyScenes.map((scene: KeyScene, index: number) => (
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
                {results.sceneTransitions.map((transition: SceneTransition, index: number) => (
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
                {results.sceneDurations.map((duration: number, index: number) => (
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
              results.labels.map((label: string, index: number) => (
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