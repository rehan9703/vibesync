import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap, History, Settings, Terminal, PlusCircle,
  BookOpen, Globe, ChevronRight, X, Sun, Moon
} from 'lucide-react';

const NAV_ITEMS = [
  {
    group: 'Create',
    items: [
      { id: 'wizard', icon: <Zap size={18} />, label: 'New Blueprint', desc: 'Generate a project' },
    ]
  },
  {
    group: 'Manage',
    items: [
      { id: 'history_trigger', icon: <History size={18} />, label: 'History', desc: 'Past blueprints' },
      { id: 'setup', icon: <Settings size={18} />, label: 'API Keys', desc: 'Manage providers' },
    ]
  }
];

const Sidebar = ({ currentView, setView, onHistoryClick, isOpen, setIsOpen, theme, setTheme }) => {
  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ 
        x: isOpen ? 0 : -280, 
        opacity: isOpen ? 1 : 0,
        display: isOpen ? 'flex' : 'none'
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      style={{
        width: '260px',
        minHeight: '100vh',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--border)',
        flexDirection: 'column',
        padding: '0',
        zIndex: 100,
        flexShrink: 0,
      }}
      className="sidebar-responsive"
    >
      {/* Logo */}
      <div style={{ padding: '1.75rem 1.5rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px var(--primary-glow)',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            <img src="/logo.png" alt="VibeSync Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: '700', fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>VibeSync</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Intelligent Prompt Generator</div>
          </div>
        </div>
        <button 
          className="mobile-close-btn"
          onClick={() => setIsOpen(false)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {NAV_ITEMS.map(group => (
          <div key={group.group}>
            <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
              {group.group}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {group.items.map(item => (
                <SidebarItem
                  key={item.id}
                  active={currentView === item.id}
                  icon={item.icon}
                  label={item.label}
                  desc={item.desc}
                  onClick={() => {
                    if (item.id === 'history_trigger') onHistoryClick();
                    else setView(item.id);
                    if (window.innerWidth <= 800) setIsOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '1.25rem 1rem', borderTop: '1px solid var(--border)' }}>
        {/* Beast Mode Badge */}
        <div style={{ padding: '0.9rem 1rem', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))', border: '1px solid rgba(59,130,246,0.15)', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem' }}>⚡</span>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>Beast Mode Active</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            16 providers · Local AI ready<br />
            vibeprompt + vibecoding integrated
          </div>
        </div>

        <a
          href="https://github.com/cpjet64/vibecoding"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 0.75rem', borderRadius: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem', transition: 'all 0.2s', border: '1px solid transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <Globe size={14} /> View Source Repos
        </a>

        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 0.75rem', marginTop: '0.5rem', borderRadius: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem', transition: 'all 0.2s', border: '1px solid transparent', background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />} 
          {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        </button>
      </div>
    </motion.aside>
  );
};

const SidebarItem = ({ active, icon, label, desc, onClick }) => (
  <motion.button
    whileHover={{ x: 3 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '11px',
      width: '100%', padding: '0.7rem 0.75rem',
      borderRadius: '10px', border: 'none', cursor: 'pointer',
      background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
      outline: active ? '1px solid rgba(59,130,246,0.25)' : '1px solid transparent',
      color: active ? 'var(--primary)' : 'var(--text-secondary)',
      textAlign: 'left', transition: 'all 0.15s ease',
    }}
  >
    <div style={{
      width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: active ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)',
      color: active ? 'var(--primary)' : 'var(--text-muted)',
      transition: 'all 0.15s'
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.875rem', fontWeight: active ? '700' : '500', lineHeight: 1.2 }}>{label}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>{desc}</div>
    </div>
    {active && <ChevronRight size={14} style={{ color: 'var(--primary)', opacity: 0.7 }} />}
  </motion.button>
);

export default Sidebar;
