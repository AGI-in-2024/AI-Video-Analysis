import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmotionAnalysis } from './EmotionAnalysis';

interface AudioAnalysisProps {
  results: {
    timeline: string[];
    soundEffects: string[];
    musicPatterns: string[];
    audioFeatures: {
      [key: string]: number;
    };
    emotionAnalysis: { Emotion: string; Score: string }[];
    backgroundNoise: {
      [key: string]: number;
    };
    transcription: string;
  };
}

export function AudioAnalysis({ results }: AudioAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audio Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <h3>Timeline:</h3>
        <ul>
          {results.timeline.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <h3>Sound Effects:</h3>
        <ul>
          {results.soundEffects.map((effect, index) => (
            <li key={index}>{effect}</li>
          ))}
        </ul>
        <h3>Music Patterns:</h3>
        <ul>
          {results.musicPatterns.map((pattern, index) => (
            <li key={index}>{pattern}</li>
          ))}
        </ul>
        <h3>Audio Features:</h3>
        <ul>
          {Object.entries(results.audioFeatures).map(([feature, value]) => (
            <li key={feature}>{feature}: {value}</li>
          ))}
        </ul>
        <h3>Emotion Analysis:</h3>
        <EmotionAnalysis results={results.emotionAnalysis} />
        <h3>Background Noise:</h3>
        <ul>
          {Object.entries(results.backgroundNoise).map(([noise, level]) => (
            <li key={noise}>{noise}: {level}</li>
          ))}
        </ul>
        <h3>Transcription:</h3>
        <p>{results.transcription}</p>
      </CardContent>
    </Card>
  );
}