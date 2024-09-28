import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisResults } from '@/types/analysis';
import { SummaryAnalysis } from './analysis/SummaryAnalysis';
import { TranscriptionAnalysis } from './analysis/TranscriptionAnalysis';
import { AudioAnalysis } from './analysis/AudioAnalysis';
import { SymbolsAnalysis } from './analysis/SymbolsAnalysis';
import { ObjectsAnalysis } from './analysis/ObjectsAnalysis';
import { PointOfInterestAnalysis } from './analysis/PointOfInterestAnalysis';
import { ScenesAnalysis } from './analysis/ScenesAnalysis';
import { AdminPanel } from './analysis/AdminPanel';
import { POIAnalysis } from './analysis/POIAnalysis';

interface AnalysisTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  analysisResults: AnalysisResults | null;
  children: React.ReactNode;
}

export function AnalysisTabs({ activeTab, setActiveTab, analysisResults, children }: AnalysisTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        {/* Add tab triggers for each analysis type */}
        {analysisResults?.summary && <TabsTrigger value="summary">Summary</TabsTrigger>}
        {analysisResults?.transcription && <TabsTrigger value="transcription">Transcription</TabsTrigger>}
        {analysisResults?.audio && <TabsTrigger value="audio">Audio</TabsTrigger>}
        {analysisResults?.symbols && <TabsTrigger value="symbols">Symbols</TabsTrigger>}
        {analysisResults?.objects && <TabsTrigger value="objects">Objects</TabsTrigger>}
        {analysisResults?.poi && <TabsTrigger value="poi">POI</TabsTrigger>}
        {analysisResults?.scenes && <TabsTrigger value="scenes">Scenes</TabsTrigger>}
      </TabsList>
      {children}
    </Tabs>
  );
}