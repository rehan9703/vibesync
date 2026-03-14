import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Download, RefreshCw, Check, FileText, ClipboardCheck,
  Share2, Zap, Sparkles, Code2, BookOpen, ChevronDown, ChevronUp,
  ExternalLink, Maximize2, X, Layers
} from 'lucide-react';

// ─── Simple Markdown Renderer ───
// Converts the AI's Markdown output into rich, styled HTML
const renderMarkdown = (text) => {
  if (!text) return '';

  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Headings (process in reverse order to avoid partial matches)
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Horizontal rules
    .replace(/^---+$/gm, '<hr/>')
    // Code blocks (must come before inline code)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`)
    // Inline code
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    // Blockquotes
    .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    // Unordered lists
    .replace(/^\s*[-*+] (.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\s*\d+\. (.+)$/gm, '<oli>$1</oli>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Checkbox checkmarks
    .replace(/\[x\]/gi, '✅').replace(/\[ \]/gi, '☐')
    // Line breaks to paragraphs  
    .replace(/\n{2,}/g, '</p><p>')
    // Wrap consecutive <li> items
    .replace(/(<li>.*<\/li>(\n|$))+/g, (match) => `<ul>${match}</ul>`)
    .replace(/(<oli>.*<\/oli>(\n|$))+/g, (match) => `<ol>${match.replace(/<\/?oli>/g, m => m === '<oli>' ? '<li>' : '</li>')}</ol>`);

  // Wrap remaining text in paragraph tags  
  html = `<p>${html}</p>`;

  // Fix double-wrapping around block elements
  const blockTags = ['h1','h2','h3','h4','pre','blockquote','ul','ol','hr','table'];
  blockTags.forEach(tag => {
    html = html
      .replace(new RegExp(`<p><${tag}`, 'g'), `<${tag}`)
      .replace(new RegExp(`</${tag}></p>`, 'g'), `</${tag}>`);
  });

  // Clean empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
};

// ─── Section extractor ───
const extractSections = (text) => {
  if (!text) return [];
  const lines = text.split('\n');
  const sections = [];
  let current = null;
  
  lines.forEach(line => {
    const h2Match = line.match(/^#{1,2}\s+(.+)/);
    if (h2Match) {
      if (current) sections.push(current);
      current = { title: h2Match[1].replace(/[🔭🏗️⚙️🗄️🖥️🔩📡🎨🚀🔒🧪📌🎭📟📝🛠️✨📋]/g, '').trim(), content: '' };
    } else if (current) {
      current.content += line + '\n';
    }
  });
  if (current) sections.push(current);
  return sections.filter(s => s.content.trim().length > 20);
};

// ─── Component ───
const ResultView = ({ onReset, prompt, metadata }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('rendered');
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const outputRef = useRef(null);

  const sections = useMemo(() => extractSections(prompt || ''), [prompt]);
  const wordCount = useMemo(() => (prompt || '').split(/\s+/).filter(Boolean).length, [prompt]);
  const charCount = useMemo(() => (prompt || '').length, [prompt]);

  const toggleSection = (i) => {
    const next = new Set(expandedSections);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setExpandedSections(next);
  };

  const toggleAllSections = () => {
    if (expandedSections.size === sections.length) {
      setExpandedSections(new Set());
    } else {
      setExpandedSections(new Set(sections.map((_, i) => i)));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const appNameMatch = (prompt || '').match(/\*\*([^*]+)\*\*/);
    const appName = appNameMatch ? appNameMatch[1].trim().replace(/[\s\/\\?%*:|"<>]/g, '_') : 'VibeSync_Blueprint';
    const element = document.createElement('a');
    const file = new Blob([prompt || ''], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${appName}_Blueprint.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShareClipboard = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'VibeSync Blueprint', text: (prompt || '').slice(0, 500) + '...' });
      } else {
        handleCopy();
      }
    } catch {}
  };

  const renderedHTML = useMemo(() => renderMarkdown(prompt || ''), [prompt]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxWidth: '1060px', margin: '0 auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.6rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' }} className="animate-pulse-glow" />
              <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.12em' }}>⚡ Beast Mode Blueprint Generated</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', letterSpacing: '-0.04em' }}>
              Your <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Master Blueprint</span>
            </h1>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {metadata && (
                <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: '700', padding: '4px 8px', background: 'rgba(16,185,129,0.1)', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={14} /> {metadata.provider.toUpperCase()} • {metadata.model}
                </span>
              )}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📝 {wordCount.toLocaleString()} words</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📄 {sections.length} sections</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🔢 {charCount.toLocaleString()} chars</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={onReset} style={{ borderRadius: '10px' }}>
              <RefreshCw size={16} /> New Blueprint
            </button>
            <button className="btn-secondary" onClick={handleShareClipboard} style={{ borderRadius: '10px' }}>
              <Share2 size={16} /> Share
            </button>
            <button className="btn-primary" onClick={handleDownload} style={{ borderRadius: '10px' }}>
              <Download size={16} /> Export .md
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem', padding: '5px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', width: 'fit-content' }}>
          {[
            { id: 'rendered', icon: <BookOpen size={15} />, label: 'Rendered View' },
            { id: 'sections', icon: <Layers size={15} />, label: `Sections (${sections.length})` },
            { id: 'raw', icon: <Code2 size={15} />, label: 'Raw Markdown' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '0.55rem 1.1rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: activeTab === tab.id ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? '700' : '500',
                fontSize: '0.85rem', transition: 'all 0.2s ease'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Main Output Card */}
        <div style={{ background: 'var(--bg-card)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
          {/* Card Toolbar */}
          <div style={{ padding: '1rem 1.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />)}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                blueprint.md — VibeSync
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setIsFullscreen(true)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                title="Fullscreen"
              >
                <Maximize2 size={15} />
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                onClick={handleCopy}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '0.45rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.1)',
                  color: copied ? 'var(--accent)' : 'var(--primary)',
                  fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.2s'
                }}
              >
                {copied ? <><ClipboardCheck size={14} /> Copied!</> : <><Copy size={14} /> Copy All</>}
              </motion.button>
            </div>
          </div>

          {/* Content Area */}
          <AnimatePresence mode="wait">
            {activeTab === 'rendered' && (
              <motion.div
                key="rendered"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                ref={outputRef}
                style={{ padding: '2.5rem 3rem', maxHeight: '70vh', overflowY: 'auto' }}
              >
                <div
                  className="prose-output"
                  dangerouslySetInnerHTML={{ __html: renderedHTML }}
                />
              </motion.div>
            )}

            {activeTab === 'sections' && (
              <motion.div
                key="sections"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                {/* Sections Header with Toggle All */}
                {sections.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Blueprint Components</span>
                    <button 
                      onClick={toggleAllSections}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                      {expandedSections.size === sections.length ? 'Collapse All' : 'Expand All'}
                    </button>
                  </div>
                )}
                {sections.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No sections detected in the output.</div>
                ) : sections.map((sec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-card)' }}
                  >
                    <button
                      onClick={() => toggleSection(i)}
                      style={{ width: '100%', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary)' }}>{i+1}</span>
                        <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{sec.title}</span>
                      </div>
                      {expandedSections.has(i) ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                    </button>
                    <AnimatePresence>
                      {expandedSections.has(i) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div
                            className="prose-output"
                            style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(sec.content) }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'raw' && (
              <motion.div
                key="raw"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto' }}
              >
                <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                  {prompt}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card Footer */}
          <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={14} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Powered by Beast Mode Engine — vibeprompt + vibecoding integration</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              <span>Paste into: <strong style={{ color: 'var(--text-secondary)' }}>Cursor</strong> · <strong style={{ color: 'var(--text-secondary)' }}>Bolt.new</strong> · <strong style={{ color: 'var(--text-secondary)' }}>v0</strong> · <strong style={{ color: 'var(--text-secondary)' }}>Windsurf</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.25rem', marginTop: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.9rem' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', color: 'var(--primary)' }}><Zap size={18}/></div>
              <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>How to Use This</h4>
            </div>
            <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.75 }}>
              <li>Click <strong style={{color:'var(--text-primary)'}}>Copy All</strong> above</li>
              <li>Open <strong style={{color:'var(--text-primary)'}}>Cursor / Bolt / v0</strong></li>
              <li>Paste into the composer</li>
              <li>Follow the Phase 1 Checklist</li>
            </ol>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '3px solid var(--accent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.9rem' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: 'var(--accent)' }}><Check size={18}/></div>
              <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}>Pro Tips</h4>
            </div>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.75 }}>
              <li>Ask AI to explain folder structure first</li>
              <li>Build section by section, not all at once</li>
              <li>Reference the DB Schema in every feature prompt</li>
              <li>Use the API Specs for integration tests</li>
            </ul>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.9rem' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(139,92,246,0.1)', color: 'var(--secondary)' }}><FileText size={18}/></div>
              <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>Blueprint Saved</h4>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              This blueprint is saved in your session history. Access it any time from the <strong style={{color:'var(--text-primary)'}}>History</strong> panel in the sidebar — or export it as a Markdown file for your repo.
            </p>
            <button className="btn-secondary" onClick={handleDownload} style={{ marginTop: '1rem', padding: '0.55rem 1rem', fontSize: '0.8rem' }}>
              <Download size={14} /> Download .md
            </button>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
              <span style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>📄 Full Blueprint — Fullscreen Mode</span>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-primary" onClick={handleCopy} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  {copied ? <><ClipboardCheck size={14}/> Copied!</> : <><Copy size={14}/> Copy</>}
                </button>
                <button onClick={() => setIsFullscreen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                  <X size={22} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '3rem 4rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
              <div className="prose-output" dangerouslySetInnerHTML={{ __html: renderedHTML }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


export default ResultView;
