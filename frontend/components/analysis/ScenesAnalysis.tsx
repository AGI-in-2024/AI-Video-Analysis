import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

interface Scene {
  start_frame: number
  start_time: string
  preview_image: string
}

interface ComplexSceneAnalysis {
  scenes: Scene[]
  total_scenes: number
  fps: number
  duration: string
}

interface SimpleSceneAnalysis {
  sceneCount: number
  averageSceneDuration: number
  sceneTransitions: Array<{ from: string; to: string; time: string }>
  dominantColors: Array<{ r: number; g: number; b: number }>
  sceneDescriptions: string[]
  keyScenes: Array<{
    time: string
    type: string
    complexity: number
    motionIntensity: number
    mood: string
    text: string
  }>
  similarityMatrix: number[][]
  labels: string[]
}

interface ScenesAnalysisProps {
  results: {
    complex: ComplexSceneAnalysis
    simple: SimpleSceneAnalysis
  }
}

export function ScenesAnalysis({ results }: ScenesAnalysisProps) {
  const [activeTab, setActiveTab] = useState("complex")
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null)

  const renderComplexAnalysis = () => (
    <div>
      <p>Total Scenes: {results.complex.total_scenes}</p>
      <p>Video Duration: {results.complex.duration}</p>
      <p>FPS: {results.complex.fps}</p>
      <ScrollArea className="h-[400px] mt-4">
        {results.complex.scenes.map((scene, index) => (
          <Button
            key={index}
            onClick={() => setSelectedScene(scene)}
            className="mb-2 w-full text-left"
          >
            Scene {index + 1} - Start Time: {scene.start_time}
          </Button>
        ))}
      </ScrollArea>
      {selectedScene && (
        <div className="mt-4">
          <h3>Selected Scene</h3>
          <p>Start Time: {selectedScene.start_time}</p>
          <img src={`data:image/png;base64,${selectedScene.preview_image}`} alt="Selected Scene" className="w-full mt-2" />
        </div>
      )}
    </div>
  )

  const renderSimpleAnalysis = () => (
    <div>
      <p>Scene Count: {results.simple.sceneCount}</p>
      <p>Average Scene Duration: {results.simple.averageSceneDuration.toFixed(2)} seconds</p>
      <h3 className="mt-4">Key Scenes</h3>
      <ScrollArea className="h-[400px] mt-2">
        {results.simple.keyScenes.map((scene, index) => (
          <div key={index} className="mb-4 p-2 border rounded">
            <p>Time: {scene.time}</p>
            <p>Type: {scene.type}</p>
            <p>Complexity: {scene.complexity.toFixed(2)}</p>
            <p>Motion Intensity: {scene.motionIntensity.toFixed(2)}</p>
            <p>Mood: {scene.mood}</p>
            <p>Text: {scene.text.substring(0, 50)}...</p>
          </div>
        ))}
      </ScrollArea>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scene Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="complex">Complex Analysis</TabsTrigger>
            <TabsTrigger value="simple">Simple Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="complex">
            {renderComplexAnalysis()}
          </TabsContent>
          <TabsContent value="simple">
            {renderSimpleAnalysis()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}