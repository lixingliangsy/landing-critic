export const RULESET_VERSION = 'content-ops@2026-10-28'

export interface Rule {
  ruleId: string
  name: string
  category: 'value_prop' | 'cta' | 'target_user' | 'social_proof' | 'pricing' | 'structure' | 'claims' | 'markup'
  check: (content: string) => { passed: boolean; details: string }
  /** Authoritative source URL(s) backing this rule (web-research gate). */
  ref: string[]
}

export const landingPageRules: Rule[] = [
  {
    ruleId: 'VP_FIRST_PARAGRAPH',
    name: 'Value proposition in first paragraph',
    category: 'value_prop',
    check: (content) => {
      const firstPara = content.split('\n')[0] || ''
      const hasBenefit = /(help|save|build|create|get|turn|ship|grow|increase|reduce|improve)/i.test(firstPara)
      return { passed: hasBenefit, details: hasBenefit ? 'Value prop found in opening' : 'No clear benefit stated upfront' }
    },
    ref: ['https://www.ftc.gov/business-guidance/advertising-marketing'],
  },
  {
    ruleId: 'CTA_VERB',
    name: 'Clear CTA with action verb',
    category: 'cta',
    check: (content) => {
      const hasCta = /(get started|try free|sign up|start free|begin|launch|build now|join)/i.test(content)
      return { passed: hasCta, details: hasCta ? 'Actionable CTA present' : 'Missing or weak CTA verb' }
    },
    ref: ['https://www.ftc.gov/business-guidance/advertising-marketing'],
  },
  {
    ruleId: 'TARGET_USER',
    name: 'Target user mentioned',
    category: 'target_user',
    check: (content) => {
      const hasUser = /(for [a-z]+(ers|ers\s|ers\n)|designed for|built for|made for)/i.test(content)
      return { passed: hasUser, details: hasUser ? 'Target audience identified' : 'No target user specified' }
    },
    ref: ['https://www.ftc.gov/business-guidance/advertising-marketing'],
  },
  {
    ruleId: 'SOCIAL_PROOF',
    name: 'Social proof present',
    category: 'social_proof',
    check: (content) => {
      const hasProof = /(\d+ [a-z]+(ers|mers|bs|ms|s)|customers|users|teams|reviews|stars|rating|trusted by)/i.test(content)
      return { passed: hasProof, details: hasProof ? 'Social proof included' : 'No social proof elements' }
    },
    ref: ['https://www.ftc.gov/news-events/topics/truth-advertising/advertisement-endorsements', 'https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255/section-255.2'],
  },
  {
    ruleId: 'PRICING_VISIBLE',
    name: 'Pricing information visible',
    category: 'pricing',
    check: (content) => {
      const hasPrice = /(\$[\d.]+|price|plan|\/mo|per month|free trial)/i.test(content)
      return { passed: hasPrice, details: hasPrice ? 'Pricing information shown' : 'Pricing not mentioned' }
    },
    ref: ['https://www.ftc.gov/business-guidance/advertising-marketing'],
  },
  {
    ruleId: 'HEADLINE_LENGTH',
    name: 'Headline length check',
    category: 'structure',
    check: (content) => {
      const lines = content.split('\n').filter((l) => l.trim())
      const headline = lines[0] || ''
      const len = headline.length
      return { passed: len >= 10 && len <= 60, details: `Headline length: ${len} chars (optimal: 10-60)` }
    },
    ref: ['https://www.w3.org/WAI/WCAG22/quickref/'],
  },
  {
    ruleId: 'CLAIM_SUBSTANTIATION',
    name: 'No unsubstantiated / exaggerated efficacy claims',
    category: 'claims',
    check: (content) => {
      const hasExaggeration =
        /(guaranteed|100%|best in the world|#1|never fail|instant|overnight|double your (sales|revenue) overnight|eliminate all|bulletproof|no risk|scientifically proven|magic)/i.test(
          content,
        )
      return {
        passed: !hasExaggeration,
        details: hasExaggeration
          ? 'Claim may need prior substantiation; FTC requires evidence for objective claims'
          : 'No obvious unsubstantiated claim',
      }
    },
    ref: ['https://www.ftc.gov/business-guidance/advertising-marketing', 'https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255'],
  },
  {
    ruleId: 'MARKUP_PRESENT',
    name: 'Structured data / OpenGraph markup present',
    category: 'markup',
    check: (content) => {
      // Content passed here is copy only; flag when no schema/OG hints are described.
      const hasMarkupHint = /(og:|open graph|schema\.org|json-ld|structured data|meta property|@type)/i.test(content)
      return {
        passed: hasMarkupHint,
        details: hasMarkupHint ? 'Schema/OpenGraph markup referenced' : 'Add schema.org / OpenGraph meta for sharing + SEO',
      }
    },
    ref: ['https://schema.org/docs/documents.html', 'https://ogp.me/'],
  },
]

export function applyRules(content: string): { ruleId: string; name: string; passed: boolean; details: string; ref: string[] }[] {
  return landingPageRules.map((rule) => {
    const result = rule.check(content)
    return { ruleId: rule.ruleId, name: rule.name, passed: result.passed, details: result.details, ref: rule.ref }
  })
}


export type RuleHit = { id: string; title: string; severity: 'low' | 'medium' | 'high'; passed: boolean; remediation?: string; ref?: string }

export function runDeterministicChecks(inputs: Record<string, string>): RuleHit[] {
  const content = Object.values(inputs || {}).join('\n')
  return applyRules(content).map((r) => ({
    id: String(r.ruleId),
    title: String(r.name),
    severity: (r.passed ? 'low' : 'medium') as 'low' | 'medium' | 'high',
    passed: !!r.passed,
    remediation: r.details,
    ref: Array.isArray(r.ref) ? r.ref[0] : undefined,
  }))
}
