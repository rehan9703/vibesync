import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { conductAIRequest, MODEL_LISTS } from '../services/aiService';
import {
  Shield, Lock, Eye, EyeOff, CheckCircle2, AlertCircle,
  ExternalLink, Zap, Loader2, Copy, Trash2, ChevronDown,
  ChevronUp, Globe, Server, Cpu, RefreshCw, Info, Check,
  Terminal, ArrowRight
} from 'lucide-react';

// ─── Provider Registry ───────────────────────────────────────────────────────
const CLOUD_PROVIDERS = [
  {
    id: 'anthropic', name: 'Anthropic', icon: '🎭', color: '#d97757',
    desc: 'Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku',
    badge: 'Best for reasoning', badgeColor: '#d97757',
    link: 'https://console.anthropic.com/settings/keys',
    placeholder: 'sk-ant-api03-xxxxxxxxxxxx',
    keyHint: 'Starts with sk-ant-',
    docs: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api'
  },
  {
    id: 'openai', name: 'OpenAI', icon: '🤖', color: '#10a37f',
    desc: 'GPT-4o, GPT-4o Mini, o1 Preview, GPT-4 Turbo',
    badge: 'Most popular', badgeColor: '#10a37f',
    link: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-proj-xxxxxxxxxxxx',
    keyHint: 'Starts with sk-proj- or sk-',
    docs: 'https://platform.openai.com/docs/quickstart'
  },
  {
    id: 'gemini', name: 'Google Gemini', icon: '✨', color: '#1a73e8',
    desc: 'Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 1.0 Pro',
    badge: 'Free tier available', badgeColor: '#1a73e8',
    link: 'https://aistudio.google.com/app/apikey',
    placeholder: 'AIzaSyxxxxxxxxxxxx',
    keyHint: 'Starts with AIzaSy',
    docs: 'https://ai.google.dev/gemini-api/docs/quickstart'
  },
  {
    id: 'groq', name: 'Groq', icon: '⚡', color: '#f55036',
    desc: 'Llama 3.3 70B, Llama 3.1 8B, Mixtral 8x7B — Fastest inference',
    badge: 'Fastest inference', badgeColor: '#f55036',
    link: 'https://console.groq.com/keys',
    placeholder: 'gsk_xxxxxxxxxxxx',
    keyHint: 'Starts with gsk_',
    docs: 'https://console.groq.com/docs/quickstart'
  },
  {
    id: 'deepseek', name: 'DeepSeek', icon: '🔍', color: '#4c6ef5',
    desc: 'DeepSeek V3 (Chat), DeepSeek R1 (Reasoner)',
    badge: 'Best code + math', badgeColor: '#4c6ef5',
    link: 'https://platform.deepseek.com/api_keys',
    placeholder: 'sk-xxxxxxxxxxxx',
    keyHint: 'Starts with sk-',
    docs: 'https://api-docs.deepseek.com/'
  },
  {
    id: 'mistral', name: 'Mistral AI', icon: '🌊', color: '#fd7e14',
    desc: 'Mistral Large, Mistral Medium, Mistral Small',
    badge: 'Open models', badgeColor: '#fd7e14',
    link: 'https://console.mistral.ai/api-keys/',
    placeholder: 'xxxxxxxxxxxxxxxxxxxx',
    keyHint: '32-char hex string',
    docs: 'https://docs.mistral.ai/'
  },
  {
    id: 'openrouter', name: 'OpenRouter', icon: '🌌', color: '#7e22ce',
    desc: '500+ models: Claude, GPT-4o, Gemini, Llama — one key',
    badge: '500+ models', badgeColor: '#7e22ce',
    link: 'https://openrouter.ai/keys',
    placeholder: 'sk-or-v1-xxxxxxxxxxxx',
    keyHint: 'Starts with sk-or-',
    docs: 'https://openrouter.ai/docs'
  },
  {
    id: 'cohere', name: 'Cohere', icon: '🧬', color: '#315f6b',
    desc: 'Command R+, Command R — great for RAG',
    badge: 'Great for RAG', badgeColor: '#315f6b',
    link: 'https://dashboard.cohere.com/api-keys',
    placeholder: 'xxxxxxxxxxxxxxxxxxxx',
    keyHint: '40-char string',
    docs: 'https://docs.cohere.com/docs/the-cohere-platform'
  },
  {
    id: 'xai', name: 'xAI (Grok)', icon: '✖️', color: '#e5e7eb',
    desc: 'Grok-2, Grok Vision — real-time web knowledge',
    badge: 'Real-time web', badgeColor: '#6b7280',
    link: 'https://console.x.ai/',
    placeholder: 'xai-xxxxxxxxxxxx',
    keyHint: 'Starts with xai-',
    docs: 'https://docs.x.ai/docs'
  },
  {
    id: 'perplexity', name: 'Perplexity', icon: '🔎', color: '#20b2aa',
    desc: 'Sonar Llama 70B, Sonar 8B — web-grounded answers',
    badge: 'Web-grounded', badgeColor: '#20b2aa',
    link: 'https://www.perplexity.ai/settings/api',
    placeholder: 'pplx-xxxxxxxxxxxx',
    keyHint: 'Starts with pplx-',
    docs: 'https://docs.perplexity.ai/'
  },
  {
    id: 'together', name: 'Together AI', icon: '🤝', color: '#0ea5e9',
    desc: 'Llama 3.3 70B, Mixtral, DeepSeek — cheap & fast',
    badge: 'Cheapest inference', badgeColor: '#0ea5e9',
    link: 'https://api.together.xyz/settings/api-keys',
    placeholder: 'xxxxxxxxxxxxxxxxxxxx',
    keyHint: '64-char hex string',
    docs: 'https://docs.together.ai/'
  },
  {
    id: 'fireworks', name: 'Fireworks AI', icon: '🎆', color: '#e11d48',
    desc: 'Llama 3.3 70B, CodeLlama — fast + affordable',
    badge: 'High throughput', badgeColor: '#e11d48',
    link: 'https://fireworks.ai/account/api-keys',
    placeholder: 'fw_xxxxxxxxxxxx',
    keyHint: 'Starts with fw_',
    docs: 'https://docs.fireworks.ai/'
  },
];

