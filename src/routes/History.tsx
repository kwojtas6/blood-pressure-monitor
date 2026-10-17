import { useEffect } from 'react'
import { Link } from 'react-router'
import { useMeasurements } from '../store/useMeasurements'
import { CATEGORY_LABELS } from '../utils/bpClassification'

/**
 * Temporary placeholder list — just enough to exercise edit/delete
 * end-to-end for Task 2. Task 3 replaces this with the real, styled
 * `MeasurementList` (chronological, color-coded, filterable/sortable).
 */
function History() {
  const measurements = useMeasurements((state) => state.measurements)
  const isLoading = useMeasurements((state) => state.isLoading)
  const load = useMeasurements((state) => state.load)
  const remove = useMeasurements((state) => state.remove)

  useEffect(() => {
    load()
  }, [load])

  return (
    <section aria-labelledby="history-heading">
      <h1 id="history-heading" className="text-2xl font-bold text-ink">
        History
      </h1>
      <p className="mt-2 text-muted">
        The full, filterable and sortable measurement list will live here.
      </p>

      {isLoading && <p className="mt-4 text-muted">Loading…</p>}
      {!isLoading && measurements.length === 0 && (
        <p className="mt-4 text-muted">No measurements recorded yet.</p>
      )}

      <ul className="mt-4 space-y-2">
        {measurements.map((measurement) => (
          <li
            key={measurement.id}
            className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2"
          >
            <span>
              {measurement.timestamp.toLocaleString()} —{' '}
              {measurement.systolic}/{measurement.diastolic} mmHg, pulse{' '}
              {measurement.pulse} bpm ({CATEGORY_LABELS[measurement.category]})
            </span>
            <span className="flex shrink-0 gap-2">
              <Link to={`/add/${measurement.id}`} className="text-accent underline">
                Edit
              </Link>
              <button
                type="button"
                className="text-red-600 underline"
                onClick={() => {
                  if (window.confirm('Delete this measurement?')) {
                    remove(measurement.id)
                  }
                }}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default History
