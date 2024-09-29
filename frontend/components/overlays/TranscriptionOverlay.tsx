import React from 'react';

interface TranscriptionOverlayProps {
  transcription: string;
  currentTime: number;
}

export function TranscriptionOverlay({ transcription, currentTime }: TranscriptionOverlayProps) {
  // You'll need to implement logic to show the correct part of the transcription based on currentTime
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
      {transcription}
    </div>
  );
}