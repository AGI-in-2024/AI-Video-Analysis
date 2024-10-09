import React from 'react';
import { Line, Bar } from 'react-chartjs-2';

interface TranscriptionAnalysisProps {
  analysis: {
    generationStatus: { success: boolean; model: string };
    languages: { name: string; primary: boolean }[];
    keyEvents: { time: string; description: string; type: string }[];
    sentimentAnalysis: { name: string; value: number }[];
    overallSentiment: { tone: string; value: number };
    keywordAnalysis: { word: string; count: number }[];
    textLabels: string[];
  };
  audioAnalysis: {
    duration: number;
    tempo: number;
    beats: number[];
    pitch_mean: number;
    loudness: number;
    mel_spec_mean: number;
    chroma_mean: number;
    spectral_contrast_mean: number;
    speech_segments: { start: number; end: number }[];
  };
}

const TranscriptionAnalysis: React.FC<TranscriptionAnalysisProps> = ({ analysis, audioAnalysis }) => {
  const sentimentData = {
    labels: analysis.sentimentAnalysis.map(item => item.name),
    datasets: [
      {
        label: 'Sentiment',
        data: analysis.sentimentAnalysis.map(item => item.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const keywordData = {
    labels: analysis.keywordAnalysis.map(item => item.word),
    datasets: [
      {
        label: 'Keyword Frequency',
        data: analysis.keywordAnalysis.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const audioWaveform = {
    labels: audioAnalysis.beats.map((_, index) => index),
    datasets: [
      {
        label: 'Audio Waveform',
        data: audioAnalysis.beats,
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
        pointRadius: 0,
      },
    ],
  };

  return (
    <div className="transcription-analysis">
      <h2>Transcription Analysis</h2>
      <div className="generation-status">
        <p>Generation Status: {analysis.generationStatus.success ? 'Success' : 'Failed'}</p>
        <p>Model Used: {analysis.generationStatus.model}</p>
      </div>
      <div className="languages">
        <h3>Languages Detected:</h3>
        <ul>
          {analysis.languages.map((lang, index) => (
            <li key={index}>{lang.name} {lang.primary && '(Primary)'}</li>
          ))}
        </ul>
      </div>
      <div className="key-events">
        <h3>Key Events:</h3>
        <ul>
          {analysis.keyEvents.map((event, index) => (
            <li key={index}>{event.time}: {event.description} ({event.type})</li>
          ))}
        </ul>
      </div>
      <div className="sentiment-analysis">
        <h3>Sentiment Analysis</h3>
        <Line data={sentimentData} />
      </div>
      <div className="overall-sentiment">
        <h3>Overall Sentiment:</h3>
        <p>{analysis.overallSentiment.tone} ({analysis.overallSentiment.value.toFixed(2)})</p>
      </div>
      <div className="keyword-analysis">
        <h3>Keyword Analysis</h3>
        <Bar data={keywordData} />
      </div>
      <div className="audio-analysis">
        <h3>Audio Analysis</h3>
        <p>Duration: {audioAnalysis.duration.toFixed(2)} seconds</p>
        <p>Tempo: {audioAnalysis.tempo.toFixed(2)} BPM</p>
        <p>Average Pitch: {audioAnalysis.pitch_mean.toFixed(2)} Hz</p>
        <p>Average Loudness: {audioAnalysis.loudness.toFixed(2)} dB</p>
        <Line data={audioWaveform} options={{ scales: { y: { beginAtZero: true } } }} />
      </div>
    </div>
  );
};

export default TranscriptionAnalysis;