export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  tag: string;
  timestamp: string; // ISO date string or formatted date
  likes?: number;
}

export type TagType = '전체' | '응원·격려' | '축하' | '감사' | '자유';

export interface NewEntryPayload {
  name: string;
  message: string;
  tag: string;
}

export interface ConnectionStatus {
  isConfigured: boolean;
  isConnected: boolean;
  isTesting: boolean;
  latencyMs?: number;
  lastChecked?: string;
  errorMessage?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}
