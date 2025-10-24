import { NextRequest, NextResponse } from 'next/server'
import { fetchAndExtract } from '@/lib/fetchPage'
import { runChecks } from '@/lib/checks'
import { getAIAdvice } from '@/lib/ai'
import { runPageSpeedInsights } from '@/lib/pagespeed'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'url required' }, { status: 400 })
    }

    // Normalize URL
    const normalized = new URL(url).toString()

    // Extract page data
    const extracted = await fetchAndExtract(normalized)

    // Run SEO checks
    const checks = runChecks(extracted)

    // Calculate simple score (100 - 5 per failed check)
    const failedChecks = Object.entries(checks).filter(
      ([key, value]) => key !== 'notes' && !value
    ).length
    const score = Math.max(0, 100 - failedChecks * 5)

    // Run PageSpeed Insights (Google's Lighthouse API) FIRST
    let lighthouseData = null
    const enablePageSpeed = process.env.PAGESPEED_API_KEY

    if (enablePageSpeed) {
      try {
        lighthouseData = await runPageSpeedInsights(normalized)
      } catch (error) {
        console.error('PageSpeed Insights error:', error)
        // Continue without Lighthouse data if it fails
      }
    }

    // Prepare AI input (now including Lighthouse data)
    const aiInput = {
      page: {
        url: normalized,
        title: extracted.title,
        meta_description: extracted.metaDescription,
        canonical: extracted.canonical,
        robots_meta: extracted.robotsMeta,
        lang: extracted.lang,
        viewport: extracted.viewport,
        h1_count: extracted.h1Count,
        h2_count: extracted.h2Count,
        og_tags_present: extracted.ogTagsPresent,
        twitter_tags_present: extracted.twitterTagsPresent,
        links_count: extracted.linksCount,
        images_count: extracted.imagesCount,
        images_with_alt: extracted.imagesWithAlt,
        has_schema_ld_json: extracted.hasSchemaLD,
      },
      checks: Object.entries(checks)
        .filter(([key]) => key !== 'notes')
        .map(([key, ok]) => ({
          key,
          ok: ok as boolean,
          note: checks.notes?.[key],
        })),
      lighthouse: lighthouseData || undefined,
    }

    // Get AI advice (now with Lighthouse data)
    const aiAdvice = await getAIAdvice(aiInput)

    // Upsert site
    const site = await prisma.site.upsert({
      where: { url: normalized },
      update: {},
      create: { url: normalized },
    })

    // Create report
    const report = await prisma.report.create({
      data: {
        siteId: site.id,
        score,
        rawMeta: extracted as never,
        checks: checks as never,
        aiAdvice: aiAdvice as never,
        lighthouse: lighthouseData as never,
      },
      include: {
        site: true,
      },
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Audit error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to audit URL' },
      { status: 500 }
    )
  }
}
