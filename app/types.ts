export type ExpiryOption = '5m' | '1h' | '1d';

export interface FileMetadata {
  url: string;
  type: 'file' | 'text';
  hasDownloaded: boolean;
  expiresAt: number;
  originalName?: string;
  mimeType?: string;
  filename: string;
  size?: number;
  content?: string;
} 