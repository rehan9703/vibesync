import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  History as HistoryIcon,
  Settings as SettingsIcon,
  Zap,
  Terminal,
  Menu
} from 'lucide-react';

import LandingPage from './components/LandingPage';
import APIKeySetup from './components/APIKeySetup';
import Wizard from './components/Wizard';
import ResultView from './components/ResultView';
import Sidebar from './components/Sidebar';
import HistoryPanel from './components/HistoryPanel';

const App = () => {
  const [view, setView] = useState('landing'); 
  const [keysConfigured, setKeysConfigured] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [currentMetadata, setCurrentMetadata] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 800);
  const [theme, setTheme] = useState(localStorage.getItem('vibesync_theme') || 'light');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vibesync_theme', theme);
  }, [theme]);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 800) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const savedKeys = localStorage.getItem('promptforge_keys');
    if (savedKeys) {
      setKeysConfigured(true);
    }
    const savedHistory = localStorage.getItem('promptforge_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (appData, prompt, meta) => {
    // Try to extract app name from bold markdown
    const boldMatch = prompt.match(/\*\*([^*]{3,40})\*\*/);
    const nameGuess = boldMatch ? boldMatch[1].trim() : (appData.appName || 'Untitled Blueprint');
    const newEntry = {
      id: Date.now(),
      appName: nameGuess,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      wordCount: prompt.split(/\s+/).filter(Boolean).length,
      prompt: prompt,
      formData: appData,
      metadata: meta || null
    };
    const newHistory = [newEntry, ...history].slice(0, 20); // Keep up to 20
    setHistory(newHistory);
    localStorage.setItem('promptforge_history', JSON.stringify(newHistory));
  };

  const deleteHistoryItem = (id) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('promptforge_history', JSON.stringify(newHistory));
  };

  const loadPrompt = (item) => {
    setCurrentPrompt(item.prompt);
    setCurrentMetadata(item.metadata || null);
    setView('result');
    setShowHistory(false);
  };

  const handleGetStarted = () => {
    if (keysConfigured) {
      setView('wizard');
    } else {
      setView('setup');
    }
  };

  return (
    <div className="app-container">
      <div className="bg-gradient" />
      <div className="bg-grid" />
      
      <div className="main-layout" style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && window.innerWidth <= 800 && (
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90, backdropFilter: 'blur(4px)' }} 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {view !== 'landing' && (
          <Sidebar 
            currentView={view} 
            setView={setView} 
            onHistoryClick={() => setShowHistory(true)}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            theme={theme}
            setTheme={setTheme}
          />
        )}
        
        <main className="main-content" style={{ 
          flex: 1, 
          padding: view === 'landing' ? 0 : '2rem', 
          maxWidth: '1400px', 
          margin: '0 auto', 
          width: '100%',
          position: 'relative',
          paddingTop: view !== 'landing' && window.innerWidth <= 800 ? '4rem' : (view === 'landing' ? 0 : '2rem')
        }}>
          {view !== 'landing' && window.innerWidth <= 800 && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 50, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Menu size={24} />
            </button>
          )}

          <AnimatePresence mode="wait">
            {view === 'landing' && (
              <LandingPage key="landing" onStart={handleGetStarted} />
            )}
            
            {view === 'setup' && (
              <APIKeySetup 
                key="setup" 
                onComplete={() => {
                  setKeysConfigured(true);
                  setView('wizard');
                }} 
              />
            )}
            
            {view === 'wizard' && (
              <Wizard 
                key="wizard" 
                onGenerate={(appData, prompt, meta) => {
                  setCurrentPrompt(prompt);
                  setCurrentMetadata(meta);
                  saveToHistory(appData, prompt, meta);
                  setView('result');
                }} 
              />
            )}
            
            {view === 'result' && (
              <ResultView 
                key="result" 
                prompt={currentPrompt}
                metadata={currentMetadata}
                onReset={() => setView('wizard')}
              />
            )}
          </AnimatePresence>

          <HistoryPanel 
            isOpen={showHistory} 
            onClose={() => setShowHistory(false)}
            history={history}
            onLoad={loadPrompt}
            onDelete={deleteHistoryItem}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
