import { NextRequest, NextResponse } from 'next/server';
import { getMetadata, markAsDownloaded } from '@/app/lib/redis';

export async function GET(
  request: NextRequest,
  context: { params: { code: string } }
) {
  try {
    // Properly handle async params
    const { code } = context.params;
    console.log('File retrieval API called for code:', code);
    
    const metadata = await getMetadata(code);
    console.log('Retrieved metadata:', metadata);

    if (!metadata) {
      console.log('No metadata found for code:', code);
      return NextResponse.json(
        { message: 'File not found. The code may be incorrect or expired.' },
        { status: 404 }
      );
    }

    if (metadata.hasDownloaded) {
      console.log('File has already been downloaded');
      return NextResponse.json(
        { message: 'This file has already been downloaded.' },
        { status: 410 }
      );
    }

    if (Date.now() > metadata.expiresAt) {
      console.log('File has expired');
      return NextResponse.json(
        { message: 'This file has expired.' },
        { status: 410 }
      );
    }

    // Return metadata without marking as downloaded
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('File metadata error:', error);
    return NextResponse.json(
      { message: 'Failed to get file metadata' },
      { status: 500 }
    );
  }
}

// Add the DELETE route to mark file as downloaded
export async function DELETE(
  request: NextRequest,
  context: { params: { code: string } }
) {
  try {
    // Properly handle async params
    const { code } = context.params;
    console.log('Delete API called for code:', code);
    
    // Mark as downloaded
    await markAsDownloaded(code);
    console.log('File marked as downloaded via DELETE request');

    return NextResponse.json({ message: 'File marked as accessed' });
  } catch (error) {
    console.error('Error marking file as accessed:', error);
    return NextResponse.json(
      { message: 'Failed to mark file as accessed' },
      { status: 500 }
    );
  }
} 