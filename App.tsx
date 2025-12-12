import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import CodeGenerator from './components/CodeGenerator';
import VideoGenerator from './components/VideoGenerator';
import ChatAssistant from './components/ChatAssistant';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.IMAGE_GENERATOR);

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