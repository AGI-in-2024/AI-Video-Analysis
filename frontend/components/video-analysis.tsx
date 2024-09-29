'use client'

import { useState, useRef, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Upload, Play, Pause, Volume2, Maximize, RotateCcw, Bookmark, MessageSquare, Scissors } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { AnalysisSettings, AdvancedSettings, AnalysisResults, AdminDecision } from '@/types/analysis'
import { useAnalysis } from '@/hooks/useAnalysis'
import { AnalysisTabs } from '@/components/AnalysisTabs'
import { POIAnalysis } from '@/components/analysis/POIAnalysis'
import { ScenesAnalysis } from '@/components/analysis/ScenesAnalysis'
import { TranscriptionAnalysis } from '@/components/analysis/TranscriptionAnalysis'
import { AdminPanel } from '@/components/analysis/AdminPanel'
import { AudioAnalysis } from '@/components/analysis/AudioAnalysis'
import { ObjectsAnalysis } from '@/components/analysis/ObjectsAnalysis'
import { SymbolsAnalysis } from '@/components/analysis/SymbolsAnalysis'

export function VideoAnalysis() {
  const [activeTab, setActiveTab] = useState("summary")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
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

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [loop, setLoop] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [annotations, setAnnotations] = useState<{[time: number]: string}>({})
  const [clipStart, setClipStart] = useState<number | null>(null)
  const [clipEnd, setClipEnd] = useState<number | null>(null)

  const { 
    isAnalyzing, 
    analysisProgress, 
    analysisLogs, 
    showAnalysisDialog, 
    setShowAnalysisDialog, 
    handleAnalyze 
  } = useAnalysis(
    videoFile, 
    analysisSettings, 
    advancedSettings,
    useCallback((results: AnalysisResults) => {
      setAnalysisResults(results)
      setActiveTab("summary")
    }, [])
  )

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setVideoFile(file)
      const videoUrl = URL.createObjectURL(file)
      setVideoUrl(videoUrl)
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

  const handleAdminDecision = useCallback((decision: AdminDecision) => {
    setAnalysisResults(prev => {
      if (!prev) return null
      return {
        ...prev,
        adminDecision: decision
      }
    })

    sendAdminDecisionToBackend(decision)
  }, [])

  const sendAdminDecisionToBackend = async (decision: AdminDecision) => {
    try {
      const response = await fetch('/api/admin-decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(decision),
      })

      if (!response.ok) {
        throw new Error('Failed to save admin decision')
      }

      // Handle successful save (e.g., show a success message)
    } catch (error) {
      console.error('Error saving admin decision:', error)
      // Handle error (e.g., show an error message to the user)
    }
  }

  // Video player functions
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const handleSeek = (value: number[]) => {
    const newTime = value[0]
    setCurrentTime(newTime)
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handlePlaybackSpeedChange = (value: string) => {
    const speed = parseFloat(value)
    setPlaybackSpeed(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }

  const toggleLoop = () => {
    setLoop(!loop)
    if (videoRef.current) {
      videoRef.current.loop = !loop
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
  }

  const addBookmark = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime
      setBookmarks([...bookmarks, currentTime])
    }
  }

  const removeBookmark = (time: number) => {
    setBookmarks(bookmarks.filter(bookmark => bookmark !== time))
  }

  const addAnnotation = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime
      const annotation = prompt("Enter annotation:")
      if (annotation) {
        setAnnotations({...annotations, [currentTime]: annotation})
      }
    }
  }

  const removeAnnotation = (time: number) => {
    const newAnnotations = {...annotations}
    delete newAnnotations[time]
    setAnnotations(newAnnotations)
  }

  const setClip = () => {
    if (videoRef.current) {
      if (clipStart === null) {
        setClipStart(videoRef.current.currentTime)
      } else if (clipEnd === null) {
        setClipEnd(videoRef.current.currentTime)
      } else {
        setClipStart(videoRef.current.currentTime)
        setClipEnd(null)
      }
    }
  }

  const clearClip = () => {
    setClipStart(null)
    setClipEnd(null)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const AnalysisSettingsDialog = () => (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-100">Analysis Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(analysisSettings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <Label htmlFor={key} className="text-gray-300 capitalize">{key.replace('_', ' ')}</Label>
            <Switch
              id={key}
              checked={value}
              onCheckedChange={(checked) => setAnalysisSettings(prev => ({ ...prev, [key]: checked }))}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
        ))}
        <Button 
          onClick={handleAnalyze} 
          disabled={!videoFile || isAnalyzing} 
          className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
        >
          {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-4">
      <input
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      <Button onClick={() => fileInputRef.current?.click()} className="mb-4 bg-purple-600 hover:bg-purple-700">
        <Upload className="mr-2 h-4 w-4" /> Upload Video
      </Button>
      {videoFile && <p className="mb-4 text-gray-300">Selected file: {videoFile.name}</p>}

      {videoUrl && (
        <div className="relative mb-4">
          <video
            ref={videoRef}
            className="w-full aspect-video bg-black rounded-lg"
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          {showControls && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 rounded-b-lg">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={handlePlayPause} className="text-white hover:text-purple-400">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="w-full mx-2"
                />
                <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:text-purple-400">
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:text-purple-400">
                    {isMuted ? <Volume2 className="h-4 w-4 text-red-500" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={[volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-24 mx-2"
                  />
                </div>
                <Select value={playbackSpeed.toString()} onValueChange={handlePlaybackSpeedChange}>
                  <SelectTrigger className="w-[100px] bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Speed" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="0.5">0.5x</SelectItem>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="1.5">1.5x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={toggleLoop} className="text-white hover:text-purple-400">
                    <RotateCcw className={`h-4 w-4 ${loop ? 'text-purple-400' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={addBookmark} className="text-white hover:text-purple-400">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={addAnnotation} className="text-white hover:text-purple-400">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={setClip} className="text-white hover:text-purple-400">
                    <Scissors className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between text-sm mt-1 text-gray-300">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <AnalysisSettingsDialog />

      <AlertDialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <AlertDialogContent className="bg-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Analysis Progress</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              <Progress value={analysisProgress} className="w-full" />
              <ScrollArea className="h-[200px] w-full mt-4 border border-gray-700 rounded">
                {analysisLogs.map((log, index) => (
                  <p key={index} className="p-2 border-b border-gray-700 last:border-b-0">{log}</p>
                ))}
              </ScrollArea>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AnalysisTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        analysisResults={analysisResults}
      >
        <TabsContent value="summary">
          {analysisResults && (
            <AdminPanel 
              setActiveTab={setActiveTab} 
              results={analysisResults} 
              onDecisionMade={handleAdminDecision}
            />
          )}
        </TabsContent>
        <TabsContent value="transcription">
          {analysisResults?.audio?.transcription && (
            <TranscriptionAnalysis results={analysisResults.audio.transcription} />
          )}
        </TabsContent>
        <TabsContent value="audio">
          {analysisResults?.audio && (
            <AudioAnalysis results={analysisResults.audio} />
          )}
        </TabsContent>
        <TabsContent value="symbols">
          {analysisResults?.symbols && (
            <SymbolsAnalysis results={analysisResults.symbols} />
          )}
        </TabsContent>
        <TabsContent value="objects">
          {analysisResults?.objects && (
            <ObjectsAnalysis results={analysisResults.objects} />
          )}
        </TabsContent>
        <TabsContent value="poi">
          {analysisResults?.poi && <POIAnalysis results={analysisResults.poi} />}
        </TabsContent>
        <TabsContent value="scenes">
          {analysisResults?.scenes && <ScenesAnalysis results={analysisResults.scenes} />}
        </TabsContent>
      </AnalysisTabs>
    </div>
  )
}