import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'url parameter required' }, { status: 400 })
    }

    // Find site by URL
    const site = await prisma.site.findUnique({
      where: { url },
      include: {
        reports: {
          orderBy: { createdAt: 'desc' },
          include: { site: true },
        },
      },
    })

    if (!site) {
      return NextResponse.json({ reports: [] })
    }

    return NextResponse.json({ reports: site.reports })
  } catch (error) {
    console.error('Reports list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}
