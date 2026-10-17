import type { Measurement } from '../types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from './bpClassification'
import { SERIES } from './series'
import { computeAllStats } from './stats'

/**
 * Client-side PDF report generation (spec §2 "PDF export", §9 risk note).
 *
 * Per the spec's risk note, this does NOT screenshot the live app UI:
 *  - Tailwind v4 emits `oklch()` colors by default, which plain `html2canvas`
 *    cannot parse at all (hence this project's use of `html2canvas-pro`,
 *    which does — see `ai/instructions/bp-monitor-spec.md`'s "PDF export
 *    library" note).
 *  - The live chart (`BloodPressureChart`) renders via Recharts'
 *    `ResponsiveContainer`, which sizes itself from a measurable parent and
 *    renders blank if captured while off-screen/detached.
 *
 * Instead, `buildReportElement` builds a dedicated, simplified print
 * template from plain DOM nodes with fixed pixel dimensions and inline
 * hex/rgb styles only (no Tailwind classes, no Recharts) — sidestepping
 * both problems regardless of which screenshot library renders it.
 *
 * `html2canvas-pro` and `jspdf` are both dynamically imported so their
 * ~140KB+ (gzipped) combined weight is only ever fetched when a user
 * actually exports or shares — never part of the initial bundle.
 *
 * Nothing in this module makes a network request; everything is generated
 * and rendered entirely client-side from in-memory data.
 */

const INK = '#1b302b'
const MUTED = '#788883'
const BORDER = '#e3ebe8'
const SURFACE_ALT = '#f4f7f6'
const REPORT_WIDTH = 760

export interface ExportReportOptions {
  /** Measurements already scoped to the range being reported on. */
  measurements: Measurement[]
  /** Human-readable label for the selected range, e.g. "Last 30 days". */
  dateRangeLabel: string
}

/** Stamped with today's date so repeated exports don't collide, e.g. "blood-pressure-report-2026-10-17.pdf". */
export function reportFileName(date: Date = new Date()): string {
  return `blood-pressure-report-${date.toISOString().slice(0, 10)}.pdf`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function buildStatsSection(measurements: Measurement[]): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'margin-bottom: 20px;'

  const heading = document.createElement('h2')
  heading.textContent = 'Summary'
  heading.style.cssText = `font-size: 14px; margin: 0 0 8px; color: ${INK};`
  wrapper.appendChild(heading)

  const grid = document.createElement('div')
  grid.style.cssText = 'display: flex; gap: 16px; flex-wrap: wrap;'

  for (const { label, unit, stats } of computeAllStats(measurements)) {
    const card = document.createElement('div')
    card.style.cssText = `border: 1px solid ${BORDER}; border-radius: 6px; padding: 10px 14px; min-width: 140px;`

    const title = document.createElement('div')
    title.textContent = label
    title.style.cssText = `font-size: 10px; font-weight: bold; letter-spacing: 0.04em; text-transform: uppercase; color: ${MUTED}; margin-bottom: 4px;`
    card.appendChild(title)

    const lines = [
      `Mean: ${stats.mean.toFixed(1)} ${unit}`,
      `Min: ${stats.min} ${unit}`,
      `Max: ${stats.max} ${unit}`,
    ]
    for (const line of lines) {
      const row = document.createElement('div')
      row.textContent = line
      row.style.cssText = `font-size: 11px; color: ${INK};`
      card.appendChild(row)
    }

    grid.appendChild(card)
  }

  wrapper.appendChild(grid)
  return wrapper
}

/**
 * A plain inline-SVG line chart (fixed dimensions, hex strokes) built from
 * scratch rather than rendering `BloodPressureChart` — see module doc for
 * why reusing the Recharts component here isn't safe.
 */