const LOCAL_PROVIDERS = [
  {
    id: 'ollama', name: 'Ollama', icon: '🦙', color: '#6366f1',
    desc: '18+ local models: Llama 3, Mistral, Gemma, Qwen, Phi, CodeLlama, DeepSeek Coder',
    badge: 'Free forever', badgeColor: '#6366f1',
    defaultEndpoint: 'http://localhost:11434/v1/chat/completions',
    setupSteps: [
      'Install Ollama: curl -fsSL https://ollama.com/install.sh | sh',
      'Pull a model: ollama pull llama3.2',
      'Start serving: ollama serve (runs on port 11434)',
      'Select your model below and click Test Connection'
    ],
    installLink: 'https://ollama.com/',
    docs: 'https://github.com/ollama/ollama/blob/main/docs/api.md',
    noKeyRequired: true
  },
  {
    id: 'lmstudio', name: 'LM Studio', icon: '🖥️', color: '#a855f7',
    desc: 'Run any GGUF model locally — supports llama.cpp & MLX. Works on Mac, Windows, Linux.',
    badge: 'GGUF models', badgeColor: '#a855f7',
    defaultEndpoint: 'http://localhost:1234/v1/chat/completions',
    setupSteps: [
      'Download LM Studio from lmstudio.ai',
      'Search and download any model in the app',
      'Go to Local Server tab → Start Server',
      'Default port is 1234 — no API key needed'
    ],
    installLink: 'https://lmstudio.ai/',
    docs: 'https://lmstudio.ai/docs',
    noKeyRequired: true
  },
  {
    id: 'jan', name: 'Jan', icon: '🤖', color: '#ec4899',
    desc: 'Open-source ChatGPT alternative that runs offline. Beautiful UI with model management.',
    badge: 'Privacy first', badgeColor: '#ec4899',
    defaultEndpoint: 'http://localhost:1337/v1/chat/completions',
    setupSteps: [
      'Download Jan from jan.ai',
      'Open Jan app and download any model',
      'Enable API server in Settings → API Server',
      'Jan runs on port 1337 — no key required'
    ],
    installLink: 'https://jan.ai/',
    docs: 'https://jan.ai/docs/local-api',
    noKeyRequired: true
  },
  {
    id: 'localai', name: 'LocalAI', icon: '🔧', color: '#f97316',
    desc: 'Free, open-source OpenAI alternative. Docker-based, supports any model format.',
    badge: 'Docker-based', badgeColor: '#f97316',
    defaultEndpoint: 'http://localhost:8080/v1/chat/completions',
    setupSteps: [
      'Install Docker and run: docker pull localai/localai:latest',
      'Start: docker run -p 8080:8080 localai/localai',
      'Download models via the API or web UI',
      'No API key required — connect directly'
    ],
    installLink: 'https://localai.io/',
    docs: 'https://localai.io/basics/getting_started/',
    noKeyRequired: true
  }
];

