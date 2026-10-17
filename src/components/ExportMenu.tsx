import { useState } from 'react'
import { cn } from '../lib/utils'
import type { Measurement } from '../types'
import {
  buildReportSummaryText,
  downloadBlob,
  generateReportPdf,
  reportFileName,
} from '../utils/pdfExport'
import { Button } from './ui/button'

interface ExportMenuProps {
  /** Measurements already scoped to the export view's selected date range. */
  measurements: Measurement[]
  /** Human-readable label for that range, e.g. "Last 30 days" — shown in the report and share text. */
  dateRangeLabel: string
}

type Status =
  | { kind: 'idle' }
  | { kind: 'busy'; action: 'pdf' | 'share' }
  | { kind: 'done'; message: string }
  | { kind: 'error'; message: string }

/**
 * True only when the full native share sheet, including attaching the PDF
 * file, is available — checked at runtime (not assumed, not try/caught)
 * per `ai/tasks/05-export-and-sharing.md`'s "detect support, don't just
 * try/catch and hope" requirement.
 */
function canShareFile(file: File): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  )
}

function hasShareApi(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

function hasClipboardSupport(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  )
}

/**
 * "Export PDF" and "Share" actions for the `/export` report (spec §2
 * "Export" row, §9 risk "Web Share API unavailable on some platforms").
 * Entirely client-side: PDF generation happens in `pdfExport.ts` with no
 * network calls, and sharing/fallbacks use only `navigator.share`,
 * `navigator.clipboard`, and a plain file download.
 */
function ExportMenu({ measurements, dateRangeLabel }: ExportMenuProps) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const isBusy = status.kind === 'busy'

  const handleExportPdf = async () => {
    setStatus({ kind: 'busy', action: 'pdf' })
    try {
      const blob = await generateReportPdf({ measurements, dateRangeLabel })
      downloadBlob(blob, reportFileName())
      setStatus({ kind: 'done', message: 'PDF downloaded.' })
    } catch (error) {
      setStatus({
        kind: 'error',
        message:
          error instanceof Error ? error.message : 'Could not generate the PDF.',
      })
    }
  }

  const handleShare = async () => {
    setStatus({ kind: 'busy', action: 'share' })
    // Hoisted out of the try block so the `NotAllowedError` fallback below
    // can reuse the already-generated PDF instead of rendering it again.
    let blob: Blob | undefined
    let filename: string | undefined
    try {
      blob = await generateReportPdf({ measurements, dateRangeLabel })
      filename = reportFileName()
      const file = new File([blob], filename, { type: 'application/pdf' })
      const summary = buildReportSummaryText(measurements, dateRangeLabel)

      if (canShareFile(file)) {
        await navigator.share({
          files: [file],
          title: 'Blood Pressure Report',
          text: summary,
        })
        setStatus({ kind: 'done', message: 'Opened the share sheet.' })
        return
      }

      if (hasShareApi()) {
        // Share API exists but this browser won't attach files to it —
        // share the text summary instead of silently downgrading further.
        await navigator.share({ title: 'Blood Pressure Report', text: summary })
        downloadBlob(blob, filename)
        setStatus({
          kind: 'done',
          message:
            "This browser's share sheet can't attach files, so it shared a text summary — the PDF was downloaded as well.",
        })
        return
      }

      if (hasClipboardSupport()) {
        await navigator.clipboard.writeText(summary)
        downloadBlob(blob, filename)
        setStatus({
          kind: 'done',
          message:
            "Sharing isn't supported on this browser. Copied a summary to the clipboard and downloaded the PDF instead.",
        })
        return
      }

      downloadBlob(blob, filename)
      setStatus({
        kind: 'done',
        message:
          "Sharing isn't supported on this browser. Downloaded the PDF instead.",
      })
    } catch (error) {
      // The user dismissing the native share sheet is not a failure.
      if (error instanceof DOMException && error.name === 'AbortError') {
        setStatus({ kind: 'idle' })
        return
      }

      // `generateReportPdf()` (dynamic imports + an html2canvas-pro render)
      // runs before `navigator.share()` above, which can take long enough
      // on a slow device/large report to outlast the browser's ~5s
      // transient-activation window — `navigator.share()` then throws
      // `NotAllowedError` even though the user *did* click Share. Treat
      // that the same as "share unsupported" and fall through to the
      // clipboard/download fallback instead of surfacing a raw error and
      // losing the already-generated PDF.
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        try {
          // Reuse the PDF generated above rather than rendering it again;
          // only (re)generate if the throw happened before it existed.
          blob ??= await generateReportPdf({ measurements, dateRangeLabel })
          filename ??= reportFileName()
          const summary = buildReportSummaryText(measurements, dateRangeLabel)

          if (hasClipboardSupport()) {
            await navigator.clipboard.writeText(summary)
            downloadBlob(blob, filename)
            setStatus({
              kind: 'done',
              message:
                "Sharing timed out, so this copied a summary to the clipboard and downloaded the PDF instead.",
            })
            return
          }

          downloadBlob(blob, filename)
          setStatus({
            kind: 'done',
            message: 'Sharing timed out, so this downloaded the PDF instead.',
          })
          return
        } catch (fallbackError) {
          setStatus({
            kind: 'error',
            message:
              fallbackError instanceof Error
                ? fallbackError.message
                : 'Could not share the report.',
          })
          return
        }
      }

      setStatus({
        kind: 'error',
        message:
          error instanceof Error ? error.message : 'Could not share the report.',
      })
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={handleExportPdf} disabled={isBusy}>
          {status.kind === 'busy' && status.action === 'pdf'
            ? 'Generating PDF…'
            : 'Export PDF'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleShare}
          disabled={isBusy}
        >
          {status.kind === 'busy' && status.action === 'share'
            ? 'Preparing…'
            : 'Share'}
        </Button>
      </div>

      <p
        role="status"
        aria-live="polite"
        className={cn(
          'min-h-5 text-sm',
          status.kind === 'error' ? 'text-red-600' : 'text-muted',
        )}
      >
        {status.kind === 'done' || status.kind === 'error' ? status.message : ''}
      </p>
    </div>
  )
}

export default ExportMenu
