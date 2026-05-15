import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { Radar, Sparkles, Search, User, Heart, Zap } from 'lucide-react';

export default function App() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ name: string; orientation: string; explication: string } | null>(null);
  const [error, setError] = useState('');

  const generateHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const normalizedName = name.trim().toLowerCase();
      const seedHash = generateHash(normalizedName);
      
      const orientation = seedHash % 2 === 0 ? 'Homo' : 'Hétéro';

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Le prénom ou pseudo est "${name.trim()}". L'orientation a été déterminée comme "${orientation}". 
        Écris SEULEMENT une très courte phrase (environ 10 mots) justifiant cette orientation avec un critère ou préjugé totalement absurde et inventé (ex: "Les gens qui dorment en chaussettes sont ${orientation}." ou "Il boit l'eau de cuisson des pâtes, c'est typique."). 
        Sois farfelu et très direct ! Ne justifie pas par de vrais faits, invente à fond.`,
        config: {
          seed: seedHash,
          temperature: 0.9,
        },
      });

      setResult({
        name: name.trim(),
        orientation,
        explication: response.text || 'La science est sans voix.',
      });
    } catch (err: any) {
      console.error(err);
      setError("Le radar a court-circuité ! Réessaie plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden relative font-sans">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-blue-600/20 blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Radar className="text-white w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400 mb-2">
            Hétéro ou homo ?
          </h1>
          <p className="text-slate-300 text-sm">
            La science infuse n'a jamais été aussi précise.
          </p>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="text-slate-400 w-5 h-5" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Exemple: Jean, Marie..."
              className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 p-[1px] text-white font-bold"
          >
            <span className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-300 ease-out"></span>
            <div className="relative bg-slate-900/40 px-4 py-3 rounded-xl flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Radar className="w-5 h-5" />
                  </motion.div>
                  <span>Analyse des ondes...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Scanner ce pseudo</span>
                </>
              )}
            </div>
          </motion.button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {result && !loading && (
            <motion.div
              key={result.name}
              initial={{ opacity: 0, height: 0, scale: 0.9 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.9 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="mt-8 pt-6 border-t border-white/10"
            >
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">Résultat pour <span className="text-slate-200 font-bold">{result.name}</span></p>
                <div className="flex items-center justify-center gap-3 mb-4">
                  {result.orientation === 'Homo' ? (
                    <Sparkles className="text-pink-400 w-6 h-6" />
                  ) : (
                    <Zap className="text-blue-400 w-6 h-6" />
                  )}
                  <h2 className={
                    "text-4xl font-black uppercase tracking-wider " + 
                    (result.orientation === 'Homo' 
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400" 
                      : "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500")
                  }>
                    {result.orientation}
                  </h2>
                  {result.orientation === 'Homo' ? (
                    <Heart className="text-pink-400 w-6 h-6" />
                  ) : (
                    <Zap className="text-blue-400 w-6 h-6" />
                  )}
                </div>
                <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 text-slate-300 text-sm italic leading-relaxed shadow-inner">
                  "{result.explication}"
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <div className="mt-8 text-slate-500 text-xs italic text-center">
        *Ceci est une application parodique 100% scientifique (non).
      </div>
    </div>
  );
}
