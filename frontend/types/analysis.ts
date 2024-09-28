export interface AnalysisSettings {
  summary: boolean;
  object_detection: boolean;
  transcription: boolean;
  audio_analysis: boolean;
  symbol_detection: boolean;
  scene_detection: boolean;
  point_of_interest: boolean;
}

export interface AdvancedSettings extends AnalysisSettings {}

export interface AnalysisResults {
  summary?: SummaryAnalysis;
  transcription?: TranscriptionAnalysis;
  audio?: AudioAnalysis;
  symbols?: SymbolsAnalysis;
  objects?: ObjectsAnalysis;
  poi?: POIAnalysis;
  scenes?: ScenesAnalysis;
}

export type Language = {
  name: string;
  primary: boolean;
};

export type KeyEvent = {
  time: string;
  description: string;
  type: string;
};

export type Keyword = {
  word: string;
  count: number;
  type: string;
};

export type HeatZone = {
  time: string;
  description: string;
};

export type HeatZoneCoordinate = {
  x: number;
  y: number;
  area: number;
};

export type AttentionHotspot = {
  time: string;
  description: string;
};

export type EyeTrackingData = {
  time: string;
  x: number;
  y: number;
};

export type KeyScene = {
  time: string;
  type: string;
};

export type SceneTransition = {
  time: string;
  description: string;
};

export interface POIAnalysisResults {
  analysis: {
    heatZonesAnalysis: string;
    heatZoneCoordinates: string;
    hotspots: string;
    poiLabeling: string;
  };
  heatZones: Array<{ id: number; intensity: number; size: number }>;
  heatZoneCoordinates: Array<{ id: number; x: number; y: number; width: number; height: number; centroidX: number; centroidY: number }>;
  attentionHotspots: Array<{ id: number; x: number; y: number; intensity: number }>;
  eyeTrackingData: Array<{ id: number; x: number; y: number; timestamp: number; duration: number }>;
  labels: string[];  // Add this line if it's not already there
}

export interface SceneAnalysisResults {
  sceneCount: number
  averageSceneDuration: number
  sceneTransitions: Array<{ from: string; to: string; time: string }>
  dominantColors: Array<{ r: number; g: number; b: number }>
  sceneDescriptions: string[]
  keyScenes: Array<{ 
    time: string
    type: string
    complexity: number
    motionIntensity: number
    mood: string
    text: string
  }>
  similarityMatrix: number[][]
}

export type AdminDecision = {
  contentLabel: 'white' | 'gray' | 'black' | '18+'
  adSuitability: number
  copyrightViolation: boolean
  prohibitedContent: boolean
  recommendationLevel: 'Highly Recommended' | 'Recommended' | 'Neutral' | 'Not Recommended' | 'Highly Not Recommended'
}

export interface AudioAnalysis {
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
}

export interface TranscriptionAnalysis {
  transcription: string;
  analysis: {
    generationStatus: { success: boolean; model: string };
    languages: { name: string; primary: boolean }[];
    lipSyncAccuracy: number;
    subtitlesStatus: { created: boolean; synchronized: boolean };
    keyEvents: { time: string; description: string; type: string }[];
    sentimentAnalysis: { time: string; value: number }[];
    overallSentiment: { tone: string; value: number };
    keywordAnalysis: { word: string; count: number; type: string }[];
    textLabels: string[];
  };
}