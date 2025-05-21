import { NextRequest, NextResponse } from 'next/server';
import { setMetadata } from '@/app/lib/redis';
import { generateCode, calculateExpiryTime } from '@/app/lib/utils';
import { ExpiryOption } from '@/app/types';

export const dynamic = 'force-dynamic'; // Disable caching

export async function POST(request: NextRequest) {
  console.log('Text upload API route called');
  
  try {
    const body = await request.json();
    const { text, expiry } = body;

    if (!text || typeof text !== 'string') {
      console.error('No text provided or invalid text format');
      return NextResponse.json(
        { message: 'No text provided or invalid format' },
        { status: 400 }
      );
    }

    console.log(`Received text of length: ${text.length}, expiry: ${expiry}`);

    // Generate unique code
    const code = generateCode();
    const expiresAt = calculateExpiryTime(expiry as ExpiryOption || '1h');

    console.log(`Generated code: ${code}, expires at: ${new Date(expiresAt).toISOString()}`);

    // Store metadata in in-memory store
    await setMetadata(code, {
      url: '',
      type: 'text',
      content: text,
      hasDownloaded: false,
      expiresAt,
    });

    console.log('Text metadata stored in in-memory store');

    return NextResponse.json({ 
      code, 
      expiresAt,
      message: 'Text saved successfully' 
    });
  } catch (error) {
    console.error('Text upload error:', error);
    return NextResponse.json(
      { message: `Failed to save text: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 