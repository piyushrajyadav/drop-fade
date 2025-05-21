import { NextRequest, NextResponse } from 'next/server';
import { getFileMetadata, deleteFileMetadata } from '@/app/lib/redis';
import { deleteFile } from '@/app/lib/cloudinary';

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const metadata = await getFileMetadata(params.code);

    if (!metadata) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }

    if (metadata.type === 'file') {
      await deleteFile(metadata.url);
    }

    await deleteFileMetadata(params.code);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { message: 'Failed to delete file' },
      { status: 500 }
    );
  }
} 