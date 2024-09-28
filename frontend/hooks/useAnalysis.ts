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
      const response = await fetch('http://localhost:5000/api/analyze-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      onAnalysisComplete(data.results);
    } catch (error) {
      console.error('Error during analysis:', error);
      setAnalysisLogs(prev => [...prev, 'Error occurred during analysis']);
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