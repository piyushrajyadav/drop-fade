import { nanoid } from 'nanoid';
import { ExpiryOption } from '../types';

export function generateCode(): string {
  return nanoid(6).toUpperCase();
}

export function calculateExpiryTime(option: ExpiryOption): number {
  const now = Date.now();
  switch (option) {
    case '5m':
      return now + 5 * 60 * 1000;
    case '1h':
      return now + 60 * 60 * 1000;
    case '1d':
      return now + 24 * 60 * 60 * 1000;
    default:
      return now + 5 * 60 * 1000;
  }
}

export function formatExpiryTime(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;
  
  if (diff <= 0) return 'Expired';
  
  const minutes = Math.floor(diff / (60 * 1000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d remaining`;
  if (hours > 0) return `${hours}h remaining`;
  return `${minutes}m remaining`;
} 