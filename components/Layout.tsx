
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              P
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">PureContent</h1>
          </div>
          <div className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">
            AI-POWERED READER
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8">
        {children}
      </main>

      <footer className="py-8 border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} PureContent Extractor • Powered by Gemini 3</p>
          <p className="mt-1">Clean reading experience without the clutter.</p>
        </div>
      </footer>
    </div>
  );
};
