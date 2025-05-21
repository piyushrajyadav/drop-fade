import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/app/lib/cloudinary';
import { setMetadata, getMetadata } from '@/app/lib/redis';
import { generateCode, calculateExpiryTime } from '@/app/lib/utils';
import { ExpiryOption } from '@/app/types';

export const maxDuration = 60; // Set maximum execution time to 60 seconds
export const dynamic = 'force-dynamic'; // Disable caching

export async function POST(request: NextRequest) {
  console.log('File upload API route called');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const expiry = formData.get('expiry') as ExpiryOption || '1h';

    if (!file) {
      console.error('No file provided');
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`Received file: ${file.name}, size: ${file.size}, type: ${file.type}`);

    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large', file.size);
      return NextResponse.json(
        { message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('Uploading to Cloudinary...');
    
    // Upload to Cloudinary
    const url = await uploadFile(buffer, file.type);
    
    console.log('File uploaded to Cloudinary:', url);
    
    // Generate unique code
    const code = generateCode();
    const expiresAt = calculateExpiryTime(expiry);

    console.log(`Generated code: ${code}, expires at: ${new Date(expiresAt).toISOString()}`);

    // Store metadata in in-memory store
    const metadata = {
      url,
      type: 'file' as const,
      hasDownloaded: false,
      expiresAt,
      originalName: file.name,
      mimeType: file.type,
      filename: file.name,
      size: file.size
    };

    console.log('Storing metadata:', metadata);
    await setMetadata(code, metadata);
    console.log('Metadata stored successfully');

    // Verify the metadata was stored correctly
    const storedMetadata = await getMetadata(code);
    if (!storedMetadata) {
      throw new Error('Failed to verify metadata storage');
    }
    console.log('Verified stored metadata:', storedMetadata);

    return NextResponse.json({ 
      code, 
      expiresAt,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { message: `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 