
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Code, Play } from 'lucide-react';

interface HeaderProps {
  currentMode: 'build' | 'interact';
  onModeChange: (mode: 'build' | 'interact') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentMode, onModeChange }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-stone-800 to-stone-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-light tracking-wide text-stone-800">
              VODUE
            </h1>
            <span className="text-xs uppercase tracking-widest text-stone-500 font-medium">
              Vibe Coding Interface
            </span>
          </div>
          
          <nav className="flex items-center space-x-1">
            <Button
              variant={currentMode === 'build' ? 'default' : 'ghost'}
              onClick={() => onModeChange('build')}
              className="flex items-center space-x-2 px-6 py-2"
            >
              <Code className="w-4 h-4" />
              <span>BUILD</span>
            </Button>
            
            <Button
              variant={currentMode === 'interact' ? 'default' : 'ghost'}
              onClick={() => onModeChange('interact')}
              className="flex items-center space-x-2 px-6 py-2"
            >
              <Play className="w-4 h-4" />
              <span>INTERACT</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};
