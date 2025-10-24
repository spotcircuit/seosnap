import { Report, Site } from '@prisma/client'
import { Extracted } from '@/lib/fetchPage'
import { ChecksResultWithNotes } from '@/lib/checks'
import { Advice } from '@/lib/ai'

export type { Extracted, ChecksResultWithNotes, Advice }

export type ReportWithSite = Report & {
  site: Site
}

export type AuditResponse = {
  report: ReportWithSite
}

export type ReportsListResponse = {
  reports: ReportWithSite[]
}
