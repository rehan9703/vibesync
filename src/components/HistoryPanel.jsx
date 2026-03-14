import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ExternalLink, Clock, History as HistoryIcon, FileText, Zap } from 'lucide-react';

const HistoryPanel = ({ isOpen, onClose, history, onLoad, onDelete }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 1000
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '100%', maxWidth: '420px',
              background: 'var(--bg-main)',
              backdropFilter: 'blur(20px)',
              borderLeft: '1px solid var(--border)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
              zIndex: 1001,
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{ padding: '1.75rem 1.5rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <HistoryIcon size={18} style={{ color: 'var(--primary)' }} />
                  <h2 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>Blueprint History</h2>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {history.length} / 20 saved locally
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-muted)' }}
                >
                  <Clock size={48} style={{ opacity: 0.15, marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
                  <p style={{ fontWeight: '500', marginBottom: '6px' }}>No blueprints yet</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your generated blueprints will appear here.</p>
                </motion.div>
              ) : (
                history.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.03 }}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '14px', padding: '1.1rem',
                      display: 'flex', flexDirection: 'column', gap: '0.75rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '4px', lineHeight: 1.3 }}>{item.appName}</h3>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={10} /> {item.date}{item.time ? ` · ${item.time}` : ''}
                          </span>
                          {item.wordCount && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <FileText size={10} /> {item.wordCount.toLocaleString()} words
                            </span>
                          )}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, color: '#ef4444' }} whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(item.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', flexShrink: 0 }}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </motion.button>
                    </div>

                    {/* Preview snippet */}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '0.6rem 0.75rem', borderRadius: '8px', overflow: 'hidden', maxHeight: '52px' }}>
                      {(item.prompt || '').replace(/[#*`]/g, '').slice(0, 120)}…
                    </div>

                    <button
                      onClick={() => onLoad(item)}
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', padding: '0.55rem', fontSize: '0.82rem', borderRadius: '8px' }}
                    >
                      <Zap size={14} /> Load Blueprint <ExternalLink size={12} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Stored in localStorage · Private</span>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Clear all history?')) {
                      history.forEach(item => onDelete(item.id));
                    }
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={12} /> Clear All
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HistoryPanel;
