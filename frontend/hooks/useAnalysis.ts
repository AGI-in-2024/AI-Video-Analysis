import { useState, useCallback } from 'react';
import { AnalysisSettings, AdvancedSettings, AnalysisResults } from '@/types/analysis';

export function useAnalysis(
  videoFile: File | null,
  analysisSettings: AnalysisSettings,
  advancedSettings: AdvancedSettings,
  onAnalysisComplete: (results: AnalysisResults) => void
) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);

  const handleAnalyze = async () => {
    if (!videoFile) return;

    setIsAnalyzing(true);
    setShowAnalysisDialog(true);
    setAnalysisProgress(0);
    setAnalysisLogs([]);

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('settings', JSON.stringify(analysisSettings));
    formData.append('advanced_settings', JSON.stringify(advancedSettings));

    try {
      console.log('Sending request to /api/analyze-video');
      const response = await fetch('http://localhost:5000/api/analyze-video', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      onAnalysisComplete(data.results);
    } catch (error: unknown) {
      console.error('Error during analysis:', error);
      setAnalysisLogs(prev => [...prev, `Error: ${error instanceof Error ? error.message : String(error)}`]);
    } finally {
      setIsAnalyzing(false);
      setShowAnalysisDialog(false);
    }
  };

  return {
    isAnalyzing,
    analysisProgress,
    analysisLogs,
    showAnalysisDialog,
    setShowAnalysisDialog,
    handleAnalyze,
  };
}