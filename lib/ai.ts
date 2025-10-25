import { z } from 'zod'
import OpenAI from 'openai'

const AdviceSchema = z.object({
  score: z.number().min(0).max(100),
  top_issues: z.array(z.object({
    issue: z.string(),
    why: z.string(),
    fix: z.string(),
    impact: z.enum(['High', 'Medium', 'Low']),
  })).min(1).max(5),
  quick_wins: z.array(z.string()).max(10),
  rewrite_suggestions: z.object({
    title: z.string().optional(),
    meta_description: z.string().optional(),
  }),
  prioritized_actions: z.array(z.string()).min(1).max(10),
})

export type Advice = z.infer<typeof AdviceSchema>

export async function getAIAdvice(input: {
  page: {
    url: string
    title?: string
    meta_description?: string
    canonical?: string
    robots_meta?: string
    lang?: string
    viewport?: string
    h1_count: number
    h2_count: number
    og_tags_present: boolean
    twitter_tags_present: boolean
    links_count: number
    images_count: number
    images_with_alt: number
    has_schema_ld_json: boolean
  }
  checks: Array<{ key: string; ok: boolean; note?: string }>
  lighthouse?: {
    scores: {
      performance: number
      accessibility: number
      bestPractices: number
      seo: number
    }
    metrics: {
      firstContentfulPaint?: number
      largestContentfulPaint?: number
      totalBlockingTime?: number
      cumulativeLayoutShift?: number
      speedIndex?: number
      timeToInteractive?: number
    }
  }
}): Promise<Advice> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

  const systemPrompt = `You are a senior technical SEO auditor. Output strictly valid JSON using the schema below.
Focus on actionable, prioritized guidance with measurable rationale.

Schema:
{
  "score": 0-100,
  "top_issues": [
    {"issue": "", "why": "", "fix": "", "impact": "High|Medium|Low"}
  ],
  "quick_wins": [""],
  "rewrite_suggestions": {
    "title": "",
    "meta_description": ""
  },
  "prioritized_actions": [""]
}

Guidance:
- Keep JSON compact and valid. Avoid markdown or commentary.
- Score 0–100 reflecting technical discoverability & relevance (not content depth).
- CRITICAL: impact field MUST be EXACTLY one of these three strings: "High", "Medium", or "Low" - NO other values like "Medium-High", "Critical", etc.
- If Lighthouse data is provided, ALWAYS factor performance, accessibility, and Core Web Vitals into your analysis.
- IMPORTANT: Acknowledge GOOD performance! If Core Web Vitals are passing (FCP < 1.8s, LCP < 2.5s, CLS < 0.1), mention this as a strength in top_issues or quick_wins with impact: "Low".
- Flag performance issues: low Lighthouse scores (< 50), slow Core Web Vitals (FCP > 3s, LCP > 4s, CLS > 0.25), or poor performance scores (< 50).
- Limit top_issues to 3–5 items; each with why + fix + impact. Include at least one positive item if performance is strong.
- Impact guidelines: "High" = directly affects rankings/crawlability/UX, "Medium" = best practices violations, "Low" = positive feedback or minor optimizations
- rewrite_suggestions: concise, non-clickbait, best-practice lengths.
- prioritized_actions: ordered list of specific next steps, including performance optimizations if needed OR acknowledging strong performance.`

  const userPrompt = JSON.stringify(input)

  // Debug: Log what we're sending to AI
  console.log('=== AI Input ===')
  console.log('URL:', input.page.url)
  console.log('Title:', input.page.title)
  console.log('Meta Description:', input.page.meta_description)
  console.log('Failed Checks:', input.checks.filter(c => !c.ok).map(c => c.key))
  if (input.lighthouse) {
    console.log('Lighthouse Scores:', input.lighthouse.scores)
    console.log('Core Web Vitals:', {
      FCP: input.lighthouse.metrics.firstContentfulPaint,
      LCP: input.lighthouse.metrics.largestContentfulPaint,
      CLS: input.lighthouse.metrics.cumulativeLayoutShift
    })
  }
  console.log('===============')

  try {
    const resp = await client.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    })

    const text = resp.choices[0]?.message?.content || '{}'
    const parsed = AdviceSchema.safeParse(JSON.parse(text))

    if (!parsed.success) {
      console.error('AI validation error:', parsed.error)
      throw new Error('Invalid AI JSON response')
    }

    return parsed.data
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to get AI advice')
  }
}
