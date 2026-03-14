import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { conductAIRequest, generateAppPrompt, MODEL_LISTS, VIBE_STYLES, VIBE_AUDIENCES } from '../services/aiService';
import { VIBE_AESTHETICS, matchAndAugmentPrompt } from '../services/vibeKnowledgeBase';
import { 
  User, 
  Lightbulb, 
  Cpu, 
  Layers, 
  Eye, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Check,
  Zap,
  Loader2,
  X,
  AlertTriangle
} from 'lucide-react';

const steps = [
  { id: 1, title: 'About You', icon: <User size={18} /> },
  { id: 2, title: 'App Idea', icon: <Lightbulb size={18} /> },
  { id: 3, title: 'Tech & Platform', icon: <Cpu size={18} /> },
  { id: 4, title: 'Features & Design', icon: <Layers size={18} /> },
  { id: 5, title: 'Review', icon: <Eye size={18} /> },
];

const Wizard = ({ onGenerate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuggesting, setIsSuggesting] = useState(null); // 'name' or 'tagline' (loading state)
  const [suggestionTarget, setSuggestionTarget] = useState(null); // 'name' or 'tagline' (target field)
  const [suggestions, setSuggestions] = useState([]);
  
  const [formData, setFormData] = useState({
    userName: '',
    role: '',
    experience: 'intermediate',
    goal: '',
    timeline: '',
    appName: '',
    tagline: '',
    description: '',
    targetUsers: '',
    platform: 'web',
    stack: '',
    monetization: '',
    budget: '',
    features: [],
    uiStyle: 'modern clean',
    colorTheme: 'dark',
    extraContext: '',
    outputFormat: 'master prompt' // master prompt, step-by-step, PRD, component breakdown
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKeys, setApiKeys] = useState({});
  const [preferredProvider, setPreferredProvider] = useState('anthropic');
  const [selectedModel, setSelectedModel] = useState(null);
  const [vibeStyle, setVibeStyle] = useState('technical');
  const [vibeAudience, setVibeAudience] = useState('developers');
  const [vibeAesthetic, setVibeAesthetic] = useState('glassmorphism');
  const [beastModeActive, setBeastModeActive] = useState(false);
  const [customModels, setCustomModels] = useState({});
  const [activeLocalProviders, setActiveLocalProviders] = useState([]);

  const LOCAL_PROVIDER_IDS = ['ollama', 'lmstudio', 'jan', 'localai'];
  const FEATURE_LIST = [
    'Authentication', 'AI Agent Integration', 'Real-time Chat', 'Dark Mode', 
    'Push Notifications', 'Payment Gateways', 'Admin Dashboard', 
    'File Management', 'Search Engine', 'Analytics Tracking', 'Team Management', 
    'Offline Capability', 'SEO Optimization', 'Mobile PWA', 'Social Login', 'Export PDF/JSON'
  ];

  // Update selectedModel when preferredProvider changes
  useEffect(() => {
    if (preferredProvider) {
      if (customModels[preferredProvider]) {
        setSelectedModel(customModels[preferredProvider]);
        return;
      }
      const models = MODEL_LISTS[preferredProvider.toUpperCase()];
      if (models && models.length > 0) {
        // Default to a power model if available
        const powerModel = models.find(m => m.type === 'power') || models[0];
        setSelectedModel(powerModel.id);
      }
    }
  }, [preferredProvider]);

  useEffect(() => {
    const savedKeys = localStorage.getItem('vibesync_keys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setApiKeys(parsed);
        const first = Object.keys(parsed).find(k => parsed[k]);
        if (first) setPreferredProvider(first);
      } catch (e) {
        console.error("Failed to parse API keys from localStorage:", e);
      }
    }
    const savedModels = localStorage.getItem('vibesync_custommodels');
    if (savedModels) {
      try {
        setCustomModels(JSON.parse(savedModels));
      } catch (e) {
        console.error("Failed to parse custom models from localStorage:", e);
      }
    }

    let endpoints = {};
    try {
      endpoints = JSON.parse(localStorage.getItem('vibesync_localendpoints') || '{}');
    } catch (e) {
      console.error("Failed to parse local endpoints from localStorage:", e);
    }

    let customMods = {};
    try {
      customMods = JSON.parse(localStorage.getItem('vibesync_custommodels') || '{}');
    } catch (e) {
      console.error("Failed to parse custom models (for local providers) from localStorage:", e);
    }
    
    const active = LOCAL_PROVIDER_IDS.filter(id => {
      const isConfigured = localStorage.getItem(`vibesync_localconfig_${id}`);
      return isConfigured || endpoints[id] || customMods[id];
    });
    setActiveLocalProviders(active);
  }, []);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-detect Beast Mode when user data changes
  useEffect(() => {
    const augmentations = matchAndAugmentPrompt(formData);
    setBeastModeActive(augmentations.beastModeActivated);
  }, [formData.features, formData.platform, formData.experience, formData.uiStyle]);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSuggest = async (type) => {
    if (!formData.description) return alert("Please provide a description first!");
    const isLocal = LOCAL_PROVIDER_IDS.includes(preferredProvider);
    if (!isLocal && !apiKeys[preferredProvider]) return alert(`Please configure your ${preferredProvider} API Key first!`);
    
    setIsSuggesting(type);
    setSuggestionTarget(type);
    
    try {
      const prompt = type === 'name' 
        ? `Suggest 6 catchy, short, memorable app names for this idea: ${formData.description}. Return ONLY the names as a comma separated list.`
        : `Suggest 4 punchy, one-line marketing pitches for this app idea: ${formData.description}. Return ONLY the pitches as a comma separated list.`;
      
      const response = await conductAIRequest(preferredProvider, apiKeys[preferredProvider], prompt, true);
      const suggestionsArray = response.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
      setSuggestions(suggestionsArray);
    } catch (error) {
      console.error(error);
      alert("AI Suggestion failed: " + error.message);
    } finally {
      setIsSuggesting(null);
    }
  };

  const handleGenerate = async () => {
    const isLocal = LOCAL_PROVIDER_IDS.includes(preferredProvider);
    if (!isLocal && !apiKeys[preferredProvider]) return alert(`Please configure your ${preferredProvider} API Key in the API Keys section first!`);
    setIsGenerating(true);
    try {
      // Inject vibeAesthetic into form data for the knowledge base matcher
      const enrichedData = { ...formData, uiStyle: vibeAesthetic || formData.uiStyle };
      const userPrompt = generateAppPrompt(enrichedData, vibeStyle, vibeAudience);
      const response = await conductAIRequest(
        preferredProvider, 
        apiKeys[preferredProvider], 
        userPrompt,
        false,
        selectedModel
      );
      
      const executionMeta = {
        provider: preferredProvider,
        model: selectedModel || 'default'
      };
      
      onGenerate(formData, response, executionMeta);
    } catch (error) {
      console.error(error);
      alert("Generation failed: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="wizard-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Progress Bar */}
      <div className="wizard-progress" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '3.5rem',
        position: 'relative',
        padding: '0 1rem'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '2rem', 
          right: '2rem', 
          height: '2px', 
          background: 'var(--border)', 
          zIndex: 0
        }} />
        {steps.map(step => (
          <div key={step.id} style={{ 
            zIndex: 1, 
            background: 'var(--bg-main)', 
            padding: '0 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: currentStep >= step.id ? 'var(--primary)' : 'var(--bg-card)',
              border: currentStep >= step.id ? 'none' : '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentStep >= step.id ? 'white' : 'var(--text-muted)',
              transition: 'all 0.3s ease',
              boxShadow: currentStep >= step.id ? '0 0 15px var(--primary-glow)' : 'none'
            }}>
              {currentStep > step.id ? <Check size={20} /> : step.icon}
            </div>
            <span style={{ 
              fontSize: '0.7rem', 
              fontWeight: '700', 
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: currentStep >= step.id ? 'var(--primary)' : 'var(--text-muted)' 
            }}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="glass-card"
          style={{ minHeight: '550px', padding: '3rem' }}
        >
          {currentStep === 1 && (
            <div className="step-content">
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--primary)' }}><User size={24}/></div>
                <div>
                  <h2 style={{ fontSize: '1.75rem' }}>About You</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Personlize the AI results based on your profile.</p>
                </div>
              </div>
              
              <div className="responsive-grid-2" style={{ gap: '2rem', marginTop: '2rem' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={formData.userName} onChange={e => updateField('userName', e.target.value)} placeholder="e.g. Rehan97" />
                </div>
                <div className="form-group">
                  <label>Your Role</label>
                  <select value={formData.role} onChange={e => updateField('role', e.target.value)}>
                    <option value="">Select your role</option>
                    <option value="student">Student</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="founder">Startup Founder</option>
                    <option value="developer">Professional Developer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Coding Experience</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                    {['beginner', 'intermediate', 'advanced'].map(lvl => (
                      <button 
                        key={lvl}
                        className={formData.experience === lvl ? 'chip-active' : 'chip'}
                        onClick={() => updateField('experience', lvl)}
                      >
                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Primary Objective</label>
                  <select value={formData.goal} onChange={e => updateField('goal', e.target.value)}>
                    <option value="">Select objective</option>
                    <option value="MVP">Rapid MVP (Vibe Coding)</option>
                    <option value="Full PRD">Complete PRD & Specs</option>
                    <option value="Technical V1">Technical V1 / Architecture</option>
                    <option value="Prototype">Quick Interface Prototype</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Project Timeline</label>
                  <input type="text" value={formData.timeline} onChange={e => updateField('timeline', e.target.value)} placeholder="e.g. 1 month / MVP by next week" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-content">
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ padding: '8px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', color: 'orange' }}><Lightbulb size={24}/></div>
                <div>
                  <h2 style={{ fontSize: '1.75rem' }}>Your App Idea</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>The heart of your project. Be as descriptive as possible.</p>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows={4} 
                  value={formData.description} 
                  onChange={e => updateField('description', e.target.value)} 
                  placeholder="What does your app do? What problem does it solve? Who is it for?"
                  style={{ resize: 'none' }}
                />
              </div>
              
              <div className="responsive-grid-2" style={{ gap: '2rem' }}>
                <div className="form-group">
                  <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                    App Name
                    <button 
                      className="btn-ai-suggest" 
                      onClick={() => handleSuggest('name')}
                      disabled={isSuggesting === 'name'}
                    >
                      {isSuggesting === 'name' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} 
                      AI Suggest
                    </button>
                  </label>
                  <input type="text" value={formData.appName} onChange={e => updateField('appName', e.target.value)} placeholder="e.g. MindBridge" />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                    One-line Pitch
                    <button 
                      className="btn-ai-suggest" 
                      onClick={() => handleSuggest('tagline')}
                      disabled={isSuggesting === 'tagline'}
                    >
                      {isSuggesting === 'tagline' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} 
                      AI Suggest
                    </button>
                  </label>
                  <input type="text" value={formData.tagline} onChange={e => updateField('tagline', e.target.value)} placeholder="The 'Uber' for study notes" />
                </div>
              </div>

              {suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px dashed var(--primary)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>AI SUGGESTIONS:</span>
                    <button onClick={() => { setSuggestions([]); setSuggestionTarget(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={14}/></button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {suggestions.map(s => (
                      <button 
                        key={s} 
                        className="chip" 
                        onClick={() => {
                          updateField(suggestionTarget === 'name' ? 'appName' : 'tagline', s);
                          setSuggestions([]);
                          setSuggestionTarget(null);
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="form-group">
                <label>Target Users</label>
                <input type="text" value={formData.targetUsers} onChange={e => updateField('targetUsers', e.target.value)} placeholder="e.g. Medical students, Freelance designers" />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="step-content">
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ padding: '8px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px', color: 'var(--secondary)' }}><Cpu size={24}/></div>
                <div>
                  <h2 style={{ fontSize: '1.75rem' }}>Tech & Platform</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Choose your technical foundation.</p>
                </div>
              </div>
              
              <div className="responsive-grid-2" style={{ gap: '2rem', marginTop: '2rem' }}>
                <div className="form-group">
                  <label>Primary Platform</label>
                  <select value={formData.platform} onChange={e => updateField('platform', e.target.value)}>
                    <option value="web">Web App (Modern Browser)</option>
                    <option value="android">Android App</option>
                    <option value="ios">iOS App</option>
                    <option value="cross-platform">Cross-Platform Mobile</option>
                    <option value="desktop">Desktop Application</option>
                    <option value="extension">Browser Extension</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tech Stack Preference</label>
                  <input type="text" value={formData.stack} onChange={e => updateField('stack', e.target.value)} placeholder="e.g. Next.js + Supabase / React Native" />
                </div>
                <div className="form-group">
                  <label>Monetization Strategy</label>
                  <select value={formData.monetization} onChange={e => updateField('monetization', e.target.value)}>
                    <option value="free">Completely Free</option>
                    <option value="freemium">Freemium (Free + Pro)</option>
                    <option value="subscription">Subscription Based</option>
                    <option value="ads">Ad-Supported</option>
                    <option value="one-time">One-time Purchase</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Monthly API/Ops Budget</label>
                  <input type="text" value={formData.budget} onChange={e => updateField('budget', e.target.value)} placeholder="e.g. $0 - $50 (Low/High)" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="step-content">
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', color: 'var(--accent)' }}><Layers size={24}/></div>
                <div>
                  <h2 style={{ fontSize: '1.75rem' }}>Features & Design</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pick top features and define the aesthetic soul.</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Features</label>
                <button 
                  onClick={() => {
                    if (formData.features.length === FEATURE_LIST.length) {
                      updateField('features', []);
                    } else {
                      updateField('features', FEATURE_LIST);
                    }
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  {formData.features.length === FEATURE_LIST.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="features-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', 
                gap: '12px',
                marginBottom: '2.5rem'
              }}>
                {FEATURE_LIST.map(feat => (
                  <div 
                    key={feat}
                    className={formData.features.includes(feat) ? 'feature-item-active' : 'feature-item'}
                    onClick={() => {
                      if (formData.features.includes(feat)) {
                        updateField('features', formData.features.filter(f => f !== feat));
                      } else {
                        updateField('features', [...formData.features, feat]);
                      }
                    }}
                  >
                    <div style={{ 
                      width: '20px', height: '20px', 
                      borderRadius: '6px', 
                      border: '1.5px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: formData.features.includes(feat) ? 'var(--primary)' : 'transparent',
                      borderColor: formData.features.includes(feat) ? 'var(--primary)' : 'var(--border)'
                    }}>
                      {formData.features.includes(feat) && <Check size={14} color="white" />}
                    </div>
                    {feat}
                  </div>
                ))}
              </div>

              <div className="responsive-grid-2" style={{ gap: '2rem' }}>
                <div className="form-group">
                  <label>UI Style Style</label>
                  <select value={formData.uiStyle} onChange={e => updateField('uiStyle', e.target.value)}>
                    <option value="modern clean">Modern & Clean</option>
                    <option value="dark cyberpunk">Dark Cyberpunk</option>
                    <option value="glassmorphism">Glassmorphism (Frosted)</option>
                    <option value="luxury premium">Luxury & Premium</option>
                    <option value="retro pixel">Retro Pixel</option>
                    <option value="minimalist">Minimalist / Zen</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Color Palette</label>
                  <input type="text" value={formData.colorTheme} onChange={e => updateField('colorTheme', e.target.value)} placeholder="e.g. Midnight Blue & Neon Pink" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="step-content">
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--primary)' }}><Eye size={24}/></div>
                <div>
                  <h2 style={{ fontSize: '1.75rem' }}>Review & Generate</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>The final step before your vision becomes a blueprint.</p>
                </div>
              </div>
              
              <div className="summary-grid responsive-grid-3" style={{ 
                gap: '1rem',
                marginBottom: '2rem',
                marginTop: '1.5rem'
              }}>
                <SummaryItem label="Project" value={formData.appName} />
                <SummaryItem label="Persona" value={formData.role} />
                <SummaryItem label="Objective" value={formData.goal} />
                <SummaryItem label="Theme" value={formData.colorTheme} />
                <SummaryItem label="Platform" value={formData.platform} />
                <SummaryItem label="Budget" value={formData.budget} />
              </div>

              <div className="form-group">
                <label>Export Format</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                  {['Master Prompt', 'Step-by-Step', 'Full PRD', 'Component List'].map(fmt => (
                    <button 
                      key={fmt}
                      className={formData.outputFormat === fmt ? 'chip-active' : 'chip'}
                      onClick={() => updateField('outputFormat', fmt)}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} className="text-primary" /> 
                  Execute Forge Using
                </label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {Object.keys(apiKeys).filter(k => apiKeys[k]).map(provider => (
                    <button 
                      key={provider}
                      className={preferredProvider === provider ? 'chip-active' : 'chip'}
                      onClick={() => setPreferredProvider(provider)}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {provider}
                    </button>
                  ))}
                  {activeLocalProviders.map(provider => (
                    <button 
                      key={provider}
                      className={preferredProvider === provider ? 'chip-active' : 'chip'}
                      onClick={() => setPreferredProvider(provider)}
                      style={{ textTransform: 'capitalize', borderStyle: 'dashed' }}
                      title="Local AI"
                    >
                      {provider} (Local)
                    </button>
                  ))}
                  {Object.keys(apiKeys).filter(k => apiKeys[k]).length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={14} style={{ color: '#f59e0b' }}/> Cloud APIs not configured. You can use Local AI instead.
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={16} className="text-secondary" /> 
                  Specific Model Version
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                  {MODEL_LISTS[preferredProvider.toUpperCase()]?.map(model => (
                    <button 
                      key={model.id}
                      className={selectedModel === model.id ? 'chip-active' : 'chip'}
                      onClick={() => setSelectedModel(model.id)}
                      style={{ 
                        fontSize: '0.8rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        padding: '0.6rem 1rem',
                        height: 'auto',
                        gap: '2px'
                      }}
                    >
                      <span style={{ fontWeight: '700' }}>{model.name}</span>
                      <span style={{ fontSize: '0.6rem', opacity: 0.7, textTransform: 'uppercase' }}>{model.type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="responsive-grid-2" style={{ gap: '2rem', marginTop: '1.5rem' }}>
                <div className="form-group">
                  <label>Writing Style (Vibe)</label>
                  <select value={vibeStyle} onChange={e => setVibeStyle(e.target.value)}>
                    {Object.keys(VIBE_STYLES).map(style => (
                      <option key={style} value={style}>{style.charAt(0).toUpperCase() + style.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Target Audience</label>
                  <select value={vibeAudience} onChange={e => setVibeAudience(e.target.value)}>
                    {Object.keys(VIBE_AUDIENCES).map(aud => (
                      <option key={aud} value={aud}>{aud.charAt(0).toUpperCase() + aud.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vibe Aesthetic Selector */}
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Visual Vibe Aesthetic <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '8px' }}>Auto-matched by Beast Mode Engine</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {Object.entries(VIBE_AESTHETICS).map(([key, vibe]) => (
                    <button
                      key={key}
                      onClick={() => setVibeAesthetic(key)}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '10px',
                        border: `2px solid ${vibeAesthetic === key ? 'var(--accent)' : 'var(--border)'}`,
                        background: vibeAesthetic === key ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
                        color: vibeAesthetic === key ? 'var(--accent)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: vibeAesthetic === key ? '700' : '500',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {vibe.label}
                    </button>
                  ))}
                </div>
                {vibeAesthetic && VIBE_AESTHETICS[vibeAesthetic] && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    {VIBE_AESTHETICS[vibeAesthetic].description}
                  </p>
                )}
              </div>

              {/* Beast Mode Status Badge */}
              <div style={{ marginTop: '1.5rem', padding: '1rem 1.5rem', borderRadius: '12px', background: beastModeActive ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${beastModeActive ? 'rgba(16,185,129,0.4)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.4s ease' }}>
                <span style={{ fontSize: '1.5rem' }}>{beastModeActive ? '⚡' : '💤'}</span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: beastModeActive ? 'var(--accent)' : 'var(--text-muted)' }}>
                    Beast Mode {beastModeActive ? 'ACTIVE' : 'Standby'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {beastModeActive
                      ? 'Your project data matched elite engineering patterns. Auto-injecting advanced directives into your blueprint.'
                      : 'Fill in more project details (features, platform) to activate Beast Mode auto-augmentation.'}
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Extra Constraints</label>
                <textarea 
                  rows={2} 
                  value={formData.extraContext} 
                  onChange={e => updateField('extraContext', e.target.value)} 
                  placeholder="e.g. No external CSS libraries, Must use Material UI..."
                  style={{ resize: 'none' }}
                />
              </div>
            </div>
          )}

          {/* Wizard Actions */}
          <div style={{ 
            marginTop: '3.5rem', 
            paddingTop: '2.5rem', 
            borderTop: 'var(--glass-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button 
              className="btn-secondary" 
              onClick={prevStep} 
              disabled={currentStep === 1 || isGenerating}
              style={{ opacity: currentStep === 1 ? 0.3 : 1 }}
            >
              <ChevronLeft size={20} /> Previous
            </button>

            {currentStep < 5 ? (
              <button className="btn-primary" onClick={nextStep}>
                Next Step <ChevronRight size={20} />
              </button>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary" 
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{ 
                  background: 'linear-gradient(135deg, var(--accent), var(--primary))',
                  padding: '1.2rem 2.5rem',
                  fontSize: '1.1rem',
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)'
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    Forging Project...
                  </>
                ) : (
                  <>
                    <Zap size={20} /> Generate Blueprint
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const SummaryItem = ({ label, value }) => (
  <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>{label}</div>
    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || 'None'}</div>
  </div>
);

export default Wizard;
