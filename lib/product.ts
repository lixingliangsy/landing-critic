export interface InputField {
  key: string
  label: string
  type: 'input' | 'textarea' | 'select'
  placeholder?: string
  options?: string[]
}

export const PRODUCT = {
  name: "LandingCritic",
  slug: "landing-critic",
  tagline: "A blunt checklist for your landing page",
  description: "Paste your landing page copy; get a 5-point critique covering value prop, CTA, target user, proof, and pricing. For indie founders shipping without a copywriter.",
  toolTitle: "Critique my page",
  resultLabel: "Your critique",
  ctaLabel: "Critique",
  features: [
  "5-point checklist",
  "Score out of 5",
  "Priority fix",
  "Copy-ready"
],
  inputs: [
  {
    "key": "text",
    "label": "Landing page copy",
    "type": "textarea",
    "placeholder": "We help devs ship faster. Try it free. Built for small teams. Loved by 200 users. $9/mo."
  }
] as InputField[],
  systemPrompt: "You are a conversion copywriter. Given landing page copy, score it on value prop clarity, CTA, target-user mention, social proof, and pricing visibility; give a priority fix.",
  pricing: [
  {
    "tier": "Free",
    "price": "$0",
    "desc": "Unlimited"
  },
  {
    "tier": "Pro",
    "price": "$9/mo",
    "desc": "Save, history"
  },
  {
    "tier": "Team",
    "price": "$29/mo",
    "desc": "Batch, API"
  }
],
  mock: (inputs: Record<string, string>): string => {
  const text = (inputs['text'] || '').trim()
  if (!text) return 'Paste your landing page copy to critique.'
  const checks = [
    ['Clear value prop in first 2 lines', /(help|save|build|create|get|turn|ship)/i.test(text)],
    ['Has a CTA verb', /(get started|try|sign up|buy|start|join|free)/i.test(text)],
    ['Mentions target user', /(for|designed for|built for)\s+[a-z]/i.test(text)],
    ['Social proof present', /(users|customers|teams|stars|reviews|loved)/i.test(text)],
    ['Pricing visible', /(\$|price|plan|free|\/mo)/i.test(text)]
  ]
  let score = 0
  let out = 'LANDING CRITIQUE\n\n'
  checks.forEach(c => { out += (c[1] ? '[OK] ' : '[FIX] ') + c[0] + '\n'; if (c[1]) score++ })
  out += '\nScore: ' + score + '/' + checks.length + '\n'
  out += score < 4 ? 'Priority fix: add a clear CTA + target-user line + pricing.' : 'Solid. Tighten any [FIX] items.'
  return out + '\n\n--- (Mock checklist. Add OPENAI_API_KEY for deep copy critique.)'
}
}
