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

  const handleAnalyze = useCallback(async () => {
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
      setAnalysisLogs(prev => [...prev, 'Sending request to server...']);
      const response = await fetch('http://localhost:5000/api/analyze-video', {
        method: 'POST',
        body: formData,
      });

      setAnalysisLogs(prev => [...prev, `Server responded with status: ${response.status}`]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalysisLogs(prev => [...prev, 'Received response from server']);

      if (data.error) {
        throw new Error(data.error);
      }

      onAnalysisComplete(data.results);
      setAnalysisLogs(prev => [...prev, 'Analysis completed successfully']);
    } catch (error) {
      console.error('Error during analysis:', error);
      setAnalysisLogs(prev => [...prev, `Error: ${error instanceof Error ? error.message : String(error)}`]);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(100);
    }
  }, [videoFile, analysisSettings, advancedSettings, onAnalysisComplete]);

  return {
    isAnalyzing,
    analysisProgress,
    analysisLogs,
    showAnalysisDialog,
    setShowAnalysisDialog,
    handleAnalyze,
  };
}