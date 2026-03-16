import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';
import { Video, Loader2, PlayCircle, Key, Download, ExternalLink } from 'lucide-react';

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // MANDATORY: Check for API Key selection for Veo models
    // @ts-ignore - window.aistudio is global
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      setError("Please select a paid API key to use Veo Video Generation.");
      // @ts-ignore
      await window.aistudio.openSelectKey();
      return;
    }

    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const url = await generateVideo(prompt, aspectRatio);
      setVideoUrl(url);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("entity was not found")) {
        setError("API Key error. Please re-select your key.");
        // @ts-ignore
        await window.aistudio.openSelectKey();
      } else {
        setError(err.message || 'Failed to generate video');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `itechies-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex h-full gap-6 p-6">
      <div className="w-80 flex-shrink-0 bg-gray-900/50 rounded-2xl border border-gray-800 p-6 flex flex-col gap-6">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <h2 className="text-lg font-bold text-white">Veo Video</h2>
             <span className="bg-gradient-to-r from-indigo-500 to-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase">Pro</span>
           </div>
           <p className="text-sm text-gray-400">Cinematic video generation</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Cinematic shot of a cyberpunk city in rain..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-32"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
             <div className="grid grid-cols-2 gap-2">
               <button
                 onClick={() => setAspectRatio('16:9')}
                 className={`py-2 px-3 rounded-lg text-sm transition-colors ${aspectRatio === '16:9' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
               >
                 16:9
               </button>
               <button
                 onClick={() => setAspectRatio('9:16')}
                 className={`py-2 px-3 rounded-lg text-sm transition-colors ${aspectRatio === '9:16' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
               >
                 9:16
               </button>
             </div>
          </div>

          <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-3">
             <div className="flex items-center gap-2 text-indigo-400 mb-2 font-semibold text-xs">
                <Key className="w-4 h-4" />
                <span>Billing Documentation</span>
             </div>
             <a 
               href="https://ai.google.dev/gemini-api/docs/billing" 
               target="_blank" 
               className="text-[10px] text-gray-400 flex items-center gap-1 hover:text-white transition-colors"
             >
               Learn about paid projects <ExternalLink className="w-3 h-3" />
             </a>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/40"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
            Generate Video
          </button>
          
          {error && (
            <div className="text-xs text-red-400 bg-red-900/20 p-3 rounded-xl border border-red-900/50">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="flex-1 bg-black rounded-2xl border border-gray-800 flex items-center justify-center overflow-hidden relative">
           {loading && (
             <div className="absolute inset-0 bg-black/80 z-10 flex flex-col items-center justify-center text-center p-6">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-xl font-bold text-white mb-2">Creating Magic...</p>
                <p className="text-gray-400 text-sm max-w-xs">Veo is processing your prompt. This usually takes 30-60 seconds.</p>
             </div>
           )}
           
           {videoUrl ? (
             <video 
               src={videoUrl} 
               controls 
               autoPlay 
               loop 
               className="max-w-full max-h-full rounded-lg shadow-2xl"
             />
           ) : (
             <div className="text-center text-gray-600">
               <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
               <p className="text-lg font-medium">Video preview</p>
               <p className="text-sm">Submit a prompt to start generating</p>
             </div>
           )}
        </div>
        
        {videoUrl && (
          <div className="flex justify-end">
            <button
              onClick={handleDownload}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/30"
            >
              <Download className="w-5 h-5" />
              Download MP4
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;