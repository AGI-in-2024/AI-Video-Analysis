import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AnalysisSettings, AdvancedSettings } from '@/types/analysis';

interface AnalysisDialogProps {
  videoFile: File | null;
  analysisSettings: AnalysisSettings;
  setAnalysisSettings: React.Dispatch<React.SetStateAction<AnalysisSettings>>;
  advancedSettings: AdvancedSettings;
  setAdvancedSettings: React.Dispatch<React.SetStateAction<AdvancedSettings>>;
  handleAnalyze: () => void;
  isAnalyzing: boolean;
  handleToggleAllSettings: (checked: boolean) => void;
  handleToggleAllAdvanced: (checked: boolean) => void;
}

export function AnalysisDialog({
  videoFile,
  analysisSettings,
  setAnalysisSettings,
  advancedSettings,
  setAdvancedSettings,
  handleAnalyze,
  isAnalyzing,
  handleToggleAllSettings,
  handleToggleAllAdvanced
}: AnalysisDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Analyze Video</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Video Analysis Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-center">
            <Label>Select All</Label>
            <Checkbox
              checked={Object.values(analysisSettings).every(Boolean)}
              onCheckedChange={handleToggleAllSettings}
            />
          </div>
          {Object.entries(analysisSettings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between space-x-2">
              <Label htmlFor={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    setAnalysisSettings(prev => ({ ...prev, [key]: checked === true }))
                  }
                />
                <Switch
                  checked={advancedSettings[key as keyof AdvancedSettings]}
                  onCheckedChange={(checked) => 
                    setAdvancedSettings(prev => ({ ...prev, [key]: checked }))
                  }
                />
              </div>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="emotion_recognition"
              checked={analysisSettings.emotion_recognition}
              onCheckedChange={(checked) =>
                setAnalysisSettings({ ...analysisSettings, emotion_recognition: !!checked })
              }
            />
            <Label htmlFor="emotion_recognition">Emotion Recognition</Label>
          </div>
          <div className="flex justify-between items-center">
            <Label>Use Advanced Algorithms for All</Label>
            <Switch
              checked={Object.values(advancedSettings).every(Boolean)}
              onCheckedChange={handleToggleAllAdvanced}
            />
          </div>
          <Button onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}