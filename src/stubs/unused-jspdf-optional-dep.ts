/**
 * Stub for jsPDF's `optionalDependencies` (`html2canvas`, `canvg`,
 * `dompurify`) that this app never actually needs.
 *
 * jsPDF 4.2.1 statically imports these three packages (plus `core-js`,
 * which isn't module-shaped enough to alias the same way) to support
 * `jsPDF.prototype.html()` and `.addSvgAsImage()` — but this app only ever
 * calls `addImage`/`output` (see `src/utils/pdfExport.ts`), rendering its
 * report via `html2canvas-pro` (a separate, explicit dependency) and never
 * touching jsPDF's own HTML/SVG helpers.
 *
 * Without this, Vite/Rollup still has to bundle `html2canvas`, `canvg`, and
 * `dompurify` as their own chunks (shipped to users on every PDF export)
 * purely because jsPDF references them, even though the code paths that use
 * them are dead for this app. `vite.config.ts` aliases those three import
 * specifiers to this module so they resolve to a few bytes instead.
 *
 * The exported function is a defensive guard, not an expected code path: if
 * jsPDF's `.html()`/`.addSvgAsImage()` are ever called (directly or via a
 * future dependency bump), this throws a clear error instead of silently
 * misbehaving, so the gap is obvious immediately rather than discovered as
 * a confusing runtime bug.
 */
export default function unusedJsPdfOptionalDep(): never {
  throw new Error(
    'Unsupported in this build: jsPDF.html()/addSvgAsImage() (and their ' +
      'html2canvas/canvg/dompurify dependencies) are intentionally stubbed ' +
      'out — this app never calls those APIs. See ' +
      'src/stubs/unused-jspdf-optional-dep.ts.',
  )
}
