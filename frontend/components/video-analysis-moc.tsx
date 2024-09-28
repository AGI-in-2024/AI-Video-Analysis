'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { AlertCircle, CheckCircle2, Clock, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export function VideoAnalysis() {
  const [activeTab, setActiveTab] = useState("summary")

  const tabs = [
    { value: "summary", label: "Сводка" },
    { value: "transcription", label: "Транскрибация" },
    { value: "audio", label: "Аудио анализ" },
    { value: "symbols", label: "Символы" },
    { value: "objects", label: "Объекты" },
    { value: "poi", label: "Точки интереса" },
    { value: "scenes", label: "Сцены" },
    { value: "admin", label: "Админ панель" },
  ]

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="summary">
        <SummaryAnalysis />
      </TabsContent>
      <TabsContent value="transcription">
        <TranscriptionAnalysis />
      </TabsContent>
      <TabsContent value="audio">
        <AudioAnalysis />
      </TabsContent>
      <TabsContent value="symbols">
        <SymbolsAnalysis />
      </TabsContent>
      <TabsContent value="objects">
        <ObjectsAnalysis />
      </TabsContent>
      <TabsContent value="poi">
        <PointOfInterestAnalysis />
      </TabsContent>
      <TabsContent value="scenes">
        <ScenesAnalysis />
      </TabsContent>
      <TabsContent value="admin">
        <AdminPanel setActiveTab={setActiveTab} />
      </TabsContent>
    </Tabs>
  )
}

