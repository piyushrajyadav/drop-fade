"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function DownloadForm() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error('Please enter a code');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First check if the code exists
      const response = await fetch(`/api/file/${code}`);
      
      if (response.status === 404) {
        toast.error('File not found. The code may be incorrect or expired.');
        setIsLoading(false);
        return;
      }
      
      if (response.status === 410) {
        toast.error('This file has expired or been already accessed.');
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to access file');
      }
      
      // If the code exists, navigate to the file page
      router.push(`/file/${code}`);
    } catch (error) {
      console.error('Error accessing file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to access file');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Access Shared Content</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            Enter your 6-character code
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g. ABC123)"
              className="block w-full px-4 py-3 text-center text-xl tracking-wider font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={6}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            The code is case-insensitive
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !code.trim()}
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Accessing...
            </span>
          ) : (
            <span className="flex items-center">
              Access Content <ArrowRightIcon className="ml-2 h-4 w-4" />
            </span>
          )}
        </button>
      </form>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="font-medium text-blue-800 mb-2">How it works</h3>
        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
          <li>Enter the 6-character code you received</li>
          <li>Click "Access Content" to view or download the file</li>
          <li>Remember: Files are automatically deleted after viewing</li>
        </ol>
      </div>
    </div>
  );
} 