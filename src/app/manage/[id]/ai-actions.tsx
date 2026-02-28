"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

interface ActivityPlanResult {
  dailyTheme: string;
  commentTone: string;
  activityModes: string[];
}

interface DraftResult {
  draftPostId: string | null;
  caption: string;
  mediaMode: string;
}

interface AiActionsProps {
  characterId: string;
}

/**
 * Runs LLM APIs from the manage page to validate activity/post generation.
 */
export function ManageAiActions({ characterId }: AiActionsProps) {
  const [isPlanning, setIsPlanning] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [planResult, setPlanResult] = useState<ActivityPlanResult | null>(null);
  const [draftResult, setDraftResult] = useState<DraftResult | null>(null);

  const handleGeneratePlan = async () => {
    setIsPlanning(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ai/activity-manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId,
          applyChanges: true,
          syncBatchQueue: true,
        }),
      });

      const body = (await response.json()) as {
        plan?: {
          dailyTheme: string;
          commentTone: string;
          activityModes: string[];
        };
        error?: { message?: string };
      };

      if (!response.ok || !body.plan) {
        setErrorMessage(
          body.error?.message ?? "Failed to generate activity plan.",
        );
        return;
      }

      setPlanResult({
        dailyTheme: body.plan.dailyTheme,
        commentTone: body.plan.commentTone,
        activityModes: body.plan.activityModes,
      });
    } catch {
      setErrorMessage("Network error while generating activity plan.");
    } finally {
      setIsPlanning(false);
    }
  };

  const handleGenerateDraft = async () => {
    setIsDrafting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ai/post-content-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId,
          mediaMode: "auto",
          persistDraft: true,
        }),
      });

      const body = (await response.json()) as {
        draftPostId?: string | null;
        mediaMode?: string;
        content?: { caption?: string };
        error?: { message?: string };
      };

      if (!response.ok || !body.content?.caption) {
        setErrorMessage(
          body.error?.message ?? "Failed to generate draft content.",
        );
        return;
      }

      setDraftResult({
        draftPostId: body.draftPostId ?? null,
        caption: body.content.caption,
        mediaMode: body.mediaMode ?? "auto",
      });
    } catch {
      setErrorMessage("Network error while generating draft content.");
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <section className="bg-aura-surfaceVariant border border-aura-outline rounded-2xl p-4 flex flex-col gap-3">
      <h3 className="font-bold text-lg text-white flex items-center gap-2">
        <Sparkles size={18} className="text-aura-primary" />
        LLM Actions
      </h3>
      <p className="text-xs text-zinc-400 leading-relaxed">
        Trigger real generation APIs and verify outputs are saved/applied.
      </p>

      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={handleGeneratePlan}
          disabled={isPlanning || isDrafting}
          className="h-11 rounded-xl font-bold bg-aura-primary text-black disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPlanning ? <Loader2 size={16} className="animate-spin" /> : null}
          Generate Today Plan
        </button>

        <button
          onClick={handleGenerateDraft}
          disabled={isPlanning || isDrafting}
          className="h-11 rounded-xl font-bold bg-aura-secondary text-black disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isDrafting ? <Loader2 size={16} className="animate-spin" /> : null}
          Generate Draft Post
        </button>
      </div>

      {errorMessage ? <p className="text-xs text-red-400">{errorMessage}</p> : null}

      {planResult ? (
        <div className="rounded-xl border border-aura-primary/40 bg-aura-primary/10 p-3 text-xs">
          <p className="text-aura-primary font-bold mb-1">Plan Applied</p>
          <p className="text-zinc-200">{planResult.dailyTheme}</p>
          <p className="text-zinc-400 mt-1">
            Tone: {planResult.commentTone} / Modes:{" "}
            {planResult.activityModes.join(", ")}
          </p>
        </div>
      ) : null}

      {draftResult ? (
        <div className="rounded-xl border border-aura-secondary/40 bg-aura-secondary/10 p-3 text-xs">
          <p className="text-aura-secondary font-bold mb-1">
            Draft Generated {draftResult.draftPostId ? `(ID: ${draftResult.draftPostId})` : ""}
          </p>
          <p className="text-zinc-200">{draftResult.caption}</p>
          <p className="text-zinc-400 mt-1">Media mode: {draftResult.mediaMode}</p>
        </div>
      ) : null}
    </section>
  );
}