function buildChartSection(measurements: Measurement[]): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'margin-bottom: 20px;'

  const heading = document.createElement('h2')
  heading.textContent = 'Trend'
  heading.style.cssText = `font-size: 14px; margin: 0 0 8px; color: ${INK};`
  wrapper.appendChild(heading)

  const sorted = [...measurements].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  )

  const width = REPORT_WIDTH - 48
  const height = 220
  const marginLeft = 34
  const marginRight = 10
  const marginTop = 10
  const marginBottom = 24
  const plotWidth = width - marginLeft - marginRight
  const plotHeight = height - marginTop - marginBottom

  const allValues = sorted.flatMap((m) => [m.systolic, m.diastolic, m.pulse])
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)
  const padding = Math.max(5, (maxValue - minValue) * 0.1)
  const yMin = Math.max(0, minValue - padding)
  const yMax = maxValue + padding
  const yRange = yMax - yMin || 1

  const xStep = sorted.length > 1 ? plotWidth / (sorted.length - 1) : 0
  const xFor = (i: number) =>
    marginLeft + (sorted.length > 1 ? i * xStep : plotWidth / 2)
  const yFor = (value: number) =>
    marginTop + plotHeight - ((value - yMin) / yRange) * plotHeight

  const svgNS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('width', String(width))
  svg.setAttribute('height', String(height))
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  svg.style.display = 'block'

  const gridLines = 4
  for (let i = 0; i <= gridLines; i++) {
    const value = yMin + (yRange * i) / gridLines
    const y = yFor(value)

    const line = document.createElementNS(svgNS, 'line')
    line.setAttribute('x1', String(marginLeft))
    line.setAttribute('x2', String(width - marginRight))
    line.setAttribute('y1', String(y))
    line.setAttribute('y2', String(y))
    line.setAttribute('stroke', BORDER)
    line.setAttribute('stroke-width', '1')
    svg.appendChild(line)

    const label = document.createElementNS(svgNS, 'text')
    label.setAttribute('x', String(marginLeft - 6))
    label.setAttribute('y', String(y + 3))
    label.setAttribute('text-anchor', 'end')
    label.setAttribute('font-size', '9')
    label.setAttribute('fill', MUTED)
    label.textContent = String(Math.round(value))
    svg.appendChild(label)
  }

  if (sorted.length > 0) {
    const labelIndices =
      sorted.length === 1
        ? [0]
        : Array.from(new Set([0, Math.floor((sorted.length - 1) / 2), sorted.length - 1]))

    for (const i of labelIndices) {
      const point = sorted[i]
      const text = document.createElementNS(svgNS, 'text')
      text.setAttribute('x', String(xFor(i)))
      text.setAttribute('y', String(height - 6))
      text.setAttribute(
        'text-anchor',
        i === 0 ? 'start' : i === sorted.length - 1 ? 'end' : 'middle',
      )
      text.setAttribute('font-size', '9')
      text.setAttribute('fill', MUTED)
      text.textContent = point.timestamp.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
      svg.appendChild(text)
    }
  }

  for (const series of SERIES) {
    if (sorted.length === 0) continue
    if (sorted.length === 1) {
      const circle = document.createElementNS(svgNS, 'circle')
      circle.setAttribute('cx', String(xFor(0)))
      circle.setAttribute('cy', String(yFor(sorted[0][series.key])))
      circle.setAttribute('r', '3')
      circle.setAttribute('fill', series.color)
      svg.appendChild(circle)
      continue
    }

    const points = sorted
      .map((m, i) => `${xFor(i)},${yFor(m[series.key])}`)
      .join(' ')
    const polyline = document.createElementNS(svgNS, 'polyline')
    polyline.setAttribute('points', points)
    polyline.setAttribute('fill', 'none')
    polyline.setAttribute('stroke', series.color)
    polyline.setAttribute('stroke-width', '2')
    svg.appendChild(polyline)
  }

  wrapper.appendChild(svg)

  const legend = document.createElement('div')
  legend.style.cssText = `display: flex; gap: 16px; margin-top: 8px; font-size: 11px; color: ${INK};`
  for (const series of SERIES) {
    const item = document.createElement('span')
    item.style.cssText = 'display: inline-flex; align-items: center; gap: 4px;'

    const swatch = document.createElement('span')
    swatch.style.cssText = `display: inline-block; width: 10px; height: 10px; background-color: ${series.color}; border-radius: 2px;`
    item.appendChild(swatch)

    const text = document.createElement('span')
    text.textContent = `${series.label} (${series.unit})`
    item.appendChild(text)

    legend.appendChild(item)
  }
  wrapper.appendChild(legend)

  return wrapper
}

function buildTableSection(measurements: Measurement[]): HTMLElement {
  const wrapper = document.createElement('div')

  const heading = document.createElement('h2')
  heading.textContent = 'Measurements'
  heading.style.cssText = `font-size: 14px; margin: 0 0 8px; color: ${INK};`
  wrapper.appendChild(heading)

  const table = document.createElement('table')
  table.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 10px;'

  const thead = document.createElement('thead')
  const headRow = document.createElement('tr')
  for (const label of [
    'Date',
    'Time',
    'Systolic',
    'Diastolic',
    'Pulse',
    'Category',
    'Note',
  ]) {
    const th = document.createElement('th')
    th.textContent = label
    th.style.cssText = `text-align: left; padding: 4px 6px; border-bottom: 1px solid ${INK}; color: ${INK};`
    headRow.appendChild(th)
  }
  thead.appendChild(headRow)
  table.appendChild(thead)

  const tbody = document.createElement('tbody')
  const sortedDesc = [...measurements].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  )

  sortedDesc.forEach((measurement, index) => {
    const row = document.createElement('tr')
    row.style.backgroundColor = index % 2 === 0 ? '#ffffff' : SURFACE_ALT

    const cells = [
      formatDate(measurement.timestamp),
      formatTime(measurement.timestamp),
      `${measurement.systolic} mmHg`,
      `${measurement.diastolic} mmHg`,
      `${measurement.pulse} bpm`,
      CATEGORY_LABELS[measurement.category],
      measurement.note ?? '—',
    ]

    cells.forEach((value, cellIndex) => {
      const td = document.createElement('td')
      td.textContent = value
      td.style.cssText = `padding: 4px 6px; border-bottom: 1px solid ${BORDER}; color: ${INK}; vertical-align: top;`
      if (cellIndex === 5) {
        td.style.color = CATEGORY_COLORS[measurement.category]
        td.style.fontWeight = 'bold'
      }
      row.appendChild(td)
    })

    tbody.appendChild(row)
  })
  table.appendChild(tbody)

  wrapper.appendChild(table)
  return wrapper
}

