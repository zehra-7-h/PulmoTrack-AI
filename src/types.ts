export interface CoughDataPoint {
  time: string;
  count: number;
  heartRate: number;
  respiratoryRate: number;
  activity: number;
  isNight: boolean;
}

export interface DailySummary {
  date: string;
  totalCoughs: number;
  nightCoughs: number;
  avgHeartRate: number;
  avgRespiratoryRate: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface Exercise {
  id: number;
  title: string;
  duration: string;
  status: 'pending' | 'completed';
  description: string;
}

export interface NicotineLog {
  date: string;
  count: number;
}

export interface AQIDataPoint {
  time: string;
  aqi: number;
}

export interface SpirometryDataPoint {
  day: string;
  fev1: number;
}

export type Screen = 'dashboard' | 'ai' | 'rehab' | 'trends' | 'edu' | 'status';

export interface AIAnalysisResult {
  analysis: string;
  riskLevel: 'high' | 'medium' | 'low';
  rehabRecommendation: string;
  psychologicalNote?: string;
}