function AdminPanel({ setActiveTab }) {
  const [customLabel, setCustomLabel] = useState("")
  const [selectedLabels, setSelectedLabels] = useState([])

  const predefinedLabels = [
    "Безопасно", "18+", "Насилие", "Наркотики", "Алкоголь", "Нецензурная лексика"
  ]

  const handleLabelToggle = (label) => {
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

function TranscriptionAnalysis() {
  const [selectedEvent, setSelectedEvent] = useState(null)

  const keyEvents = [
    { time: '00:15', description: 'Драматическое событие: внезапный громкий звук', type: 'Модерация' },
    { time: '01:30', description: 'Потенциальное нарушение правил: упоминание запрещенных веществ', type: '18+' },
    { time: '02:45', description: 'Вирусный момент: неожиданная шутка', type: 'Вирусный' },
    { time: '03:45', description: 'Подходящий момент для рекламы', type: 'Реклама' },
  ]

  const sentimentData = [
    { name: '00:00 - 01:30', value: 0.2 },
    { name: '01:31 - 03:00', value: 0.8 },
    { name: '03:01 - 06:30', value: 0.9 },
  ]

  const keywordData = [
    { word: 'криптовалюта', count: 5, type: 'Сленг' },
    { word: 'artificial intelligence', count: 3, type: 'Иностранные слова' },
    { word: 'блокчейн', count: 2, type: 'Сленг' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Транскрибация и анализ речи</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Генерация текста</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Текст успешно сгенерирован</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Использован WhisperX-FastAPI</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>Русский (основной)</Badge>
                  <Badge variant="secondary">Английский</Badge>
                  <Badge variant="secondary">Испанский</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Синхронизация и субтитры</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Точность синхронизации губ</span>
                      <span className="text-sm font-medium">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Субтитры созданы и синхронизированы</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Временная шкала ключевых событий</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-border"></div>
                {keyEvents.map((event, index) => (
                  <div
                    key={index}
                    className="relative pl-4 pb-4 cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-primary"></div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{event.time}</span>
                      <Badge variant={event.type === 'Модерация' || event.type === '18+' ? 'destructive' : 'secondary'}>
                        {event.type}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1">{event.description}</p>
                  </div>
                ))}
              </div>
              {selectedEvent && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Детали события</h4>
                  <p><strong>Время:</strong> {selectedEvent.time}</p>
                  <p><strong>Описание:</strong> {selectedEvent.description}</p>
                  <p><strong>Тип:</strong> {selectedEvent.type}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Анализ тональности</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sentimentData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                <p className="font-medium">Общая тональность: Позитивная (0.7)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Анализ ключевых слов и выражений</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-4">
                  {keywordData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.word}</p>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">{item.count}</span>
                        <span className="text-sm text-muted-foreground">упоминаний</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Разметка текста</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Highlights</Badge>
                <Badge variant="outline">Base</Badge>
                <Badge variant="destructive">18+</Badge>
                <Badge variant="secondary">Gray</Badge>
                <Badge variant="default">Black</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Сводка анализа видео</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Общая информация</h4>
            <p>Длительность: 6:30 минут</p>
            <p>Общая тональность: Позитивная</p>
            <p>Уровень риска: Средний</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Ключевые моменты</h4>
            <ul className="list-disc list-inside">
              <li>Транскрибация: 3 ключевых события</li>
              <li>Аудио: 3 значимых звуковых эффекта</li>
              <li>Символы: 3 выявленных символа</li>
              <li>Объекты: 3 ключевых объекта</li>
              <li>Точки интереса: 3 тепловые зоны</li>
              <li>Сцены: 3 основных типа сцен</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Общая разметка</h4>
            <Badge variant="outline">Highlights</Badge>
            <Badge variant="outline" className="ml-2">Base</Badge>
            <Badge variant="destructive" className="ml-2">18+</Badge>
            <Badge variant="secondary" className="ml-2">Gray</Badge>
            <Badge variant="default" className="ml-2">Black</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AudioAnalysis() {
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
              <li>Событие 1 (00:30)</li>
              <li>Событие 2 (02:15)</li>
              <li>Событие 3 (04:00)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Звуковые эффекты</h4>
            <Badge>Выстрел</Badge>
            <Badge className="ml-2">Взрыв</Badge>
            <Badge className="ml-2">Сирена</Badge>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Музыкальные паттерны</h4>
            <Badge>Рок</Badge>
            <Badge className="ml-2">Классика</Badge>
            <Badge className="ml-2">Электронная</Badge>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Разметка на основе звуков и музыки</h4>
            <Badge variant="outline">Highlights</Badge>
            <Badge variant="outline" className="ml-2">Base</Badge>
            <Badge variant="destructive" className="ml-2">18+</Badge>
            <Badge variant="secondary" className="ml-2">Gray</Badge>
            <Badge variant="default" className="ml-2">Black</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SymbolsAnalysis() {
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
              <li>Символ 1 (00:45)</li>
              <li>Символ 2 (02:30)</li>
              <li>Символ 3 (03:15)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Анализ риска</h4>
            <p>Общий уровень риска: Средний (0.5)</p>
            <Badge variant="warning">Потенциально опасный</Badge>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Разметка на базе символов</h4>
            <Badge variant="outline">Highlights</Badge>
            <Badge variant="outline" className="ml-2">Base</Badge>
            <Badge variant="destructive" className="ml-2">18+</Badge>
            <Badge variant="secondary" className="ml-2">Gray</Badge>
            <Badge variant="default" className="ml-2">Black</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ObjectsAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Анализ объектов</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Разметка объектов</h4>
            <Badge>Люди</Badge>
            <Badge className="ml-2">Предметы</Badge>
            <Badge className="ml-2">Природа</Badge>
            <Badge className="ml-2">Транспорт</Badge>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Ключевые объекты</h4>
            <ul className="list-disc list-inside">
              <li>Объект 1 (01:00)</li>
              <li>Объект 2 (03:45)</li>
              <li>Объект 3 (05:30)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Разметка на базе выявленных объектов</h4>
            <Badge variant="outline">Highlights</Badge>
            <Badge variant="outline" className="ml-2">Base</Badge>
            <Badge variant="destructive" className="ml-2">18+</Badge>
            <Badge variant="secondary" className="ml-2">Gray</Badge>
            <Badge variant="default" className="ml-2">Black</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PointOfInterestAnalysis() {
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
              <li>Мимика (00:30 - 00:45)</li>
              <li>Движущийся объект (02:15 - 02:30)</li>
              <li>Текст на экране (04:00 - 04:15)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Координаты и площадь тепловых зон</h4>
            <p>Зона 1: X: 100, Y: 200, Площадь: 5000px²</p>
            <p>Зона 2: X: 300, Y: 150, Площадь: 3000px²</p>
            <p>Зона 3: X: 500, Y: 400, Площадь: 2000px²</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ScenesAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Анализ сцен</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Типы сцен</h4>
            <Badge>Действие</Badge>
            <Badge className="ml-2">Диалог</Badge>
            <Badge className="ml-2">Пейзаж</Badge>
            <Badge className="ml-2">Монтаж</Badge>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Ключевые сцены</h4>
            <ul className="list-disc list-inside">
              <li>Сцена 1 (00:00 - 01:30): Действие</li>
              <li>Сцена 2 (01:31 - 03:00): Диалог</li>
              <li>Сцена 3 (03:01 - 04:30): Пейзаж</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Разметка на базе сцен</h4>
            <Badge variant="outline">Highlights</Badge>
            <Badge variant="outline" className="ml-2">Base</Badge>
            <Badge variant="destructive" className="ml-2">18+</Badge>
            <Badge variant="secondary" className="ml-2">Gray</Badge>
            <Badge variant="default" className="ml-2">Black</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}