/** Builds the off-screen print template described in the module doc comment. */
function buildReportElement(
  measurements: Measurement[],
  dateRangeLabel: string,
): HTMLDivElement {
  const container = document.createElement('div')
  container.style.cssText = `position: fixed; top: 0; left: -10000px; width: ${REPORT_WIDTH}px; background-color: #ffffff; color: ${INK}; font-family: Arial, Helvetica, sans-serif; padding: 24px; box-sizing: border-box;`

  const title = document.createElement('h1')
  title.textContent = 'Blood Pressure Report'
  title.style.cssText = `font-size: 20px; margin: 0 0 4px; color: ${INK};`
  container.appendChild(title)

  const subtitle = document.createElement('p')
  subtitle.textContent = `Range: ${dateRangeLabel} · Generated ${new Date().toLocaleString()}`
  subtitle.style.cssText = `font-size: 12px; margin: 0 0 20px; color: ${MUTED};`
  container.appendChild(subtitle)

  if (measurements.length === 0) {
    const empty = document.createElement('p')
    empty.textContent = 'No measurements recorded in this range.'
    empty.style.cssText = `font-size: 13px; color: ${MUTED};`
    container.appendChild(empty)
    return container
  }

  container.appendChild(buildStatsSection(measurements))
  container.appendChild(buildChartSection(measurements))
  container.appendChild(buildTableSection(measurements))

  return container
}

/**
 * Pure pagination math: slices a tall source canvas into one-or-more page
 * images that each fit the usable (margin-subtracted) PDF page area.
 * Kept separate from DOM/canvas work so it's easy to reason about/verify
 * independent of html2canvas or jsPDF.
 */
export function computePageSlices(
  canvasWidth: number,
  canvasHeight: number,
  usableWidthPt: number,
  usableHeightPt: number,
): Array<{ sourceY: number; sourceHeight: number; heightPt: number }> {
  if (canvasWidth <= 0 || canvasHeight <= 0) return []

  const pxPerPt = canvasWidth / usableWidthPt
  const pageHeightPx = Math.max(1, Math.floor(usableHeightPt * pxPerPt))

  const slices: Array<{ sourceY: number; sourceHeight: number; heightPt: number }> = []
  let renderedPx = 0
  while (renderedPx < canvasHeight) {
    const sourceHeight = Math.min(pageHeightPx, canvasHeight - renderedPx)
    slices.push({
      sourceY: renderedPx,
      sourceHeight,
      heightPt: sourceHeight / pxPerPt,
    })
    renderedPx += sourceHeight
  }
  return slices
}

/**
 * Generates the full PDF report client-side and returns it as a Blob.
 * No network requests are made anywhere in this flow.
 */
export async function generateReportPdf({
  measurements,
  dateRangeLabel,
}: ExportReportOptions): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ])

  const container = buildReportElement(measurements, dateRangeLabel)
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2,
    })

    const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 24
    const usableWidth = pageWidth - margin * 2
    const usableHeight = pageHeight - margin * 2

    const slices = computePageSlices(
      canvas.width,
      canvas.height,
      usableWidth,
      usableHeight,
    )

    slices.forEach((slice, index) => {
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = slice.sourceHeight
      const ctx = pageCanvas.getContext('2d')
      if (!ctx) {
        throw new Error('Could not create a 2D canvas context for PDF export.')
      }
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      ctx.drawImage(
        canvas,
        0,
        slice.sourceY,
        canvas.width,
        slice.sourceHeight,
        0,
        0,
        canvas.width,
        slice.sourceHeight,
      )

      if (index > 0) pdf.addPage()
      pdf.addImage(
        pageCanvas.toDataURL('image/png'),
        'PNG',
        margin,
        margin,
        usableWidth,
        slice.heightPt,
      )
    })

    return pdf.output('blob')
  } finally {
    container.remove()
  }
}

/** Plain-text summary used for the Web Share API text fallback and clipboard copy. */
export function buildReportSummaryText(
  measurements: Measurement[],
  dateRangeLabel: string,
): string {
  if (measurements.length === 0) {
    return `Blood pressure report (${dateRangeLabel}): no measurements recorded.`
  }

  const lines = [
    `Blood pressure report — ${dateRangeLabel}`,
    `${measurements.length} measurement${measurements.length === 1 ? '' : 's'}`,
  ]
  for (const { label, unit, stats } of computeAllStats(measurements)) {
    lines.push(
      `${label}: mean ${stats.mean.toFixed(1)} ${unit}, range ${stats.min}–${stats.max} ${unit}`,
    )
  }
  return lines.join('\n')
}

/** Triggers a browser download of the given blob — no network involved. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
