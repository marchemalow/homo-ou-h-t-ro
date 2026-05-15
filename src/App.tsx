/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, ThumbsUp, ThumbsDown, Share2, Check, Moon, Sun, Languages } from 'lucide-react';
import { translations, Lang } from './translations';

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5544459372919000"
     crossorigin="anonymous"></script>

interface Result {
  verdict: 'Hétérosexuelle' | 'Homosexuelle' | 'Aucun des deux';
  explication: string;
}

export default function App() {
  const [lang, setLang] = useState<Lang>('fr');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ query: string; data: Result } | null>(null);
  const [vote, setVote] = useState<'agree' | 'disagree' | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isLgbtBg, setIsLgbtBg] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    // 0.1% chance of LGBT background
    if (Math.random() < 0.001) {
      setIsLgbtBg(true);
    }
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setResult(null);
    setVote(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), lang }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error((errData && errData.error) ? errData.error : 'Query failed');
      }
      
      const data: Result = await response.json();
      setResult({ query: query.trim(), data });
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Erreur";
      alert(errorMessage || (lang === 'fr' ? "Erreur lors de l'analyse." : "Error during analysis."));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!result) return;
    const text = `« ${result.query} » → ${t.verdicts[result.data.verdict]} ${lang === 'fr' ? 'selon l\'IA !' : 'according to AI!'} 🌈`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`min-h-[100dvh] bg-bg text-text font-sans flex flex-col items-center justify-center p-4 sm:p-8 pt-20 transition-colors duration-300 relative overflow-hidden ${isLgbtBg ? 'rainbow-gradient' : ''}`}>
      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-50">
        <div className="flex bg-surface border border-border rounded-xl p-1 shadow-sm overflow-hidden scale-90 sm:scale-100">
          {(['fr', 'en', 'es'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                lang === l ? 'bg-text text-bg' : 'text-muted hover:bg-border/50'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-xl bg-surface border border-border text-text hover:bg-border/50 transition-all shadow-sm"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {isLgbtBg && (
        <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-[2px] pointer-events-none" />
      )}

      {/* Header section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl text-center mb-6 sm:mb-8 relative z-10 mt-auto sm:mt-0"
      >
        <div className="w-40 h-1.5 rainbow-gradient rounded-full mx-auto mb-6" />
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-2">
          {t.title}
        </h1>
        <p className="text-muted text-lg">
          {t.subtitle}
        </p>
      </motion.div>

      {/* Input section */}
      <div className="w-full max-w-2xl mb-8 relative z-10">
        <div className="relative group">
          <input
            type="text"
            id="query-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder={t.placeholder}
            className="w-full h-14 pl-12 pr-24 rounded-2xl bg-surface border border-border transition-all focus:outline-none focus:border-text focus:ring-4 focus:ring-text/5 text-lg text-text"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <button
            onClick={handleAnalyze}
            disabled={loading || !query.trim()}
            className="absolute right-2 top-2 h-10 px-6 rounded-xl bg-text text-bg font-display font-bold text-sm tracking-wide hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.go}
          </button>
        </div>
      </div>

      {/* Result Section */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-muted font-medium animate-pulse relative z-10"
          >
            {t.loading}
          </motion.div>
        )}

        {result && !loading && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-2xl bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm relative z-10"
          >
            <p className="text-muted italic mb-2 break-words">« {result.query} »</p>
            <h2 className={`font-display text-3xl sm:text-4xl font-bold mb-4 break-words ${
              result.data.verdict === 'Homosexuelle' 
                ? 'text-homo' 
                : result.data.verdict === 'Hétérosexuelle' 
                  ? 'text-hetero' 
                  : 'text-muted'
            }`}>
              {t.verdicts[result.data.verdict]}
            </h2>
            <div className="h-px bg-border w-full mb-6" />
            <p className="text-muted leading-relaxed text-base sm:text-lg mb-6 sm:mb-8">
              {result.data.explication}
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setVote('agree')}
                  className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border transition-all text-xs sm:text-sm font-medium ${
                    vote === 'agree' 
                      ? 'bg-text text-bg border-text' 
                      : 'bg-bg text-muted border-border hover:border-text/30'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  {t.agree}
                </button>
                <button
                  onClick={() => setVote('disagree')}
                  className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border transition-all text-xs sm:text-sm font-medium ${
                    vote === 'disagree' 
                      ? 'bg-text text-bg border-text' 
                      : 'bg-bg text-muted border-border hover:border-text/30'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  {t.disagree}
                </button>
              </div>
              <button
                onClick={handleShare}
                className="w-full sm:w-auto sm:ml-auto flex justify-center items-center gap-2 px-4 py-2 rounded-xl border border-border bg-bg hover:bg-surface transition-all text-sm font-medium text-muted"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    {t.copied}
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    {t.share}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-auto pt-12 text-[#aaa] text-xs text-center max-w-md leading-relaxed relative z-10">
        {t.disclaimer}
      </p>
    </div>
  );
}

