import React from 'react';
import { AppView } from '../types';
import { 
  Palette, 
  Image as ImageIcon, 
  Code, 
  Video, 
  Settings,
  Layout
} from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: AppView.IMAGE_GENERATOR, label: 'Asset Generator', icon: ImageIcon },
    { id: AppView.IMAGE_EDITOR, label: 'Image Editor', icon: Palette },
    { id: AppView.VIDEO_GENERATOR, label: 'Video Creator', icon: Video },
    { id: AppView.CODE_GENERATOR, label: 'Code Generator', icon: Code },
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      <div className="p-6 border-b border-gray-800 flex items-center gap-3">
        <div className="p-2 bg-indigo-600 rounded-lg">
          <Layout className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">ITechies</h1>
          <p className="text-xs text-gray-400">AI Design Suite</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <div className="mt-4 px-4">
             <div className="text-xs text-gray-600 text-center">
                 v1.0.0 • Powered by Gemini
             </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;