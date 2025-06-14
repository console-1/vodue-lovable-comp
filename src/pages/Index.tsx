
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { BuildMode } from '@/components/BuildMode';
import { InteractMode } from '@/components/InteractMode';
import { Sidebar } from '@/components/Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const Index = () => {
  const [currentMode, setCurrentMode] = useState<'build' | 'interact'>('build');
  const [workflows, setWorkflows] = useState([]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
        <Header currentMode={currentMode} onModeChange={setCurrentMode} />
        
        <div className="flex h-screen pt-16">
          <main className="flex-1 flex">
            {currentMode === 'build' ? (
              <BuildMode workflows={workflows} onWorkflowCreate={setWorkflows} />
            ) : (
              <InteractMode workflows={workflows} />
            )}
          </main>
          
          <Sidebar currentMode={currentMode} />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
