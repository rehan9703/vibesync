import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, Zap, Shield, Cpu, GitBranch,
  Database, Layers, Bot, Globe, Star, Check
} from 'lucide-react';

const PROVIDERS = [
  'OpenAI', 'Anthropic', 'Gemini', 'DeepSeek', 'Groq',
  'Mistral', 'Cohere', 'x.AI', 'Perplexity', 'OpenRouter'
];

const FEATURES = [
  {
    icon: <Zap size={22} />,
    color: 'var(--primary)',
    glow: 'var(--primary-glow)',
    title: 'Beast Mode Engine',
    desc: 'Automatically matches your project details to elite engineering patterns from vibeprompt & vibecoding repos. Injects architecture, DB schemas, and security directives.'
  },
  {
    icon: <Database size={22} />,
    color: 'var(--accent)',
    glow: 'var(--accent-glow)',
    title: 'Full-Stack Blueprints',
    desc: 'Generates 12-section master blueprints covering backend, database schemas (SQL/NoSQL), API specs, deployment guides, and Phase 1 implementation checklists.'
  },
  {
    icon: <Cpu size={22} />,
    color: 'var(--secondary)',
    glow: 'var(--secondary-glow)',
    title: '12+ AI Providers',
    desc: 'Works with OpenAI, Anthropic, Gemini, DeepSeek, Groq, Mistral, Cohere, X.AI, Perplexity, Together AI, Fireworks, and OpenRouter — 500+ models total.'
  },
  {
    icon: <GitBranch size={22} />,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.3)',
    title: 'Vibe Aesthetics',
    desc: 'Choose from Cyberpunk, Vaporwave, Lo-Fi, Brutalism, or Glassmorphism — and your blueprint will include matching CSS directives and UX patterns.'
  },
  {
    icon: <Shield size={22} />,
    color: '#34d399',
    glow: 'rgba(52,211,153,0.3)',
    title: 'Private & Secure',
    desc: 'API keys are stored locally in your browser only. Nothing is sent to our servers. You have full control of your data and keys at all times.'
  },
  {
    icon: <Layers size={22} />,
    color: '#f87171',
    glow: 'rgba(248,113,113,0.3)',
    title: 'Smart Vibe Styles',
    desc: 'Technical, Formal, Academic, Creative, Minimalist — your blueprint\'s writing style and target audience are fully configurable for your reader.'
  }
];

const STATS = [
  { value: '12+', label: 'AI Providers' },
  { value: '500+', label: 'Models' },
  { value: '12', label: 'Blueprint Sections' },
  { value: '5', label: 'Vibe Aesthetics' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
};

const LandingPage = ({ onStart }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 2rem 6rem' }}>

      {/* Hero */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ textAlign: 'center', maxWidth: '780px', paddingTop: '10vh' }}
      >
        {/* Badge */}
        <motion.div variants={itemVariants} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', borderRadius: '100px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2rem' }}>
          <Sparkles size={13} />
          Beast Mode Prompt Engineering
          <span style={{ background: 'var(--primary)', color: 'white', padding: '1px 7px', borderRadius: '100px', fontSize: '0.65rem' }}>NEW</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={itemVariants} style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)', lineHeight: 1.05, marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>
          Turn App Ideas Into{' '}
          <span style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Master Blueprints
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p variants={itemVariants} style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          Intelligent Prompt Generator.<br/>
          For AI-Powered Creations.
        </motion.p>

        {/* CTA */}
        <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(59,130,246,0.5)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="btn-primary"
            style={{ padding: '1.1rem 2.4rem', fontSize: '1.05rem', borderRadius: '14px' }}
          >
            <Zap size={20} />
            Start Forging
            <ArrowRight size={18} />
          </motion.button>
          <motion.a
            whileHover={{ scale: 1.02 }}
            href="https://github.com/cpjet64/vibecoding"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ padding: '1.1rem 2rem', fontSize: '1rem', borderRadius: '14px', textDecoration: 'none' }}
          >
            <Star size={18} />
            View Source Repos
          </motion.a>
        </motion.div>

        {/* Providers */}
        <motion.div variants={itemVariants} style={{ marginTop: '3.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', opacity: 0.55 }}>
          {PROVIDERS.map(p => (
            <span key={p} style={{ fontSize: '0.8rem', fontWeight: '600', padding: '4px 12px', borderRadius: '100px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{p}</span>
          ))}
        </motion.div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="responsive-grid-4"
        style={{ gap: '1px', margin: '6rem auto 0', width: '100%', maxWidth: '750px', background: 'var(--border)', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border)' }}
      >
        {STATS.map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', padding: '1.5rem', textAlign: 'center', backdropFilter: 'blur(16px)' }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-heading)', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Feature Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginTop: '6rem', width: '100%', maxWidth: '1080px' }}
      >
        {FEATURES.map((f, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            className="glass-card"
            style={{ padding: '1.75rem', cursor: 'default', position: 'relative', overflow: 'hidden' }}
          >
            {/* Glow blob */}
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: f.glow, filter: 'blur(30px)', opacity: 0.3, pointerEvents: 'none' }} />
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: `${f.glow}`, border: `1px solid ${f.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.1rem', color: f.color }}>
              {f.icon}
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.6rem', color: 'var(--text-primary)' }}>{f.title}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom CTA bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ marginTop: '6rem', padding: '2.5rem 3rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(59,130,246,0.2)', textAlign: 'center', maxWidth: '700px', width: '100%' }}
      >
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>Ready to build something epic?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Your next full-stack app blueprint is 5 steps away. No setup, no sign-up — just your idea.</p>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="btn-primary"
          style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}
        >
          <Bot size={20} /> Generate My Blueprint
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LandingPage;
