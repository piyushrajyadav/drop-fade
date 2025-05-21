export type FileType = 'file' | 'text';

export interface FileMetadata {
  url: string;
  type: FileType;
  content?: string;
  hasDownloaded: boolean;
  expiresAt: number;
  originalName?: string;
  mimeType?: string;
}

export type ExpiryOption = '5m' | '1h' | '1d';

export interface UploadResponse {
  code: string;
  expiresAt: number;
} 