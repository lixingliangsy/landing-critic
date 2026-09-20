import { z } from 'zod'

export const HeuristicScoreOutput = z.object({
  score: z.number().min(0).max(5),
  breakdown: z.array(z.object({
    category: z.enum(['value_prop', 'cta', 'target_user', 'social_proof', 'pricing']),
    score: z.number().min(0).max(5),
    passed: z.boolean(),
    comment: z.string(),
  })),
})

export const FixListOutput = z.object({
  priority_fix: z.string(),
  fixes: z.array(z.object({
    type: z.enum(['add', 'rewrite', 'remove', 'reorder']),
    location: z.string(),
    original: z.string().optional(),
    suggested: z.string(),
    impact: z.enum(['high', 'medium', 'low']),
  })),
  copy_ready_text: z.string(),
})


export interface FaqItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
}

export function buildFaqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((it) => ({
      "@type": "Question",
      "name": it.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": it.answer,
      },
    })),
  };
}

export function buildHowToJsonLd(name: string, steps: HowToStep[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "step": steps.map((s, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": s.name,
      "text": s.text,
    })),
  };
}