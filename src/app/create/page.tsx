'use client';

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Wand2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateCharacterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: 'female',
    concept: 'cute',
    position: 'main_vocal',
    persona: 'perfect',
    name: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else handleCreate();
  };

  const handleCreate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      router.push('/character/char_1'); // Redirect to a mock profile
    }, 2000);
  };

  return (
    <main className="flex flex-col w-full min-h-[calc(100vh-64px)] bg-aura-surface pb-8">
      {/* Header */}
      <div className="p-4 pt-4 sticky top-0 z-10 bg-aura-surface/80 backdrop-blur-md flex items-center justify-between border-b border-aura-outline">
        <div className="flex items-center gap-2">
          {step === 1 ? (
            <Link href="/">
              <div className="w-10 h-10 flex items-center justify-center rounded-full text-white cursor-pointer hover:bg-white/10 transition-colors">
                <ChevronLeft size={24} />
              </div>
            </Link>
          ) : (
            <button onClick={() => setStep(step - 1)} className="w-10 h-10 flex items-center justify-center rounded-full text-white cursor-pointer hover:bg-white/10 transition-colors">
              <ChevronLeft size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold text-white flex gap-2 items-center">
            Create AI Idol
          </h1>
        </div>
        <div className="text-sm font-bold text-aura-primary">
          Step {step}/4
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6">
            <h2 className="text-2xl font-black text-white">1. Style & Concept</h2>
            
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-zinc-400">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {['female', 'male', 'nonbinary'].map(g => (
                  <button key={g} onClick={() => setFormData({...formData, gender: g})}
                    className={`py-3 rounded-xl border ${formData.gender === g ? 'bg-aura-primary/20 border-aura-primary text-aura-primary' : 'bg-aura-surfaceVariant border-aura-outline text-zinc-300'}`}>
                    {g.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-zinc-400">Core Concept</label>
              <div className="grid grid-cols-2 gap-2">
                {['cute', 'sexy', 'boyish', 'innocent'].map(c => (
                  <button key={c} onClick={() => setFormData({...formData, concept: c})}
                    className={`py-3 rounded-xl border ${formData.concept === c ? 'bg-aura-primary/20 border-aura-primary text-aura-primary' : 'bg-aura-surfaceVariant border-aura-outline text-zinc-300'}`}>
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6">
            <h2 className="text-2xl font-black text-white">2. Idol Identity</h2>
            
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-zinc-400">Main Position</label>
              <div className="grid grid-cols-2 gap-2">
                {['main_vocal', 'main_dancer', 'rapper', 'visual'].map(p => (
                  <button key={p} onClick={() => setFormData({...formData, position: p})}
                    className={`py-3 rounded-xl border ${formData.position === p ? 'bg-aura-secondary/20 border-aura-secondary text-aura-secondary' : 'bg-aura-surfaceVariant border-aura-outline text-zinc-300'}`}>
                    {p.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-zinc-400">Public Persona</label>
              <div className="grid grid-cols-2 gap-2">
                {['casual', 'perfect', 'quirky', 'artist'].map(p => (
                  <button key={p} onClick={() => setFormData({...formData, persona: p})}
                    className={`py-3 rounded-xl border ${formData.persona === p ? 'bg-aura-secondary/20 border-aura-secondary text-aura-secondary' : 'bg-aura-surfaceVariant border-aura-outline text-zinc-300'}`}>
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6">
            <h2 className="text-2xl font-black text-white">3. Activity Modes</h2>
            <p className="text-xs text-zinc-400">What kind of content will your idol generate?</p>
            
            <div className="flex flex-col gap-3">
              {['Performance & Stage', 'Daily & Vlog', 'Meme & Trend', 'Photoshoot & Ads'].map(mode => (
                <button key={mode} className="flex items-center justify-between p-4 rounded-xl border bg-aura-primary/10 border-aura-primary text-white">
                  <span className="font-bold">{mode}</span>
                  <Check size={20} className="text-aura-primary" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6">
            <div className="flex justify-center mb-4 mt-6">
               <div className="w-24 h-24 bg-aura-surfaceVariant rounded-full border-[2px] border-dashed border-aura-primary/50 flex items-center justify-center shadow-[0_0_15px_rgba(255,47,146,0.5)]">
                 <Wand2 size={40} className="text-aura-primary animate-pulse" />
               </div>
            </div>
            
            <h2 className="text-2xl font-black text-center text-white mb-2">Finalize Idol</h2>
            
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-zinc-400">Stage Name</label>
              <input 
                type="text" 
                placeholder="Enter a name e.g. 'Aura'" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full h-14 bg-aura-surfaceVariant border border-aura-outline rounded-xl px-4 text-white focus:border-aura-primary outline-none transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 mt-auto">
        <button 
          onClick={handleNext}
          disabled={isGenerating || (step === 4 && !formData.name)}
          className="w-full bg-aura-primary text-black font-bold h-14 rounded-full flex items-center justify-center gap-2 hover:bg-aura-secondary transition-colors disabled:opacity-50 disabled:bg-zinc-700 disabled:text-zinc-500"
        >
          {isGenerating ? (
             <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : step === 4 ? (
             <span className="flex items-center gap-2 shadow-lg">Bring to Life <Wand2 size={18} /></span>
          ) : (
             <span className="flex items-center gap-2">Next Step <ChevronRight size={18} /></span>
          )}
        </button>
      </div>
    </main>
  );
}

