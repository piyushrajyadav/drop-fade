import { FileMetadata } from '../types';

// Use a global variable to persist data across requests
declare global {
  let fileStore: Map<string, FileMetadata>;
}

// Initialize the global store if it doesn't exist
if (!global.fileStore) {
  global.fileStore = new Map<string, FileMetadata>();
}

// Helper function to get metadata
export async function getMetadata(code: string): Promise<FileMetadata | null> {
  console.log('Getting metadata for code:', code);
  console.log('Current store size:', global.fileStore.size);
  console.log('Available codes:', Array.from(global.fileStore.keys()));
  
  const metadata = global.fileStore.get(code);
  if (!metadata) {
    console.log('No metadata found for code:', code);
    return null;
  }
  
  // Check if the file has expired
  if (Date.now() > metadata.expiresAt) {
    console.log('File has expired, removing from store');
    global.fileStore.delete(code);
    return null;
  }
  
  console.log('Found metadata:', metadata);
  return metadata;
}

// Helper function to set metadata
export async function setMetadata(code: string, metadata: FileMetadata): Promise<void> {
  console.log('Setting metadata for code:', code);
  console.log('Metadata to store:', metadata);
  
  // Ensure the metadata has all required fields
  const completeMetadata: FileMetadata = {
    ...metadata,
    hasDownloaded: metadata.hasDownloaded || false,
    expiresAt: metadata.expiresAt || Date.now() + 3600000, // Default 1 hour if not specified
  };
  
  global.fileStore.set(code, completeMetadata);
  console.log('Current store size after setting:', global.fileStore.size);
  console.log('Available codes:', Array.from(global.fileStore.keys()));
}

// Helper function to delete metadata
export async function deleteMetadata(code: string): Promise<void> {
  console.log('Deleting metadata for code:', code);
  global.fileStore.delete(code);
  console.log('Current store size after deletion:', global.fileStore.size);
}

// Helper function to check if code exists
export async function codeExists(code: string): Promise<boolean> {
  console.log('Checking if code exists:', code);
  const exists = global.fileStore.has(code);
  console.log('Code exists:', exists);
  return exists;
}

// Helper function to mark a file as downloaded
export async function markAsDownloaded(code: string): Promise<void> {
  console.log('Marking file as downloaded for code:', code);
  const metadata = global.fileStore.get(code);
  if (metadata) {
    metadata.hasDownloaded = true;
    global.fileStore.set(code, metadata);
    console.log('File marked as downloaded');
  } else {
    console.log('No metadata found to mark as downloaded');
  }
}

// Helper function to clean up expired files
export async function cleanupExpiredFiles(): Promise<void> {
  const now = Date.now();
  for (const [code, metadata] of global.fileStore.entries()) {
    if (now > metadata.expiresAt) {
      console.log('Cleaning up expired file:', code);
      global.fileStore.delete(code);
    }
  }
}

// Run cleanup every minute
if (process.env.NODE_ENV === 'development') {
  setInterval(cleanupExpiredFiles, 60000);
}