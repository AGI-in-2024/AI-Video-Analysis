'use client'

import { useState, useRef, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Upload } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

import { AnalysisSettings, AdvancedSettings, AnalysisResults, AdminDecision } from '@/types/analysis'
import { useAnalysis } from '@/hooks/useAnalysis'
import { AnalysisDialog } from '@/components/AnalysisDialog'
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [analysisSettings, setAnalysisSettings] = useState<AnalysisSettings>({
    summary: false,
    object_detection: false,
    transcription: false,
    audio_analysis: false,
    symbol_detection: false,
    scene_detection: false,
    point_of_interest: false,
    emotion_recognition: false // Add this line
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

      <AnalysisDialog
        videoFile={videoFile}
        analysisSettings={analysisSettings}
        setAnalysisSettings={setAnalysisSettings}
        advancedSettings={advancedSettings}
        setAdvancedSettings={setAdvancedSettings}
        handleAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        handleToggleAllSettings={handleToggleAllSettings}
        handleToggleAllAdvanced={handleToggleAllAdvanced}
      />

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