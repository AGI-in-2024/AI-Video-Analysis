import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { AnalysisResults, Language, KeyEvent, Keyword } from '@/types/analysis'

interface TranscriptionAnalysisProps {
  results: {
    transcription: string;
    analysis?: {
      // Add the expected properties of the analysis object
      generationStatus: { success: boolean; model: string };
      languages: { name: string; primary: boolean }[];
      lipSyncAccuracy: number;
      subtitlesStatus: { created: boolean; synchronized: boolean };
      keyEvents: { time: string; description: string; type: string }[];
      sentimentAnalysis: { time: string; value: number }[];
      overallSentiment: { tone: string; value: number };
      keywordAnalysis: { word: string; count: number; type: string }[];
      textLabels: string[];
    };
  };
}

export function TranscriptionAnalysis({ results }: TranscriptionAnalysisProps) {
  if (!results || !results.transcription) {
    return <div>No transcription data available.</div>;
  }

  const { transcription, analysis } = results;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcription Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <h3>Transcription:</h3>
        <p>{transcription}</p>
        {analysis && (
          <>
            <h3>Analysis:</h3>
            <p>Generation Status: {analysis.generationStatus.success ? 'Success' : 'Failed'} (Model: {analysis.generationStatus.model})</p>
            <p>Languages: {analysis.languages.map(lang => `${lang.name}${lang.primary ? ' (Primary)' : ''}`).join(', ')}</p>
            <p>Lip Sync Accuracy: {analysis.lipSyncAccuracy}%</p>
            <p>Subtitles: {analysis.subtitlesStatus.created ? 'Created' : 'Not Created'}, {analysis.subtitlesStatus.synchronized ? 'Synchronized' : 'Not Synchronized'}</p>
            <h4>Key Events:</h4>
            <ul>
              {analysis.keyEvents.map((event, index) => (
                <li key={index}>{event.time}: {event.description} ({event.type})</li>
              ))}
            </ul>
            <h4>Sentiment Analysis:</h4>
            <ul>
              {analysis.sentimentAnalysis.map((sentiment, index) => (
                <li key={index}>{sentiment.time}: {sentiment.value}</li>
              ))}
            </ul>
            <p>Overall Sentiment: {analysis.overallSentiment.tone} ({analysis.overallSentiment.value})</p>
            <h4>Keyword Analysis:</h4>
            <ul>
              {analysis.keywordAnalysis.map((keyword, index) => (
                <li key={index}>{keyword.word}: {keyword.count} ({keyword.type})</li>
              ))}
            </ul>
            <p>Text Labels: {analysis.textLabels.join(', ')}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}