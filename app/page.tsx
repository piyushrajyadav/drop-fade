"use client";

import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import UploadForm from './components/UploadForm';
import DownloadForm from './components/DownloadForm';
import { CloudArrowUpIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'download'>('upload');

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Toaster position="top-center" />
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-blue-600 mb-4">
            DropKey
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share files and messages securely with a unique code that expires after a single use
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full shadow-md p-1 inline-flex">
            <button
              className={`flex items-center px-6 py-3 rounded-full text-sm font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
              onClick={() => setActiveTab('upload')}
            >
              <CloudArrowUpIcon className="w-5 h-5 mr-2" />
              Upload File/Text
            </button>
            <button
              className={`flex items-center px-6 py-3 rounded-full text-sm font-medium transition-all ${
                activeTab === 'download'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
              onClick={() => setActiveTab('download')}
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Access Files
            </button>
          </div>
        </div>
        
        {/* Card Container */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {activeTab === 'upload' ? (
            <UploadForm />
          ) : (
            <DownloadForm />
          )}
        </div>
        
        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure Sharing</h3>
            <p className="text-gray-600">Files are automatically deleted after a single view or expiry time.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Custom Expiry</h3>
            <p className="text-gray-600">Choose how long your files are available: 5 minutes, 1 hour, or 1 day.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Registration</h3>
            <p className="text-gray-600">No account needed. Just upload and share your unique code.</p>
          </div>
        </div>
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} DropKey - Secure and Ephemeral File Sharing</p>
      </footer>
    </div>
    </main>
  );
}
