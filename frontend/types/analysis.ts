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
  };
  transcription?: {
    transcription: string;
    analysis: {
      generationStatus: {
        success: boolean;
        model: string;
      };
      languages: Language[];
      lipSyncAccuracy: number;
      subtitlesStatus: {
        created: boolean;
        synchronized: boolean;
      };
      keyEvents: KeyEvent[];
      sentimentAnalysis: any[]; // Update this type if you have more specific information
      overallSentiment: {
        tone: string;
        value: number;
      };
      keywordAnalysis: Keyword[];
      textLabels: string[];
    };
  };
  audio?: {
    keyEvents: KeyEvent[];
    soundEffects: string[];
    musicPatterns: string[];
    audioFeatures: {
      tempo: number;
      pitch_mean: number;
      loudness: number;
      mel_spec_mean: number;
      chroma_mean: number;
    };
    labels: string[];
  };
  symbols?: {
    detectedSymbols: { symbol: string; confidence: number }[];
    riskAnalysis: {
      riskLevel: string;
      overallRisk: number;
      riskLabel: string;
    };
    symbolOccurrences: Record<string, number>;
    symbolCategories: string[];
    labels: string[];
  };
  objects?: {
    objectCategories: string[];
    keyObjects: KeyEvent[];
    objectOccurrences: Record<string, number>;
    objectInteractions: KeyEvent[];
    labels: string[];
  };
  poi?: POIAnalysisResults;
  scenes?: SceneAnalysisResults;
  adminDecision?: AdminDecision;
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