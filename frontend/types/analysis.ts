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
  summary?: {
    duration: string;
    overallTone: string;
    riskLevel: string;
    keyMoments: Record<string, string>;
    labels: string[];
    sentimentPositive: number;
    sentimentNeutral: number;
    sentimentNegative: number;
  };
  transcription?: {
    text: string;
    // Add any other properties that might be part of the transcription results
  };
  audio?: {
    timeline: string[];
    soundEffects: string[];
    musicPatterns: string[];
    audioFeatures: Record<string, number>;
    backgroundNoise: { level: string; type: string };
  };
  symbols?: {
    detectedSymbols: Array<{ symbol: string; confidence: number; time: string; location: string }>;
    riskAnalysis: { riskLevel: string; overallRisk: number; riskLabel: string };
    symbolOccurrences: Record<string, number>;
    symbolCategories: string[];
    labels: string[];
  };
  objects?: {
    objectCategories: string[];
    keyObjects: Array<{ time: string; description: string }>;
    objectOccurrences: Record<string, number>;
    objectInteractions: Array<{ time: string; description: string }>;
    sceneClassifications: Array<{ time: string; scene: string }>;
    labels: string[];
  };
  poi?: POIAnalysisResults;
  scenes?: SceneAnalysisResults;
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
  complex: ComplexSceneAnalysis;
  simple: SimpleSceneAnalysis;
}

export interface ComplexSceneAnalysis {
  scenes: Array<{
    start_frame: number;
    start_time: string;
    preview_image: string;
  }>;
  total_scenes: number;
  fps: number;
  duration: string;
}

export interface SimpleSceneAnalysis {
  sceneCount: number;
  averageSceneDuration: number;
  sceneTransitions: Array<{ from: string; to: string; time: string }>;
  dominantColors: Array<{ r: number; g: number; b: number }>;
  sceneDescriptions: string[];
  keyScenes: Array<{
    time: string;
    type: string;
    complexity: number;
    motionIntensity: number;
    mood: string;
    text: string;
  }>;
  similarityMatrix: number[][];
  labels: string[];
}

export type AdminDecision = {
  contentLabel: 'white' | 'gray' | 'black' | '18+'
  adSuitability: number
  copyrightViolation: boolean
  prohibitedContent: boolean
  recommendationLevel: 'Highly Recommended' | 'Recommended' | 'Neutral' | 'Not Recommended' | 'Highly Not Recommended'
}