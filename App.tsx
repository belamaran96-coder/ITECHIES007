import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import CodeGenerator from './components/CodeGenerator';
import VideoGenerator from './components/VideoGenerator';
import ChatAssistant from './components/ChatAssistant';
import { AppView } from './types';
import { Key, Sparkles, ExternalLink, ShieldAlert, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.IMAGE_GENERATOR);
  const [isKeyReady, setIsKeyReady] = useState<boolean>(false);
  const [checkingKey, setCheckingKey] = useState<boolean>(true);

  useEffect(() => {
    const checkKey = async () => {
      const win = window as any;
      
      let hasEnvKey = false;
      try {
        if (process.env.API_KEY && process.env.API_KEY !== 'undefined' && process.env.API_KEY !== '') {
          hasEnvKey = true;
        }
      } catch (e) {
        // process.env might not be defined in browser
      }

      if (hasEnvKey) {
        setIsKeyReady(true);
        setCheckingKey(false);
        return;
      }
      
      // Check if a key has been selected via AI Studio dialog
      if (win.aistudio?.hasSelectedApiKey) {
        const selected = await win.aistudio.hasSelectedApiKey();
        setIsKeyReady(selected);
      }
      setCheckingKey(false);
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    const win = window as any;
    if (win.aistudio?.openSelectKey) {
      await win.aistudio.openSelectKey();
      // Per instructions, assume success after triggering selector to avoid race conditions
      setIsKeyReady(true);
    } else {
      alert("API Key selection is not available. Please ensure API_KEY environment variable is set in your Vercel settings.");
    }
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.IMAGE_GENERATOR:
        return <ImageGenerator />;
      case AppView.IMAGE_EDITOR:
        return <ImageEditor />;
      case AppView.VIDEO_GENERATOR:
        return <VideoGenerator />;
      case AppView.CODE_GENERATOR:
        return <CodeGenerator />;
      default:
        return <ImageGenerator />;
    }
  };

  if (checkingKey) {
    return (
      <div className="h-screen w-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-medium animate-pulse">Initializing Vercel Environment...</p>
        </div>
      </div>
    );
  }

  if (!isKeyReady) {
    return (
      <div className="h-screen w-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="w-20 h-20 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Key className="w-10 h-10 text-indigo-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Connect to Gemini</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            ITechies requires a Gemini API Key to function. If you haven't set an <code className="text-indigo-400 px-1 py-0.5 bg-gray-800 rounded">API_KEY</code> environment variable in Vercel, you can select one here.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleOpenKeySelector}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-900/40"
            >
              <Sparkles className="w-5 h-5" />
              Select or Connect Key
            </button>
            
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-400 transition-colors"
            >
              Learn about paid project keys <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800 flex items-start gap-3 text-left">
             <div className="p-2 bg-gray-800 rounded-lg">
                <Globe className="w-4 h-4 text-gray-400" />
             </div>
            <div>
               <p className="text-xs font-bold text-gray-300 uppercase mb-1">Deployment Note</p>
               <p className="text-[10px] text-gray-500 leading-normal">
                If deploying on Vercel, ensure you've added <span className="text-gray-400">API_KEY</span> in the Environment Variables section of your project settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-hidden relative">
        {renderView()}
      </main>
      <ChatAssistant />
    </div>
  );
};

export default App;