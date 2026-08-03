import { create } from 'zustand';

export const useAiDetectionStore = create((set) => ({
  authenticityScore: 100,
  aiProbability: 0,
  confidence: 0,
  riskLevel: 'low',
  riskEvents: [],
  transcript: [],
  analysisReasons: [],
  isAnalyzing: false,

  updateAnalysis: (data) =>
    set({
      authenticityScore: data.authenticityScore ?? 100,
      aiProbability: data.aiProbability ?? 0,
      confidence: data.confidence ?? 0,
      riskLevel: data.riskLevel ?? 'low',
      riskEvents: data.riskEvents ?? [],
      analysisReasons: data.analysisReasons ?? [],
    }),
  addTranscriptLine: (line) =>
    set((state) => ({ transcript: [...state.transcript, line] })),
  setTranscript: (transcript) => set({ transcript }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  reset: () =>
    set({
      authenticityScore: 100,
      aiProbability: 0,
      confidence: 0,
      riskLevel: 'low',
      riskEvents: [],
      transcript: [],
      analysisReasons: [],
      isAnalyzing: false,
    }),
}));

export default useAiDetectionStore;
