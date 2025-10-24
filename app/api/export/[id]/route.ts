import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateMarkdown } from '@/lib/markdown'
import { Advice } from '@/lib/ai'
import { ChecksResultWithNotes } from '@/lib/checks'
import { LighthouseMetrics } from '@/lib/lighthouse'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const report = await prisma.report.findUnique({
      where: { id },
      include: { site: true },
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const markdown = generateMarkdown({
      id: report.id,
      siteUrl: report.site.url,
      createdAt: report.createdAt,
      score: report.score,
      rawMeta: report.rawMeta as Record<string, unknown>,
      checks: report.checks as ChecksResultWithNotes,
      aiAdvice: report.aiAdvice as Advice,
      lighthouse: report.lighthouse as LighthouseMetrics | null,
    })

    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="seo-report-${id}.md"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    )
  }
}
