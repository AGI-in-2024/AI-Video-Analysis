'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Volume2, Maximize, RotateCcw, Bookmark, MessageSquare, Scissors } from "lucide-react"

interface VideoPlayerProps {
  videoUrl: string | null
}

export function VideoPlayerComponent({ videoUrl }: VideoPlayerProps) {
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

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        handlePlayPause()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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

  if (!videoUrl) {
    return null
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="w-full aspect-video bg-black"
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Slider
              value={[currentTime]}
              max={duration}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full mx-2"
            />
            <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={toggleMute}>
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
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Speed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={toggleLoop}>
                <RotateCcw className={`h-4 w-4 ${loop ? 'text-primary' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={addBookmark}>
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={addAnnotation}>
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={setClip}>
                <Scissors className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}
    </div>
  )
}