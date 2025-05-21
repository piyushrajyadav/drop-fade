import { v2 as cloudinary } from 'cloudinary';

// Mock storage for development when Cloudinary is not available
const mockStorage: Record<string, Buffer> = {};
let useMockStorage = false;

// Configure Cloudinary only on the server-side
if (typeof window === 'undefined') {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    
    // Test the configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.warn('Missing Cloudinary credentials, using mock storage for development');
      useMockStorage = true;
    }
  } catch (error) {
    console.error('Failed to configure Cloudinary:', error);
    console.warn('Using mock storage for development');
    useMockStorage = true;
  }
}

export async function uploadFile(file: Buffer, mimeType: string): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('Cloudinary upload should only be called on the server');
  }

  // If we're using mock storage, just store the file in memory with a fake URL
  if (useMockStorage) {
    const fileId = Math.random().toString(36).substring(2, 15);
    mockStorage[fileId] = file;
    return `mock://dropkey/${fileId}`;
  }

  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ 
          resource_type: 'auto',
          folder: 'dropkey',
        }, (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          
          if (!result) {
            return reject(new Error('No result returned from Cloudinary'));
          }
          
          resolve(result.secure_url);
        })
        .end(file);
    });
  } catch (error) {
    console.error('Error in uploadFile:', error);
    
    // Fall back to mock storage in case of error
    const fileId = Math.random().toString(36).substring(2, 15);
    mockStorage[fileId] = file;
    console.warn('Using mock storage due to Cloudinary error');
    return `mock://dropkey/${fileId}`;
  }
}

export async function deleteFile(url: string): Promise<void> {
  if (typeof window !== 'undefined') {
    throw new Error('Cloudinary delete should only be called on the server');
  }
  
  // If this is a mock URL, just delete from our mock storage
  if (url.startsWith('mock://')) {
    const fileId = url.split('/').pop();
    if (fileId) {
      delete mockStorage[fileId];
    }
    return;
  }
  
  try {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    
    const result = await cloudinary.uploader.destroy(`dropkey/${publicId}`);
    if (result.result !== 'ok') {
      throw new Error(`Failed to delete file: ${result.result}`);
    }
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    // Don't throw the error, just log it
  }
} 