// ─── Component ───────────────────────────────────────────────────────────────
const APIKeySetup = ({ onComplete }) => {
  const [keys, setKeys] = useState({});
  const [localEndpoints, setLocalEndpoints] = useState({});
  const [visibleKeys, setVisibleKeys] = useState({});
  const [validating, setValidating] = useState({});
  const [status, setStatus] = useState({});    // 'success' | 'error'
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState('cloud'); // 'cloud' | 'local'
  const [customModels, setCustomModels] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('vibesync_keys');
    if (saved) {
      try { setKeys(JSON.parse(saved)); } catch(e) { console.error(e); }
    }
    const savedEndpoints = localStorage.getItem('vibesync_localendpoints');
    if (savedEndpoints) {
      try { setLocalEndpoints(JSON.parse(savedEndpoints)); } catch(e) { console.error(e); }
    }
    const savedModels = localStorage.getItem('vibesync_custommodels');
    if (savedModels) {
      try { setCustomModels(JSON.parse(savedModels)); } catch(e) { console.error(e); }
    }
  }, []);

  const saveKey = useCallback((id, val) => {
    const next = { ...keys, [id]: val };
    setKeys(next);
    localStorage.setItem('vibesync_keys', JSON.stringify(next));
    setStatus(s => ({ ...s, [id]: null }));
  }, [keys]);

  const saveEndpoint = useCallback((id, val) => {
    const next = { ...localEndpoints, [id]: val };
    setLocalEndpoints(next);
    localStorage.setItem('vibesync_localendpoints', JSON.stringify(next));
    // Also save per-provider config for aiService to read
    localStorage.setItem(`vibesync_localconfig_${id}`, JSON.stringify({ endpoint: val }));
    setStatus(s => ({ ...s, [id]: null }));
  }, [localEndpoints]);

  const saveCustomModel = useCallback((id, val) => {
    const next = { ...customModels, [id]: val };
    setCustomModels(next);
    localStorage.setItem('vibesync_custommodels', JSON.stringify(next));
  }, [customModels]);

  const deleteKey = useCallback((id) => {
    const next = { ...keys };
    delete next[id];
    setKeys(next);
    localStorage.setItem('vibesync_keys', JSON.stringify(next));
    setStatus(s => ({ ...s, [id]: null }));
  }, [keys]);

  const testConnection = async (provider) => {
    const isLocal = LOCAL_PROVIDERS.some(p => p.id === provider.id);
    const key = isLocal ? 'ollama' : (keys[provider.id] || '');
    if (!isLocal && !key) return;

    setValidating(v => ({ ...v, [provider.id]: true }));
    try {
      // For local providers, temporarily ensure the custom endpoint is stored
      if (isLocal && localEndpoints[provider.id]) {
        localStorage.setItem(`vibesync_localconfig_${provider.id}`, JSON.stringify({ endpoint: localEndpoints[provider.id] }));
      }
      const model = customModels[provider.id] || MODEL_LISTS[provider.id.toUpperCase()]?.[0]?.id || 'auto';
      await conductAIRequest(provider.id, key, "Say 'ok'", true, model);
      setStatus(s => ({ ...s, [provider.id]: 'success' }));
    } catch (e) {
      setStatus(s => ({ ...s, [provider.id]: 'error:' + e.message }));
    } finally {
      setValidating(v => ({ ...v, [provider.id]: false }));
    }
  };

  const copyKey = (id) => {
    navigator.clipboard.writeText(keys[id] || '');
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const configuredCloud = CLOUD_PROVIDERS.filter(p => keys[p.id]).length;
  const configuredLocal = LOCAL_PROVIDERS.filter(p => localEndpoints[p.id] || status[p.id] === 'success').length;
  const totalConfigured = configuredCloud + configuredLocal;

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
          <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', color: 'var(--primary)' }}>
            <Shield size={20} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Zero-Knowledge · Local Storage Only
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', letterSpacing: '-0.04em', marginBottom: '0.6rem' }}>
          Configure Your{' '}
          <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            AI Hub
          </span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
          Connect cloud AI providers <strong style={{ color: 'var(--text-primary)' }}>or run models locally</strong> with Ollama, LM Studio, Jan, or LocalAI.
          Keys are stored only in your browser — never sent to any server.
        </p>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: configuredCloud > 0 ? 'var(--accent)' : 'var(--border)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>{configuredCloud} / {CLOUD_PROVIDERS.length} cloud providers</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: configuredLocal > 0 ? 'var(--secondary)' : 'var(--border)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>{LOCAL_PROVIDERS.length} local AI engines supported</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <Lock size={12} style={{ color: 'var(--accent)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>No account · No signup · 100% private</span>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '4px', padding: '5px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', width: 'fit-content', marginBottom: '2rem' }}>
        {[
          { id: 'cloud', icon: <Globe size={15} />, label: `Cloud APIs (${CLOUD_PROVIDERS.length})` },
          { id: 'local', icon: <Server size={15} />, label: `Local AI (${LOCAL_PROVIDERS.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '0.6rem 1.25rem', borderRadius: '10px',
              border: 'none', cursor: 'pointer',
              background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.15))' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? '700' : '500',
              fontSize: '0.875rem', transition: 'all 0.2s',
              outline: activeTab === tab.id ? '1px solid rgba(59,130,246,0.3)' : 'none'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Cloud Providers */}
      <AnimatePresence mode="wait">
        {activeTab === 'cloud' && (
          <motion.div key="cloud" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {CLOUD_PROVIDERS.map(p => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  apiKey={keys[p.id] || ''}
                  visible={visibleKeys[p.id]}
                  validating={validating[p.id]}
                  status={status[p.id]}
                  expanded={expanded === p.id}
                  onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
                  onKeyChange={v => saveKey(p.id, v)}
                  onToggleVisible={() => setVisibleKeys(s => ({ ...s, [p.id]: !s[p.id] }))}
                  onTest={() => testConnection(p)}
                  onDelete={() => deleteKey(p.id)}
                  onCopy={() => copyKey(p.id)}
                  copied={copiedKey === p.id}
                  modelList={MODEL_LISTS[p.id.toUpperCase()]}
                  selectedModel={customModels[p.id]}
                  onModelChange={v => saveCustomModel(p.id, v)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'local' && (
          <motion.div key="local" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '1.5rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Info size={16} style={{ color: '#6366f1', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Local AI is completely free</strong> — no API keys, no usage limits, no data leaves your machine.
                Install any of these engines, start the server, and click Test Connection. Your custom models, your rules.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {LOCAL_PROVIDERS.map(p => (
                <LocalProviderCard
                  key={p.id}
                  provider={p}
                  endpoint={localEndpoints[p.id] || p.defaultEndpoint}
                  validating={validating[p.id]}
                  status={status[p.id]}
                  expanded={expanded === p.id}
                  onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
                  onEndpointChange={v => saveEndpoint(p.id, v)}
                  onTest={() => testConnection(p)}
                  modelList={MODEL_LISTS[p.id.toUpperCase()]}
                  selectedModel={customModels[p.id]}
                  onModelChange={v => saveCustomModel(p.id, v)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launch Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: totalConfigured > 0 || true ? 1 : 0 }}
        style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border)' }}
      >
        <button
          onClick={onComplete}
          className="btn-primary"
          style={{ padding: '1.1rem 3.5rem', fontSize: '1.1rem', borderRadius: '14px', boxShadow: '0 8px 32px var(--primary-glow)' }}
        >
          <Zap size={20} />
          {totalConfigured > 0 ? `Launch VibeSync (${totalConfigured} provider${totalConfigured > 1 ? 's' : ''} ready)` : 'Launch VibeSync'}
          <ArrowRight size={18} />
        </button>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Shield size={12} style={{ color: 'var(--accent)' }} />
          Keys stored in localStorage only · Never transmitted · No account required
        </p>
      </motion.div>
    </div>
  );
};

// ─── Cloud Provider Card ──────────────────────────────────────────────────────
const ProviderCard = ({
  provider: p, apiKey, visible, validating, status, expanded,
  onToggle, onKeyChange, onToggleVisible, onTest, onDelete, onCopy, copied,
  modelList, selectedModel, onModelChange
}) => {
  const isConfigured = !!apiKey;
  const isSuccess = status === 'success';
  const isError = status?.startsWith('error:');
  const errorMsg = isError ? status.replace('error:', '') : null;

  return (
    <motion.div
      layout
      style={{
        background: isConfigured ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.4)' : isError ? 'rgba(239,68,68,0.35)' : isConfigured ? `${p.color}33` : 'var(--border)'}`,
        borderRadius: '16px', overflow: 'hidden', transition: 'border-color 0.3s'
      }}
    >
      {/* Top row */}
      <div
        onClick={onToggle}
        style={{ padding: '1.1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
      >
        <div style={{ fontSize: '1.6rem', flexShrink: 0 }}>{p.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{p.name}</span>
            <span style={{ fontSize: '0.62rem', fontWeight: '700', padding: '2px 7px', borderRadius: '100px', background: `${p.color}22`, color: p.color, whiteSpace: 'nowrap' }}>{p.badge}</span>
          </div>
          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.desc}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {isSuccess && <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />}
          {isError && <AlertCircle size={16} style={{ color: '#ef4444' }} />}
          {isConfigured && !isSuccess && !isError && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />}
          {expanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </div>

      {/* Expanded form */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--border)' }}>
              {/* Key input */}
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>API Key</label>
                  <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    Get Key <ExternalLink size={11} />
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={visible ? 'text' : 'password'}
                    value={apiKey}
                    onChange={e => onKeyChange(e.target.value)}
                    placeholder={p.placeholder}
                    style={{
                      width: '100%', background: 'var(--bg-main)',
                      border: `1px solid ${isError ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
                      borderRadius: '8px', padding: '0.7rem 4.5rem 0.7rem 0.9rem',
                      color: 'var(--text-primary)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)',
                      outline: 'none', transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = isError ? 'rgba(239,68,68,0.4)' : 'var(--border)'}
                  />
                  <div style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '4px' }}>
                    {apiKey && (
                      <button onClick={onCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)', display: 'flex' }} title="Copy">
                        {copied ? <Check size={14} style={{ color: 'var(--accent)' }} /> : <Copy size={14} />}
                      </button>
                    )}
                    <button onClick={onToggleVisible} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)', display: 'flex' }}>
                      {visible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>{p.keyHint}</p>
              </div>

              {/* Model selector */}
              {modelList && (
                <div style={{ marginTop: '0.85rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.4rem' }}>Default Model</label>
                  <select
                    value={selectedModel || modelList[0]?.id}
                    onChange={e => onModelChange(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.6rem 0.9rem', color: 'var(--text-primary)', fontSize: '0.82rem', fontFamily: 'var(--font-main)', outline: 'none', cursor: 'pointer' }}
                  >
                    {modelList.map(m => (
                      <option key={m.id} value={m.id}>{m.name} [{m.type}]</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Error message */}
              {isError && (
                <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontSize: '0.75rem', color: '#fca5a5', lineHeight: 1.5 }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
                <button
                  className="btn-primary"
                  onClick={onTest}
                  disabled={validating || !apiKey}
                  style={{ flex: 1, justifyContent: 'center', padding: '0.6rem', fontSize: '0.82rem', borderRadius: '8px' }}
                >
                  {validating ? <><Loader2 size={14} className="animate-spin" /> Testing…</> : isSuccess ? <><CheckCircle2 size={14} /> Connected!</> : <><Zap size={14} /> Test Connection</>}
                </button>
                {apiKey && (
                  <button onClick={onDelete} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '0.6rem 0.75rem', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Local Provider Card ──────────────────────────────────────────────────────
const LocalProviderCard = ({
  provider: p, endpoint, validating, status, expanded,
  onToggle, onEndpointChange, onTest,
  modelList, selectedModel, onModelChange
}) => {
  const isSuccess = status === 'success';
  const isError = status?.startsWith('error:');
  const errorMsg = isError ? status.replace('error:', '') : null;

  return (
    <motion.div
      layout
      style={{
        background: isSuccess ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.4)' : isError ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
        borderRadius: '16px', overflow: 'hidden', transition: 'border-color 0.3s'
      }}
    >
      <div onClick={onToggle} style={{ padding: '1.1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '1.6rem', flexShrink: 0 }}>{p.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{p.name}</span>
            <span style={{ fontSize: '0.62rem', fontWeight: '700', padding: '2px 7px', borderRadius: '100px', background: `${p.color}22`, color: p.color }}>{p.badge}</span>
            <span style={{ fontSize: '0.6rem', fontWeight: '700', padding: '1px 6px', borderRadius: '100px', background: 'rgba(16,185,129,0.12)', color: 'var(--accent)' }}>NO KEY</span>
          </div>
          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.desc}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {isSuccess && <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />}
          {isError && <AlertCircle size={16} style={{ color: '#ef4444' }} />}
          {expanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {/* Setup steps */}
              <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: 'var(--bg-main)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <Terminal size={11} style={{ display: 'inline', marginRight: '5px' }} />Setup Steps
                  </span>
                  <a href={p.installLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: p.color, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    Install <ExternalLink size={10} />
                  </a>
                </div>
                <ol style={{ paddingLeft: '1.1rem', margin: 0 }}>
                  {p.setupSteps.map((step, i) => (
                    <li key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '2px', fontFamily: i === 0 ? 'var(--font-mono)' : 'inherit', fontSize: i === 0 ? '0.7rem' : '0.75rem' }}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Endpoint input */}
              <div style={{ marginTop: '0.85rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.4rem' }}>Server URL</label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={e => onEndpointChange(e.target.value)}
                  placeholder={p.defaultEndpoint}
                  style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.7rem 0.9rem', color: 'var(--text-primary)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = p.color}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <p style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: '3px' }}>Default: {p.defaultEndpoint}</p>
              </div>

              {/* Model selector */}
              {modelList && modelList.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.4rem' }}>Model Name</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select
                      value={selectedModel || modelList[0]?.id}
                      onChange={e => onModelChange(e.target.value)}
                      style={{ flex: 1, background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.6rem 0.9rem', color: 'var(--text-primary)', fontSize: '0.78rem', outline: 'none', cursor: 'pointer' }}
                    >
                      {modelList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <input
                      type="text"
                      placeholder="or type custom..."
                      onChange={e => onModelChange(e.target.value)}
                      style={{ flex: 1, background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.6rem 0.9rem', color: 'var(--text-primary)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', outline: 'none' }}
                    />
                  </div>
                  <p style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: '3px' }}>Type <code style={{ background: 'var(--border)', padding: '1px 4px', borderRadius: '3px' }}>ollama list</code> to see installed models</p>
                </div>
              )}

              {/* Error */}
              {isError && (
                <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontSize: '0.75rem', color: '#fca5a5', lineHeight: 1.5 }}>
                  ⚠️ {errorMsg}
                  <br /><span style={{ opacity: 0.7 }}>Make sure the server is running. Check the port and try again.</span>
                </div>
              )}

              {/* Test button */}
              <button
                className="btn-primary"
                onClick={onTest}
                disabled={validating}
                style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', fontSize: '0.85rem', borderRadius: '8px', marginTop: '1rem', background: isSuccess ? 'linear-gradient(135deg, rgba(16,185,129,0.8), rgba(16,185,129,0.5))' : undefined }}
              >
                {validating ? <><Loader2 size={14} className="animate-spin" /> Connecting…</> : isSuccess ? <><CheckCircle2 size={14} /> Connected!</> : <><RefreshCw size={14} /> Test Connection</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default APIKeySetup;
