import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TranscriptionAnalysisProps {
  results: string;
}

export function TranscriptionAnalysis({ results }: TranscriptionAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcription Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <p>{results}</p>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}