import React from 'react'
import { AnalysisResults } from '@/types/analysis'

export function AudioAnalysis({ results }: { results: AnalysisResults['audio'] }) {
  if (!results) return null

  return (
    <div>
      <h2>Audio Analysis</h2>
      <ul>
        {results.keyEvents.map((event, index) => (
          <li key={index}>{event.time}: {event.description}</li>
        ))}
      </ul>
      <h3>Sound Effects</h3>
      <ul>
        {results.soundEffects.map((effect, index) => (
          <li key={index}>{effect}</li>
        ))}
      </ul>
      <h3>Music Patterns</h3>
      <ul>
        {results.musicPatterns.map((pattern, index) => (
          <li key={index}>{pattern}</li>
        ))}
      </ul>
      <h3>Audio Features</h3>
      <p>Tempo: {results.audioFeatures.tempo}</p>
      <p>Pitch Mean: {results.audioFeatures.pitch_mean}</p>
      <p>Loudness: {results.audioFeatures.loudness}</p>
      <p>Mel Spectrogram Mean: {results.audioFeatures.mel_spec_mean}</p>
      <p>Chroma Mean: {results.audioFeatures.chroma_mean}</p>
      <h3>Labels</h3>
      <ul>
        {results.labels.map((label, index) => (
          <li key={index}>{label}</li>
        ))}
      </ul>
    </div>
  )
}