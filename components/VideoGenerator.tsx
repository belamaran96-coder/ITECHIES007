import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';
import { Video, Loader2, PlayCircle, Lock, Download } from 'lucide-react';

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const url = await generateVideo(prompt, aspectRatio);
      setVideoUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate video');
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
             <span className="bg-gradient-to-r from-pink-500 to-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full text-white">BETA</span>
           </div>
           <p className="text-sm text-gray-400">Generate videos from text prompts</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city with flying cars, neon lights..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 outline-none resize-none h-32"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
             <div className="grid grid-cols-2 gap-2">
               <button
                 onClick={() => setAspectRatio('16:9')}
                 className={`py-2 px-3 rounded-lg text-sm transition-colors ${aspectRatio === '16:9' ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400'}`}
               >
                 Landscape (16:9)
               </button>
               <button
                 onClick={() => setAspectRatio('9:16')}
                 className={`py-2 px-3 rounded-lg text-sm transition-colors ${aspectRatio === '9:16' ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400'}`}
               >
                 Portrait (9:16)
               </button>
             </div>
          </div>

          <div className="bg-orange-900/20 border border-orange-800/50 rounded-lg p-3">
             <div className="flex items-center gap-2 text-orange-400 mb-1">
                <Lock className="w-3 h-3" />
                <span className="text-xs font-bold">Billing Required</span>
             </div>
             <p className="text-[10px] text-orange-300/80 leading-relaxed">
               Video generation uses the Veo model which requires a billed project. You will be asked to select a project key.
             </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-900/50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
            Generate Video
          </button>
          
          {error && (
            <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-900/50">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="flex-1 bg-black rounded-2xl border border-gray-800 flex items-center justify-center overflow-hidden relative">
           {loading && (
             <div className="absolute inset-0 bg-black/80 z-10 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
                <p className="text-pink-100 font-medium animate-pulse">Creating your video...</p>
                <p className="text-gray-500 text-sm mt-2">This may take a minute or two.</p>
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
               <p>Video preview will appear here</p>
             </div>
           )}
        </div>
        
        {videoUrl && (
          <div className="flex justify-end">
            <button
              onClick={handleDownload}
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors border border-gray-700"
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