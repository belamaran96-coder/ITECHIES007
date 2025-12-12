import React, { useState, useRef } from 'react';
import { generateCodeFromImage } from '../services/geminiService';
import { Upload, Code, Copy, Check, FileCode, Loader2, Download } from 'lucide-react';
import { Framework } from '../types';

const CodeGenerator: React.FC = () => {
  const [mockupImage, setMockupImage] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<{ componentCode: string; explanation: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [framework, setFramework] = useState<Framework>(Framework.REACT);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMockupImage(reader.result as string);
        setGeneratedCode(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!mockupImage) return;
    setLoading(true);
    setCopied(false);
    try {
      const base64Data = mockupImage.split(',')[1];
      const mimeType = mockupImage.split(';')[0].split(':')[1];
      
      const jsonStr = await generateCodeFromImage(base64Data, mimeType, additionalPrompt, framework);
      const parsed = JSON.parse(jsonStr);
      setGeneratedCode(parsed);
    } catch (err) {
      console.error(err);
      alert('Failed to generate code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode.componentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedCode) {
      let extension = 'txt';
      let mimeType = 'text/plain';

      switch (framework) {
        case Framework.REACT:
          extension = 'tsx';
          mimeType = 'text/typescript';
          break;
        case Framework.VUE:
          extension = 'vue';
          mimeType = 'text/plain';
          break;
        case Framework.VANILLA:
          extension = 'html';
          mimeType = 'text/html';
          break;
      }

      const blob = new Blob([generatedCode.componentCode], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `GeneratedComponent.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="h-full flex gap-6 p-6">
      {/* Input Column */}
      <div className="w-1/3 flex flex-col gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 flex-1 overflow-y-auto">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Upload Mockup</h2>
            <p className="text-sm text-gray-400">Convert designs to code</p>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`flex-shrink-0 min-h-[160px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
              mockupImage ? 'border-indigo-500/50 bg-indigo-900/10' : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800'
            }`}
          >
            {mockupImage ? (
              <img src={mockupImage} alt="Mockup" className="max-h-40 object-contain p-2" />
            ) : (
              <div className="text-center p-6">
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-300 font-medium text-sm">Click to upload</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG supported</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Framework
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(Framework).map((fw) => (
                <button
                  key={fw}
                  onClick={() => setFramework(fw)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all border ${
                    framework === fw
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/30'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-750 hover:border-gray-600'
                  }`}
                >
                  {fw}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Requirements
            </label>
            <textarea
              value={additionalPrompt}
              onChange={(e) => setAdditionalPrompt(e.target.value)}
              placeholder="E.g., Use a dark theme, make the header sticky, use specific colors..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-32"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !mockupImage}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/50 mt-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Code className="w-5 h-5" />
                Generate Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Column */}
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col overflow-hidden">
        {generatedCode ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-400" />
                Generated Component
                <span className="text-xs font-normal text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700">
                  {framework}
                </span>
              </h3>
              <div className="flex gap-2">
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors border border-gray-700"
                    title="Download File"
                >
                    <Download className="w-4 h-4" />
                    Download
                </button>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white transition-colors"
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-[#1e1e1e] rounded-xl p-4 font-mono text-sm border border-gray-800 shadow-inner">
               <pre className="text-gray-300">
                <code>{generatedCode.componentCode}</code>
               </pre>
            </div>
            <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-800 max-h-48 overflow-y-auto">
              <h4 className="text-xs font-semibold text-indigo-400 mb-2 uppercase tracking-wider">Implementation Notes</h4>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {generatedCode.explanation}
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
             <Code className="w-16 h-16 opacity-20 mb-4" />
             <p className="text-lg font-medium">Ready to generate</p>
             <p className="text-sm max-w-sm text-center mt-2">Upload a design mockup and select your target framework to receive production-ready code.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeGenerator;