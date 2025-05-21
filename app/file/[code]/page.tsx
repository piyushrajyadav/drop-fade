"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileMetadata } from '../types';

import { use } from 'react';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function FilePage({ params }: PageProps) {
  const router = useRouter();
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        console.log('Fetching metadata for code:', resolvedParams.code);
        const response = await fetch(`/api/file/${resolvedParams.code}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(errorData.message || 'Failed to fetch file metadata');
        }

        const data = await response.json();
        console.log('Received metadata:', data);
        setMetadata(data);
      } catch (err) {
        console.error('Error fetching metadata:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch file metadata');
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [resolvedParams.code]);

  const handleDownload = async () => {
    if (!metadata) return;

    try {
      console.log('Starting file download...');
      const response = await fetch(metadata.url);
      if (!response.ok) throw new Error('Failed to download file');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = metadata.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Mark as downloaded only after successful download
      try {
        await fetch(`/api/file/${resolvedParams.code}`, { method: 'DELETE' });
        console.log('File marked as downloaded');
      } catch (err) {
        console.error('Error marking file as downloaded:', err);
      }
    } catch (err) {
      console.error('Download error:', err);
      setError(err instanceof Error ? err.message : 'Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading file information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">File Not Found</h1>
          <p className="text-gray-600 mb-4">The file you're looking for doesn't exist or has expired.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Show text message if type is 'text'
  if (metadata.type === 'text') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-blue-500 text-4xl mb-4">💬</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Secure Text Message</h1>
            <p className="text-gray-600">Your message is shown below</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <pre className="text-gray-900 font-mono whitespace-pre-wrap break-words text-lg">{metadata.content || ''}</pre>
          </div>
          <button
            onClick={() => {
              if (metadata.content) {
                navigator.clipboard.writeText(metadata.content);
                alert('Text copied to clipboard!');
              }
            }}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Copy Text
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors mt-4"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-blue-500 text-4xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Secure File Access</h1>
          <p className="text-gray-600">Your file is ready to download</p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">File Name</p>
            <p className="font-medium text-gray-800">{metadata.originalName}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">File Size</p>
            <p className="font-medium text-gray-800">
              {(metadata.size / 1024).toFixed(2)} KB
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">File Type</p>
            <p className="font-medium text-gray-800">{metadata.mimeType}</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={handleDownload}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Download File
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
} 