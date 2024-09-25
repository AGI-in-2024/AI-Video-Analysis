'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, Play, Pause, SkipForward, Volume2, Maximize, FileText, Image, MessageSquare, Layers, Wand2, Settings } from "lucide-react"
import axios from 'axios';
import { ThemeProvider } from "../components/theme-provider"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"

interface Detection {
  class: string;
  confidence: number;
}

interface AnalysisResults {
  [frame: string]: Detection[];
}

interface OcrResults {
  [frame: string]: string;
}

type TranscriptionResults = string;

export function VideoAnalysisServiceComponent() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [ocrResults, setOcrResults] = useState<OcrResults | null>(null);
  const [transcriptionResults, setTranscriptionResults] = useState<TranscriptionResults | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const [showFrameDetails, setShowFrameDetails] = useState(false)
  const [showAIInsights, setShowAIInsights] = useState(false)

  // Analysis settings
  const [transcriptionModel, setTranscriptionModel] = useState("whisper")
  const [ocrModel, setOcrModel] = useState("tesseract")
  const [imageToTextModel, setImageToTextModel] = useState("llava")
  const [segmentationModel, setSegmentationModel] = useState("mask-rcnn")
  const [sentimentModel, setSentimentModel] = useState("bert")

  // Other settings
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5)
  const [language, setLanguage] = useState("russian")

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log(`File selected: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

    setIsProcessing(true);
    setProgress(0);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('video', file);

    try {
      console.log('Sending request to backend...');
      const response = await axios.post('http://localhost:5000/api/analyze-video', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgress(percentCompleted);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });

      console.log('Response received from backend');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      if (response.data.results) {
        console.log('Setting analysis results...');
        setAnalysisResults(response.data.results.object_detection);
        setOcrResults(response.data.results.ocr);
        setTranscriptionResults(response.data.results.transcription.transcription || response.data.results.transcription);
        setVideoUrl(URL.createObjectURL(file));

        console.log('Object detection results:', response.data.results.object_detection);
        console.log('OCR results:', response.data.results.ocr);
        console.log('Transcription results:', response.data.results.transcription);
      } else {
        console.error('Unexpected response structure:', response.data);
        setErrorMessage('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error analyzing video:', error);
      setErrorMessage('Error analyzing video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  };

  const handleFrameSelect = (frame: string) => {
    setSelectedFrame(frame)
    setShowFrameDetails(true)
  }

  const generateAIInsights = () => {
    // TODO: Implement AI insights generation
    setShowAIInsights(true)
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="gazprom-media-theme">
      <div className="container mx-auto p-4 max-w-6xl bg-background text-foreground">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-primary">Газпром Медиа Холдинг - Сервис анализа видео</h1>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              {theme === "light" ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" onClick={() => setShowSettings(true)}>
              <Settings className="mr-2 h-4 w-4" /> Настройки
            </Button>
            {videoUrl && (
              <Button variant="outline" onClick={() => setShowReport(true)}>
                <FileText className="mr-2 h-4 w-4" /> Посмотреть отчет
              </Button>
            )}
          </div>
        </div>

        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Настройки анализа</DialogTitle>
              <DialogDescription>
                Выберите модели и параетры для каждого типа анализа.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transcription-model" className="text-right">
                  Модель транскрибации
                </Label>
                <Select value={transcriptionModel} onValueChange={setTranscriptionModel}>
                  <SelectTrigger id="transcription-model">
                    <SelectValue placeholder="Выберите модель" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whisper">Whisper</SelectItem>
                    <SelectItem value="deepspeech">DeepSpeech</SelectItem>
                    <SelectItem value="wav2vec">Wav2Vec</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ocr-model" className="text-right">
                  Модель OCR
                </Label>
                <Select value={ocrModel} onValueChange={setOcrModel}>
                  <SelectTrigger id="ocr-model">
                    <SelectValue placeholder="Выберите модель" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tesseract">Tesseract</SelectItem>
                    <SelectItem value="easyocr">EasyOCR</SelectItem>
                    <SelectItem value="paddleocr">PaddleOCR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image-to-text-model" className="text-right">
                  Модель картинка в текст
                </Label>
                <Select value={imageToTextModel} onValueChange={setImageToTextModel}>
                  <SelectTrigger id="image-to-text-model">
                    <SelectValue placeholder="Выберите модель" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llava">LLaVA</SelectItem>
                    <SelectItem value="clip">CLIP</SelectItem>
                    <SelectItem value="blip">BLIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="segmentation-model" className="text-right">
                  Модель сегментации
                </Label>
                <Select value={segmentationModel} onValueChange={setSegmentationModel}>
                  <SelectTrigger id="segmentation-model">
                    <SelectValue placeholder="Выберите модель" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mask-rcnn">Mask R-CNN</SelectItem>
                    <SelectItem value="yolact">YOLACT</SelectItem>
                    <SelectItem value="detectron2">Detectron2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sentiment-model" className="text-right">
                  Модель анализа тональности
                </Label>
                <Select value={sentimentModel} onValueChange={setSentimentModel}>
                  <SelectTrigger id="sentiment-model">
                    <SelectValue placeholder="Выберте модель" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bert">BERT</SelectItem>
                    <SelectItem value="roberta">RoBERTa</SelectItem>
                    <SelectItem value="xlnet">XLNet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confidence-threshold" className="text-right">
                  Порог уверености
                </Label>
                <div className="col-span-3 flex items-center gap-4">
                  <Slider
                    id="confidence-threshold"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[confidenceThreshold]}
                    onValueChange={(value) => setConfidenceThreshold(value[0])}
                    className="flex-grow"
                  />
                  <span className="w-12 text-right">{confidenceThreshold.toFixed(2)}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="language" className="text-right">
                  Язык
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Выберите язык" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="russian">Русский</SelectItem>
                    <SelectItem value="english">Английский</SelectItem>
                    <SelectItem value="multilingual">Многоязычный</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="mb-4">
          <Label htmlFor="file-upload">Загрузить видео</Label>
          <div className="flex items-center space-x-2 mt-1">
            <Input id="file-upload" type="file" onChange={handleFileUpload} />
            <Button>
              <Upload className="mr-2 h-4 w-4" /> Загрузить
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {errorMessage}
          </div>
        )}

        {isProcessing && (
          <div className="mb-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center mt-2">Обработка видео: {progress}%</p>
          </div>
        )}

        {videoUrl && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Видео</h2>
            <div className="relative">
              <video className="w-full aspect-video bg-black" controls onTimeUpdate={handleTimeUpdate}>
                <source src={videoUrl} type="video/mp4" />
              </video>
              <div className="absolute bottom-4 right-4 space-x-2">
                <Button variant="secondary" size="sm" onClick={() => setShowFrameDetails(true)}>
                  <Image className="mr-2 h-4 w-4" /> Кадры
                </Button>
                <Button variant="secondary" size="sm" onClick={generateAIInsights}>
                  <Wand2 className="mr-2 h-4 w-4" /> AI Инсайты
                </Button>
              </div>
            </div>
          </div>
        )}

        {videoUrl && (
          <Tabs defaultValue="transcription" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="transcription">Транскрибация</TabsTrigger>
              <TabsTrigger value="ocr">OCR</TabsTrigger>
              <TabsTrigger value="image-to-text">Картинка в текст</TabsTrigger>
              <TabsTrigger value="segmentation">Сегментация</TabsTrigger>
              <TabsTrigger value="sentiment">Тональность</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transcription" className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Транскрипция:</h3>
                {transcriptionResults ? (
                  <pre className="whitespace-pre-wrap">
                    {typeof transcriptionResults === 'object' 
                      ? JSON.stringify(transcriptionResults, null, 2)
                      : transcriptionResults}
                  </pre>
                ) : (
                  <p>Транскрипция не доступна</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="ocr" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Frame</TableHead>
                    <TableHead>Recognized Text</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ocrResults && Object.entries(ocrResults).map(([frame, text]) => (
                    <TableRow key={frame}>
                      <TableCell>{frame}</TableCell>
                      <TableCell>{text}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="image-to-text" className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Описание изображений:</h3>
                <p>
                  [00:20] Кадр показывает современный офис с сотрудниками, работающими за компьютерами.<br />
                  [00:45] На экране демонстрируется график роста использования ИИ в различных отраслях.<br />
                  [01:15] Видно лабораторию с учеными, работающими над новыми технологиями.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="segmentation" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Frame</TableHead>
                    <TableHead>Detected Objects</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysisResults && Object.entries(analysisResults).map(([frame, detections]) => (
                    <TableRow key={frame}>
                      <TableCell>{frame}</TableCell>
                      <TableCell>
                        {detections.map((detection, index) => (
                          <div key={index}>
                            <span>{detection.class}</span>
                            <Badge variant="outline">{detection.confidence.toFixed(2)}</Badge>
                          </div>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="sentiment" className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Тональность:</h3>
                <p>
                  [00:10] Позитивная<br />
                  [00:30] Нейтральная<br />
                  [01:00] Негативная
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <Dialog open={showFrameDetails} onOpenChange={setShowFrameDetails}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Детали кадра</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4">
              {analysisResults && Object.entries(analysisResults).map(([frame, detections]) => (
                <div key={frame} className="cursor-pointer" onClick={() => handleFrameSelect(frame)}>
                  <img src={`/api/frame/${frame}`} alt={`Frame ${frame}`} className="w-full h-auto" />
                  <p className="text-sm mt-1">Frame: {frame}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showAIInsights} onOpenChange={setShowAIInsights}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>AI Инсайты</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <h3 className="font-semibold">Ключевые моменты:</h3>
              <ul className="list-disc list-inside">
                <li>Высокая активность в кадрах 120-150</li>
                <li>Обнаружено 5 уникальных персон</li>
                <li>Преобладающая эмоция: позитивная</li>
              </ul>
              <h3 className="font-semibold">Рекомендации:</h3>
              <p>Рассмотрите возможность использования сегмента 02:15-03:00 для промо-материалов.</p>
            </div>
          </DialogContent>
        </Dialog>

        {showReport && (
          <Dialog open={showReport} onOpenChange={setShowReport}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Отчет по анализу видео</DialogTitle>
                <DialogDescription>
                  Сводка результатов анализа видео по всем типам обработки.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <h3 className="text-lg font-semibold">Основные метрики:</h3>
                <ul className="list-disc list-inside">
                  <li>Длительность видео: {/* Add actual duration */}</li>
                  <li>Количество распознанных слов: {transcriptionResults?.split(' ').length || 0}</li>
                  <li>Обнаружено объектов: {Object.values(analysisResults || {}).flat().length}</li>
                  {/* Add more metrics based on actual analysis results */}
                </ul>
                {/* Add more sections based on actual analysis results */}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ThemeProvider>
  )
}