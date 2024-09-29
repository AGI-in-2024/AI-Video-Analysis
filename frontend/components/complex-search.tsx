'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, HelpCircle, Upload } from "lucide-react"

export function ComplexSearchComponent() {
  const [searchType, setSearchType] = useState('text')
  const [multipleVideos, setMultipleVideos] = useState(false)
  const [outputType, setOutputType] = useState('video')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [confidenceThreshold, setConfidenceThreshold] = useState(50)
  const [includeMetadata, setIncludeMetadata] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageFile(file)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gray-800 border-gray-700 text-gray-100">
      <CardHeader>
        <CardTitle className="text-2xl">Расширенный поиск видео</CardTitle>
        <CardDescription className="text-gray-400">Используйте различные методы поиска для анализа видео</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={searchType} onValueChange={setSearchType} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-700">
            <TabsTrigger value="text" className="data-[state=active]:bg-purple-600">Текстовый поиск</TabsTrigger>
            <TabsTrigger value="context" className="data-[state=active]:bg-purple-600">Контекстный поиск</TabsTrigger>
            <TabsTrigger value="image" className="data-[state=active]:bg-purple-600">Поиск по изображению</TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <TextSearch />
          </TabsContent>

          <TabsContent value="context">
            <ContextSearch />
          </TabsContent>

          <TabsContent value="image">
            <ImageSearch />
          </TabsContent>
        </Tabs>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="image-upload" className="text-base font-semibold mb-2 block">Загрузить изображение</Label>
            <Input 
              id="image-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              className="bg-gray-700 text-gray-100 border-gray-600"
            />
          </div>

          <SearchOptions 
            multipleVideos={multipleVideos} 
            setMultipleVideos={setMultipleVideos}
            outputType={outputType}
            setOutputType={setOutputType}
            confidenceThreshold={confidenceThreshold}
            setConfidenceThreshold={setConfidenceThreshold}
            includeMetadata={includeMetadata}
            setIncludeMetadata={setIncludeMetadata}
          />
        </div>

        <div className="mt-6">
          <Button className="w-full bg-purple-600 hover:bg-purple-700">Выполнить поиск</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TextSearch() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="text-search" className="text-base font-semibold">Текстовый поиск</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-5 w-5 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent className="bg-gray-700 text-gray-100">
              <p>Простой текстовый поиск по содержимому видео.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input id="text-search" placeholder="Введите текст для поиска…" className="bg-gray-700 text-gray-100 border-gray-600" />
    </div>
  )
}

function ContextSearch() {
  const [selectedContext, setSelectedContext] = useState('')
  const [customContext, setCustomContext] = useState('')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="context-search" className="text-base font-semibold">Контекстный поиск</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-5 w-5 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent className="bg-gray-700 text-gray-100">
              <p>Сложный поиск по контексту, темам и сценам в видео.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select value={selectedContext} onValueChange={setSelectedContext}>
        <SelectTrigger className="bg-gray-700 text-gray-100 border-gray-600">
          <SelectValue placeholder="Выберите контекст" />
        </SelectTrigger>
        <SelectContent className="bg-gray-700 text-gray-100 border-gray-600">
          <SelectItem value="sport">Спорт</SelectItem>
          <SelectItem value="music">Музыка</SelectItem>
          <SelectItem value="science">Наука</SelectItem>
          <SelectItem value="custom">Свой вариант</SelectItem>
        </SelectContent>
      </Select>
      {selectedContext === 'custom' && (
        <Input 
          placeholder="Введите свой контекст" 
          value={customContext}
          onChange={(e) => setCustomContext(e.target.value)}
          className="bg-gray-700 text-gray-100 border-gray-600"
        />
      )}
      <Input placeholder="Дополнительные ключевые слова (через запятую)" className="bg-gray-700 text-gray-100 border-gray-600" />
    </div>
  )
}

function ImageSearch() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="image-search" className="text-base font-semibold">Поиск по изображению</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-5 w-5 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent className="bg-gray-700 text-gray-100">
              <p>Поиск по изображению для нахождения похожих объектов или сцен в видео.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input placeholder="Описание искомого объекта или сцены (необязательно)" className="bg-gray-700 text-gray-100 border-gray-600" />
    </div>
  )
}

function SearchOptions({ 
  multipleVideos, 
  setMultipleVideos, 
  outputType, 
  setOutputType,
  confidenceThreshold,
  setConfidenceThreshold,
  includeMetadata,
  setIncludeMetadata
}: {
  multipleVideos: boolean,
  setMultipleVideos: (value: boolean) => void,
  outputType: string,
  setOutputType: (value: string) => void,
  confidenceThreshold: number,
  setConfidenceThreshold: (value: number) => void,
  includeMetadata: boolean,
  setIncludeMetadata: (value: boolean) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="multiple-videos" className="text-base">Поиск по нескольким видео</Label>
        <Switch
          id="multiple-videos"
          checked={multipleVideos}
          onCheckedChange={setMultipleVideos}
          className="data-[state=checked]:bg-purple-600"
        />
      </div>
      <div>
        <Label className="text-base mb-2 block">Формат результатов</Label>
        <RadioGroup value={outputType} onValueChange={setOutputType} className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="video" id="video" className="border-gray-600 text-purple-600" />
            <Label htmlFor="video">Видео</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="timestamp" id="timestamp" className="border-gray-600 text-purple-600" />
            <Label htmlFor="timestamp">Таймкод</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="screenshot" id="screenshot" className="border-gray-600 text-purple-600" />
            <Label htmlFor="screenshot">Скриншот</Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label htmlFor="confidence-threshold" className="text-base mb-2 block">
          Порог уверенности: {confidenceThreshold}%
        </Label>
        <Slider
          id="confidence-threshold"
          min={0}
          max={100}
          step={1}
          value={[confidenceThreshold]}
          onValueChange={(value) => setConfidenceThreshold(value[0])}
          className="w-full"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="include-metadata"
          checked={includeMetadata}
          onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
          className="border-gray-600 text-purple-600"
        />
        <Label htmlFor="include-metadata">Включить метаданные в результаты</Label>
      </div>
    </div>
  )
}