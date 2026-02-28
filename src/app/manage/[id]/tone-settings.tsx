"use client";

import { useState } from "react";
import { Edit, Save } from "lucide-react";

/**
 * Client-side tone settings component for the Manage Idol page
 * Handles interactive tone selection with edit/save toggle
 */
export function ManageToneSettings({ initialTone }: { initialTone: string }) {
  const [tone, setTone] = useState(initialTone);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-aura-surfaceVariant border border-aura-outline rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-white">Content Tone</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-aura-secondary hover:text-white transition-colors"
        >
          {isEditing ? <Save size={18} /> : <Edit size={18} />}
        </button>
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed mb-2">
        Adjust the LLM generation persona for captions and auto-replies.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {["friendly", "provocative", "chic", "playful"].map((t) => (
          <button
            key={t}
            disabled={!isEditing}
            onClick={() => setTone(t)}
            className={`py-3 rounded-xl border font-medium transition-colors text-sm capitalize ${tone === t ? "bg-aura-secondary/20 border-aura-secondary text-aura-secondary" : "bg-aura-surface border-aura-outline text-zinc-500"} ${!isEditing && "opacity-60 cursor-not-allowed hidden"}`}
            style={!isEditing && tone !== t ? { display: "none" } : {}}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
