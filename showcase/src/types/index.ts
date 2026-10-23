export type ScreenReaderType = 'voiceover' | 'nvda';

export interface SpeechLog {
  id: string;
  timestamp: string;
  text: string;
  srType: ScreenReaderType;
  category: 'focus' | 'announcement' | 'action' | 'error';
}

export interface MetricPoint {
  timestamp: string;
  apiRequests: number;
  latencyP95: number;
  memoryUsage: number;
  errorRate: number;
}

export interface MetricSeries {
  id: string;
  name: string;
  color: string;
  lineStyle: 'solid' | 'dashed' | 'dotted' | 'dash-dot';
  unit: string;
  disabled: boolean;
}

export interface AlertCondition {
  id: string;
  label: string;
  metric: string;
  operator: '>' | '<' | '==';
  threshold: number;
  duration: string;
  hasError?: boolean;
  errorMessage?: string;
}
