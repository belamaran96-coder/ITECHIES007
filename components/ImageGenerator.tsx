import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { AspectRatio } from '../types';
import { Download, Sparkles, Loader2, Image as ImageIcon, Maximize2 } from 'lucide-react';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      // 2.5 flash image doesn't support size selection
      const imageUrl = await generateImage(prompt, aspectRatio);
      setGeneratedImage(imageUrl);
    } catch (err: any) {
      setError(err.message || "Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `itechies-generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex h-full gap-6 p-6">
      {/* Controls */}
      <div className="w-80 flex-shrink-0 bg-gray-900/50 rounded-2xl border border-gray-800 p-6 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Generate Assets</h2>
          <p className="text-sm text-gray-400">Create web assets with AI</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prompt
            </label>
            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-32"
              placeholder="Describe the image you want (e.g. 'Minimalist hero section background with blue gradient')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(AspectRatio)
                .filter(ratio => ratio !== '21:9') // Filter out unsupported ratio for 2.5 flash
                .map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    aspectRatio === ratio
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate
              </>
            )}
          </button>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-xs">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex-1 bg-gray-900/30 rounded-2xl border border-gray-800 flex flex-col items-center justify-center p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-900/0 to-gray-900/0 pointer-events-none" />
            
            {generatedImage ? (
            <div className="relative group/image max-w-full max-h-full flex items-center justify-center">
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="max-w-full max-h-[70vh] rounded-xl shadow-2xl border border-gray-800 object-contain"
                />
                
                {/* Overlay Controls */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/image:opacity-100 transition-opacity">
                   <button
                    onClick={handleDownload}
                    className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm border border-white/10 transition-colors"
                    title="Download"
                   >
                     <Download className="w-5 h-5" />
                   </button>
                   <button
                    onClick={() => window.open(generatedImage, '_blank')}
                    className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm border border-white/10 transition-colors"
                    title="Open Full Size"
                   >
                     <Maximize2 className="w-5 h-5" />
                   </button>
                </div>
            </div>
            ) : (
            <div className="text-center text-gray-500">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-10 h-10 opacity-50" />
                </div>
                <p className="text-lg font-medium">No image generated yet</p>
                <p className="text-sm">Enter a prompt and settings to start creating</p>
            </div>
            )}
        </div>
        
        {generatedImage && (
            <div className="flex justify-end">
                 <button
                    onClick={handleDownload}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/20"
                  >
                    <Download className="w-5 h-5" />
                    Download Asset
                  </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;