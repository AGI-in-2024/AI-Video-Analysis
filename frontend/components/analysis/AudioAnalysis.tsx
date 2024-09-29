import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AudioAnalysisProps {
  results: {
    timeline: string[];
    soundEffects: string[];
    musicPatterns: string[];
    audioFeatures: Record<string, number>;
    backgroundNoise: { level: string; type: string };
  };
}

export function AudioAnalysis({ results }: AudioAnalysisProps) {
  if (!results) {
    return <div className="text-gray-400">No audio analysis results available.</div>
  }

  const mockVolumeData = [
    { time: '0:00', volume: 0.5 },
    { time: '0:30', volume: 0.7 },
    { time: '1:00', volume: 0.3 },
    { time: '1:30', volume: 0.8 },
    { time: '2:00', volume: 0.6 },
  ];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-100">Audio Analysis</CardTitle>
      </CardHeader>
      <CardContent className="text-gray-300 space-y-6">
        <div>
          <h3 className="font-semibold mb-2 text-lg">Timeline:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {results.timeline.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-lg">Sound Effects:</h3>
          <div className="flex flex-wrap gap-2">
            {results.soundEffects.map((effect, index) => (
              <Badge key={index} variant="secondary">{effect}</Badge>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-lg">Music Patterns:</h3>
          <div className="flex flex-wrap gap-2">
            {results.musicPatterns.map((pattern, index) => (
              <Badge key={index} variant="outline">{pattern}</Badge>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-lg">Audio Features:</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(results.audioFeatures).map(([feature, value]) => (
              <div key={feature} className="flex justify-between">
                <span className="font-medium">{feature}:</span>
                <span>{value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-lg">Background Noise:</h3>
          <div className="grid grid-cols-2 gap-2">
            <span className="font-medium">Level:</span>
            <span>{results.backgroundNoise.level}</span>
            <span className="font-medium">Type:</span>
            <span>{results.backgroundNoise.type}</span>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-lg">Volume Over Time:</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockVolumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="volume" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}