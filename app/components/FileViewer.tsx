"use client";

import { useState, useEffect } from 'react';
import { getMetadata, markAsDownloaded } from '../lib/redis';
import { FileMetadata } from '../types';
import toast from 'react-hot-toast';

interface FileViewerProps {
  code: string;
}

export default function FileViewer({ code }: FileViewerProps) {
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await getMetadata(code);
        if (!data) {
          setError('File not found. The code may be incorrect or expired.');
          return;
        }
        setMetadata(data);
      } catch (err) {
        setError('Failed to load file information. Please try again.');
        console.error('Error fetching metadata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [code]);

  const handleDownload = async () => {
    if (!metadata) return;

    try {
      // Mark as downloaded
      await markAsDownloaded(code);

      // Download the file
      const response = await fetch(metadata.url);
      if (!response.ok) throw new Error('Failed to download file');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = metadata.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      toast.error('Failed to download file. Please try again.');
      console.error('Download error:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading file information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!metadata) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            {metadata.filename}
          </h2>
          <p className="text-sm text-gray-500">
            {metadata.type === 'file' ? 'File' : 'Text Message'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            Expires: {new Date(metadata.expiresAt).toLocaleString()}
          </p>
          {metadata.hasDownloaded && (
            <p className="text-sm text-yellow-600 mt-1">
              This file has been downloaded
            </p>
          )}
        </div>
      </div>

      {metadata.type === 'text' ? (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <pre className="text-gray-900 font-mono whitespace-pre-wrap break-words">{metadata.content || ''}</pre>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="w-16 h-16 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">
            {metadata.filename} {metadata.size ? `(${Math.round(metadata.size / 1024)} KB)` : ''}
          </p>
        </div>
      )}

      <div className="flex justify-center space-x-4">
        {metadata.type === 'file' ? (
          <>
            {metadata.mimeType === 'application/pdf' && (
              <>
                <button
                  onClick={() => window.open(metadata.url, '_blank')}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  View PDF
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download PDF
                </button>
              </>
            )}
            {metadata.mimeType !== 'application/pdf' && (
              <button
                onClick={handleDownload}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download File
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => {
                if (metadata.content) {
                  const textWindow = window.open('', '_blank');
                  if (textWindow) {
                    textWindow.document.write(`
                      <html>
                        <head>
                          <title>Text Message</title>
                          <style>
                            body {
                              font-family: monospace;
                              white-space: pre-wrap;
                              padding: 20px;
                              background: #f9fafb;
                              color: #111827;
                            }
                          </style>
                        </head>
                        <body>${metadata.content}</body>
                      </html>
                    `);
                    textWindow.document.close();
                  }
                }
              }}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              View Text
            </button>
            <button
              onClick={() => {
                if (metadata.content) {
                  navigator.clipboard.writeText(metadata.content);
                  toast.success('Text copied to clipboard!');
                }
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Copy Text
            </button>
          </>
        )}
      </div>
    </div>
  );
} 