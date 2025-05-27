'use client';

import { CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtensionStatusProps {
  isConnected: boolean;
}

export function ExtensionStatus({ isConnected }: ExtensionStatusProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className={cn(
        "flex items-center px-3 py-2 rounded-lg text-sm font-medium",
        isConnected 
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200"
      )}>
        {isConnected ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Extension Connected
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 mr-2" />
            Extension Not Found
          </>
        )}
      </div>
      
      {!isConnected && (
        <div className="flex items-center space-x-2">
          <div className="flex items-center px-3 py-2 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200 text-sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            Install Extension
          </div>
          <a
            href="https://github.com/Apocalypse96/FocusDot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Get Extension
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
}
