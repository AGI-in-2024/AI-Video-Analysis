import React from 'react'

interface EmotionAnalysisProps {
  results: { Emotion: string; Score: string }[];
}

export function EmotionAnalysis({ results }: EmotionAnalysisProps) {
  return (
    <ul>
      {results.map((emotion, index) => (
        <li key={index}>{emotion.Emotion}: {emotion.Score}</li>
      ))}
    </ul>
  );
}