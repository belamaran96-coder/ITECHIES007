import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { Upload, Wand2, Download, Loader2, RefreshCw } from 'lucide-react';

const ImageEditor: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setEditedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!sourceImage || !prompt.trim()) return;

    setLoading(true);
    try {
      // Extract base64 data
      const base64Data = sourceImage.split(',')[1];
      const mimeType = sourceImage.split(';')[0].split(':')[1];
      
      const result = await editImage(base64Data, mimeType, prompt);
      setEditedImage(result);
    } catch (err) {
      console.error(err);
      alert('Failed to edit image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 gap-6">
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
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
                <Upload className="w-4 h-4" />
                Upload Image
            </button>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
        {/* Source */}
        <div className="flex flex-col gap-4">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl flex-1 flex items-center justify-center relative overflow-hidden p-4">
                {sourceImage ? (
                    <img src={sourceImage} alt="Original" className="max-w-full max-h-full object-contain rounded" />
                ) : (
                    <div className="text-gray-500 text-center">
                        <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Upload an image to start editing</p>
                    </div>
                )}
            </div>
            {sourceImage && (
                <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex gap-3">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="E.g. 'Add a neon glow', 'Make it sketch style'"
                        className="flex-1 bg-gray-800 border-none rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                        onClick={handleEdit}
                        disabled={loading || !prompt}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        Apply
                    </button>
                </div>
            )}
        </div>

        {/* Result */}
        <div className="flex flex-col gap-4">
             <div className="bg-gray-900/50 border border-gray-800 rounded-xl flex-1 flex items-center justify-center relative overflow-hidden p-4">
                {loading ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                        <p className="text-gray-400 animate-pulse">Processing image...</p>
                    </div>
                ) : editedImage ? (
                    <img src={editedImage} alt="Edited" className="max-w-full max-h-full object-contain rounded" />
                ) : (
                    <div className="text-gray-500 text-center">
                         <Wand2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                         <p>Edited version will appear here</p>
                    </div>
                )}
            </div>
            <div className="h-[72px] flex items-center justify-end">
                 {editedImage && (
                    <div className="flex gap-3">
                         <button
                            onClick={() => {
                                setSourceImage(editedImage);
                                setEditedImage(null);
                                setPrompt('');
                            }}
                             className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                         >
                            <RefreshCw className="w-4 h-4" />
                            Use as Input
                         </button>
                        <a
                            href={editedImage}
                            download={`itechies-edited-${Date.now()}.png`}
                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </a>
                    </div>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;