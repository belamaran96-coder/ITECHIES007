import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { Upload, Wand2, Download, Loader2, RefreshCw } from 'lucide-react';

const ImageEditor: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setEditedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!sourceImage || !prompt.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const base64Data = sourceImage.split(',')[1];
      const mimeType = sourceImage.split(';')[0].split(':')[1];
      const result = await editImage(base64Data, mimeType, prompt);
      setEditedImage(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to edit image');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (editedImage) {
      const link = document.createElement('a');
      link.href = editedImage;
      link.download = `itechies-edited-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 gap-6 overflow-y-auto">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold text-white">AI Image Editor</h2>
            <p className="text-gray-400">Modify images using natural language instructions</p>
         </div>
         <div className="flex gap-3">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-gray-700"
            >
                <Upload className="w-4 h-4" />
                Upload Image
            </button>
         </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
        {/* Source */}
        <div className="flex flex-col gap-4">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl flex-1 flex items-center justify-center relative overflow-hidden p-6">
                {sourceImage ? (
                    <img src={sourceImage} alt="Original" className="max-w-full max-h-full object-contain rounded-lg shadow-xl" />
                ) : (
                    <div className="text-gray-500 text-center">
                        <Upload className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>Upload an image to start editing</p>
                    </div>
                )}
            </div>
            {sourceImage && (
                <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex gap-3 shadow-lg">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="E.g. 'Add a neon glow', 'Change background to sunset'"
                        className="flex-1 bg-gray-800 border-none rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                        onClick={handleEdit}
                        disabled={loading || !prompt}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/30"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        Apply
                    </button>
                </div>
            )}
        </div>

        {/* Result */}
        <div className="flex flex-col gap-4">
             <div className="bg-gray-900/50 border border-gray-800 rounded-2xl flex-1 flex items-center justify-center relative overflow-hidden p-6">
                {loading ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <p className="text-gray-400 animate-pulse font-medium">Reimagining your image...</p>
                    </div>
                ) : editedImage ? (
                    <img src={editedImage} alt="Edited" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-gray-700" />
                ) : (
                    <div className="text-gray-500 text-center">
                         <Wand2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                         <p>Edited version will appear here</p>
                    </div>
                )}
            </div>
            <div className="h-[64px] flex items-center justify-end gap-3">
                 {editedImage && (
                    <>
                         <button
                            onClick={() => {
                                setSourceImage(editedImage);
                                setEditedImage(null);
                                setPrompt('');
                            }}
                             className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 border border-gray-700 transition-colors"
                         >
                            <RefreshCw className="w-4 h-4" />
                            Use as Input
                         </button>
                        <button
                            onClick={handleDownload}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-semibold transition-all shadow-lg shadow-indigo-900/40"
                        >
                            <Download className="w-5 h-5" />
                            Download Edit
                        </button>
                    </>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;