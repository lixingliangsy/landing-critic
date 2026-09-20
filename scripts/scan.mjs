// scan.mjs — landing-critic 落地页 CRO / 转化审计（真实实现，由 T1 审计模板契约驱动）
// 幂等：同输入同输出、无副作用、可重入。返回 { items:[{id,...}], metrics:{...} }
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA = path.join(ROOT, '.data')
const AUDIT = path.join(DATA, 'audit')

async function fetchText(url) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 12000)
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'user-agent': 't1-audit-bot/1.0 (+https://lxsai.com)' }
    })
    if (!r.ok) throw new Error('HTTP ' + r.status)
    return await r.text()
  } finally { clearTimeout(t) }
}

async function loadTargets(targets) {
  const docs = []
  for (const t of targets) {
    try {
      if (/^https?:\/\//i.test(t)) {
        docs.push(await fetchText(t)) // 真实联网抓取（config.scan.targets 填 https:// 即启用）
      } else {
        const p = path.isAbsolute(t) ? t : path.join(AUDIT, t)
        docs.push(fs.readFileSync(p, 'utf8'))
      }
    } catch (e) { console.warn('[scan] target load failed:', t, e.message) }
  }
  return docs
}
function countOcc(re, s) { return (s.match(re) || []).length }

export async function scan(ctx) {
  const cfg = JSON.parse(fs.readFileSync(path.join(DATA, 'config.json'), 'utf8'))
  const targets = (cfg.scan && cfg.scan.targets) || [path.join(AUDIT, 'landing-sample.html')]
  const html = (await loadTargets(targets)).join('\n')
  const items = []

  // 1) Hero headline (h1) + length
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const hero = h1 ? h1[1].replace(/<[^>]+>/g, '').trim() : ''
  if (!hero) {
    items.push({ id: 'cro:hero-missing', category: 'messaging', severity: 'high', title: 'No hero headline', detail: '页面缺少 <h1> 主标题', present: false })
  } else {
    const L = hero.length
    if (L < 10) items.push({ id: 'cro:hero-too-short', category: 'messaging', severity: 'medium', title: 'Hero too short', detail: `主标题仅 ${L} 字，信息量不足`, present: false })
    else if (L > 70) items.push({ id: 'cro:hero-too-long', category: 'messaging', severity: 'medium', title: 'Hero too long', detail: `主标题 ${L} 字，易淹没卖点`, present: false })
  }

  // 2) Subheadline / value prop
  const hasSub = /<h2[^>]*>/i.test(html) || /class="[^"]*lead[^"]*"/i.test(html) || /<p[^>]*>[\s\S]{40,}<\/p>/i.test(html)
  if (!hasSub) items.push({ id: 'cro:value-prop-missing', category: 'messaging', severity: 'medium', title: 'No clear value prop', detail: '缺少副标题或价值主张段落', present: false })

  // 3) Primary CTA
  const ctaRe = /<(a|button)[^>]*(class="[^"]*btn[^"]*"|get[\s-]?started|sign[\s-]?up|try[\s-]?free|book|demo|start)/i
  const ctaCount = countOcc(ctaRe, html)
  if (ctaCount === 0) items.push({ id: 'cro:cta-missing', category: 'conversion', severity: 'high', title: 'No primary CTA', detail: '未检测到任何行动号召按钮/链接', present: false })

  // 4) Pricing visible
  const hasPricing = /\$\s?\d|pricing|plan|per\s*month|\/mo/i.test(html)
  if (!hasPricing) items.push({ id: 'cro:pricing-hidden', category: 'conversion', severity: 'medium', title: 'Pricing not visible', detail: '页面未展示价格/方案', present: false })

  // 5) Social proof
  const hasProof = /testimonial|customer|client|review|rating|\bstars?\b|logo|trusted by|\d+\+?\s*(users|customers|teams|companies)/i.test(html)
  if (!hasProof) items.push({ id: 'cro:social-proof-missing', category: 'trust', severity: 'medium', title: 'No social proof', detail: '缺少客户评价/案例/信任标志', present: false })

  // 6) Trust signals
  const hasTrust = /secure|ssl|encrypt|privacy|gdpr|guarantee|money[\s-]?back|cancel anytime|no card/i.test(html)
  if (!hasTrust) items.push({ id: 'cro:trust-missing', category: 'trust', severity: 'low', title: 'Weak trust signals', detail: '缺少安全/隐私/退款等信任要素', present: false })

  // 7) Mobile viewport
  if (!/name=["']viewport["']/i.test(html)) items.push({ id: 'cro:viewport-missing', category: 'technical', severity: 'low', title: 'Missing viewport', detail: '缺少 viewport，移动端体验差', present: false })

  // 8) Lead capture
  const hasForm = /<input[^>]+(type=["']email["']|type=["']text["'])|<form/i.test(html)
  if (!hasForm) items.push({ id: 'cro:lead-capture-missing', category: 'conversion', severity: 'medium', title: 'No lead capture', detail: '无邮箱/表单捕获潜客', present: false })

  // 9) CTA clutter
  const distinctCta = new Set((html.match(/<(a|button)[^>]*>([\s\S]*?)<\/(a|button)>/gi) || [])
    .map(s => s.replace(/<[^>]+>/g, '').trim().toLowerCase()).filter(Boolean))
  if (distinctCta.size > 6) items.push({ id: 'cro:cta-cluttered', category: 'conversion', severity: 'low', title: 'CTA clutter', detail: `检测到 ${distinctCta.size} 个不同 CTA 文本，焦点分散`, present: false })

  const weights = { high: 18, medium: 10, low: 5 }
  const bySeverity = { high: 0, medium: 0, low: 0 }
  let penalty = 0
  for (const it of items) { penalty += weights[it.severity] || 0; bySeverity[it.severity]++ }
  const score = Math.max(0, 100 - penalty)

  const metrics = {
    cro_score: score,
    hero_present: !!hero,
    hero_len: hero.length,
    cta_count: ctaCount,
    distinct_cta: distinctCta.size,
    has_value_prop: hasSub,
    has_pricing: hasPricing,
    has_social_proof: hasProof,
    has_trust: hasTrust,
    has_lead_capture: hasForm,
    has_viewport: /name=["']viewport["']/i.test(html),
    by_severity: bySeverity
  }
  return { items, metrics }
}
