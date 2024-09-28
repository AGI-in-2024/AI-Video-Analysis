'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Search, Play, Pause, SkipForward, Volume2, Maximize, AlertTriangle, FileText, Music, Eye, Camera, Layout, Zap, Settings, X, Upload, Plus } from "lucide-react"
import { ComplexSearchComponent } from './complex-search'
import { VideoAnalysis as VideoAnalysisMoc } from './video-analysis-moc'
import { VideoAnalysis } from './video-analysis'
import { Progress } from "@/components/ui/progress"

// Add this interface for the Video type
interface Video {
  id: number;
  title: string;
  thumbnail: string;
  category: string;
  duration: string;
}

// Mock data for demonstration
const videos: Video[] = [
  { id: 1, title: "Видео для анализа 1", thumbnail: "/placeholder.svg?height=120&width=200", category: "Не аннотировано", duration: "10:30" },
  { id: 2, title: "Видео для анализа 2", thumbnail: "/placeholder.svg?height=120&width=200", category: "Не аннотировано", duration: "5:45" },
  { id: 3, title: "Пример аннотированного видео 1", thumbnail: "/placeholder.svg?height=120&width=200", category: "Аннотировано", duration: "8:20" },
  { id: 4, title: "Пример аннотированного видео 2", thumbnail: "/placeholder.svg?height=120&width=200", category: "Аннотировано", duration: "12:15" },
]

export function VideoAnalysisPlatformComponent() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [testerMode, setTesterMode] = useState(false)
  const [showComplexSearch, setShowComplexSearch] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video)
    setShowAnalysis(false)
  }

  const toggleTesterMode = () => {
    setTesterMode(!testerMode)
    setSelectedVideo(null)
    setShowAnalysis(false)
  }

  const handleAddVideo = () => {
    setShowUploadModal(true)
  }

  const handleUpload = (file: File) => {
    // Simulating upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setShowUploadModal(false)
        setUploadProgress(0)
        // Add the new video to the list (in a real app, you'd get this from the server)
        const newVideo: Video = {
          id: videos.length + 1,
          title: file.name,
          thumbnail: "/placeholder.svg?height=120&width=200",
          category: "Не аннотировано",
          duration: "00:00" // You'd get the real duration from the file
        }
        videos.push(newVideo)
        setSelectedVideo(newVideo)
      }
    }, 500)
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Платформа анализа видео</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="tester-mode"
              checked={testerMode}
              onCheckedChange={toggleTesterMode}
            />
            <Label htmlFor="tester-mode" className="cursor-pointer">Режим тестера</Label>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex items-center space-x-2 mb-6">
        <Input type="text" placeholder="Поиск видео..." className="flex-grow" />
        <Button>
          <Search className="mr-2 h-4 w-4" />
          Поиск
        </Button>
        <Button onClick={() => setShowComplexSearch(!showComplexSearch)}>
          {showComplexSearch ? 'Простой поиск' : 'Расширенный поиск'}
        </Button>
        <Button onClick={handleAddVideo}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить видео
        </Button>
      </div>

      {showComplexSearch && <ComplexSearchComponent />}

      {testerMode ? (
        <TesterModeView
          videos={videos}
          onVideoClick={handleVideoClick}
        />
      ) : (
        <NormalModeView
          videos={videos}
          onVideoClick={handleVideoClick}
        />
      )}

      {selectedVideo && (
        <VideoDetailView
          video={selectedVideo}
          testerMode={testerMode}
          showAnalysis={showAnalysis}
          onClose={() => setSelectedVideo(null)}
          onAnalysisClick={() => setShowAnalysis(true)}
        />
      )}

      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} onUpload={handleUpload} progress={uploadProgress} />
      )}
    </div>
  )
}

function TesterModeView({ videos, onVideoClick }: { videos: Video[], onVideoClick: (video: Video) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <Card key={video.id} className="cursor-pointer" onClick={() => onVideoClick(video)}>
          <CardContent className="p-4">
            <div className="relative">
              <img src={video.thumbnail} alt={video.title} className="w-full h-auto rounded-md" />
              <Badge className="absolute bottom-2 right-2 bg-black bg-opacity-75">{video.duration}</Badge>
            </div>
            <h3 className="font-medium mt-2 line-clamp-2">{video.title}</h3>
            <Badge variant={video.category === "Не аннотировано" ? "destructive" : "secondary"} className="mt-2">
              {video.category}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function NormalModeView({ videos, onVideoClick }: { videos: Video[], onVideoClick: (video: Video) => void }) {
  return (
    <Tabs defaultValue="to-analyze">
      <TabsList className="mb-4">
        <TabsTrigger value="to-analyze">Видео для анализа</TabsTrigger>
        <TabsTrigger value="annotated">Аннотированные примеры</TabsTrigger>
      </TabsList>
      <TabsContent value="to-analyze">
        <VideoGrid videos={videos.filter(v => v.category === "Не аннотировано")} onVideoSelect={onVideoClick} />
      </TabsContent>
      <TabsContent value="annotated">
        <VideoGrid videos={videos.filter(v => v.category === "Аннотировано")} onVideoSelect={onVideoClick} />
      </TabsContent>
    </Tabs>
  )
}

function VideoGrid({ videos, onVideoSelect }: { videos: Video[], onVideoSelect: (video: Video) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <Card key={video.id} className="cursor-pointer" onClick={() => onVideoSelect(video)}>
          <CardContent className="p-4">
            <div className="relative">
              <img src={video.thumbnail} alt={video.title} className="w-full h-auto rounded-md" />
              <Badge className="absolute bottom-2 right-2 bg-black bg-opacity-75">{video.duration}</Badge>
            </div>
            <h3 className="font-medium mt-2 line-clamp-2">{video.title}</h3>
            <Badge variant={video.category === "Не аннотировано" ? "destructive" : "secondary"} className="mt-2">
              {video.category}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function VideoDetailView({ video, testerMode, showAnalysis, onClose, onAnalysisClick }: {
  video: Video,
  testerMode: boolean,
  showAnalysis: boolean,
  onClose: () => void,
  onAnalysisClick: () => void
}) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed inset-4 bg-background rounded-lg shadow-lg overflow-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{video.title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <VideoPlayer video={video} />
          {video.category === "Не аннотировано" && (
            <Button onClick={onAnalysisClick} className="mt-4">Автоаннотировать</Button>
          )}
          {showAnalysis && (
            testerMode ? <VideoAnalysisMoc /> : <VideoAnalysis />
          )}
        </div>
      </div>
    </div>
  )
}

function VideoPlayer({ video }: { video: Video }) {
  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Button size="icon" variant="ghost">
              <Play className="h-6 w-6" />
            </Button>
            <span>{video.duration}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="icon" variant="ghost">
              <Volume2 className="h-6 w-6" />
            </Button>
            <Button size="icon" variant="ghost">
              <Maximize className="h-6 w-6" />
            </Button>
          </div>
        </div>
        <Slider defaultValue={[0]} max={100} step={1} className="mt-2" />
      </div>
    </div>
  )
}

function UploadModal({ onClose, onUpload, progress }: { onClose: () => void, onUpload: (file: File) => void, progress: number }) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">Загрузить видео</h2>
        <Input type="file" accept="video/*" onChange={handleFileChange} className="mb-4" />
        {progress > 0 && (
          <Progress value={progress} className="mb-4" />
        )}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={() => document.querySelector('input[type="file"]')?.click()}>Загрузить</Button>
        </div>
      </div>
    </div>
  )
}