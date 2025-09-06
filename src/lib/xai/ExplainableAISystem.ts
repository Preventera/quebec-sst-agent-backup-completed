export interface XAIExplanation { id: string; confidence: number; } export const xaiSystem = { explain: () => ({ id: 'temp', confidence: 0.85 }) };
