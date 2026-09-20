export interface InputField {
  key: string
  label: string
  type: 'input' | 'text' | 'textarea' | 'select'
  placeholder?: string
  options?: string[]
}

export const PRODUCT = {
  name: "LandingCritic",
  slug: "landing-critic",
  productId: "PROD_17ywIY6KB4aYApXqgQsQNZ",
  priceMonthly: 19,
  yearlyProductId: "PROD_26vdkh6iZvaIeqmJb5Hqn6",
  priceYearly: 190,

  checkoutUrl: "https://pancake.waffo.ai/store/lixingliang-ai-tools-6cilbw8v/checkout/cs_1d4729c9-8767-1c42-a2b5-e2d8d4d4d443",
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
  definitionLead: "LandingCritic gives your landing page a blunt 5-point critique — value prop, CTA, target user, proof, and pricing — with a score and the one fix to do first.",
  geoFaq: [
    { q: "What is LandingCritic?", a: "LandingCritic is a tool that gives your landing page a 5-point critique with a score and the top fix to make." },
    { q: "What five points does it check?", a: "Value prop, CTA, target user, proof, and pricing." },
    { q: "Does it give a score?", a: "Yes. It scores the page out of 5 across the checklist." },
    { q: "What is the priority fix?", a: "It names the single highest-priority fix to do first." },
    { q: "Who should use it?", a: "Indie founders shipping without a copywriter who want an honest page critique." },
    { q: "Is the output copy-ready?", a: "The critique is copy-ready guidance you apply to your own page." },
  ],
  systemPrompt: "You are a conversion copywriter. Given landing page copy, score it on value prop clarity, CTA, target-user mention, social proof, and pricing visibility; give a priority fix.",
  pricing: [
    {
      "tier": "Free",
      "price": "$0",
      "desc": "3 workflow runs / day · watermarked export"
    },
    {
      "tier": "Pro",
      "price": "$19/mo",
      "desc": "200 workflow runs / mo · export · audit log"
    },
    {
      "tier": "Enterprise",
      "price": "Custom",
      "desc": "BYOK · project library · shared brand rules · seats"
    }
  ],
}
