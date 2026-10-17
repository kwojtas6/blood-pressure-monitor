import { useEffect, useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useMeasurements } from '../store/useMeasurements'
import type { Measurement } from '../types'
import type { MeasurementInput } from '../store/useMeasurements'
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '../utils/datetimeLocal'
import {
  DIASTOLIC_RANGE,
  NOTE_MAX_LENGTH,
  PULSE_RANGE,
  SYSTOLIC_RANGE,
  hasValidationErrors,
  validateMeasurementForm,
  type MeasurementFormValues,
} from '../utils/measurementValidation'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface MeasurementFormProps {
  /** When provided, the form edits this existing measurement instead of creating a new one. */
  measurementId?: number
}

type TouchedFields = Partial<Record<keyof MeasurementFormValues, boolean>>

function valuesFromMeasurement(
  measurement: Measurement | undefined,
): MeasurementFormValues {
  if (!measurement) {
    return {
      systolic: '',
      diastolic: '',
      pulse: '',
      note: '',
      timestamp: toDatetimeLocalValue(new Date()),
    }
  }
  return {
    systolic: String(measurement.systolic),
    diastolic: String(measurement.diastolic),
    pulse: String(measurement.pulse),
    note: measurement.note ?? '',
    timestamp: toDatetimeLocalValue(measurement.timestamp),
  }
}

/**
 * Add/edit form for a single blood pressure reading (spec §2, §5).
 *
 * This outer component only answers one question — "do we have what we
 * need to render the form yet?" — by synchronizing with the IndexedDB-backed
 * store (a legitimate `useEffect` use: an external system, not derived
 * state). The actual fields live in `MeasurementFormFields`, mounted only
 * once that question is answered, so its initial values can be derived
 * directly from `existing` during render instead of synced in afterwards.
 */
function MeasurementForm({ measurementId }: MeasurementFormProps) {
  const navigate = useNavigate()
  const measurements = useMeasurements((state) => state.measurements)
  const load = useMeasurements((state) => state.load)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  // Refresh from IndexedDB on mount so edit mode has data even on a direct
  // page load (e.g. the user bookmarked /add/:id).
  useEffect(() => {
    let cancelled = false
    load().finally(() => {
      if (!cancelled) setHasLoadedOnce(true)
    })
    return () => {
      cancelled = true
    }
  }, [load])

  const isEditMode = measurementId !== undefined
  const existing = isEditMode
    ? measurements.find((measurement) => measurement.id === measurementId)
    : undefined

  if (isEditMode && !hasLoadedOnce) {
    return <p className="mt-6 text-muted">Loading…</p>
  }

  if (isEditMode && !existing) {
    return (
      <section aria-labelledby="measurement-not-found-heading">
        <h1
          id="measurement-not-found-heading"
          className="text-2xl font-bold text-ink"
        >
          Measurement not found
        </h1>
        <p className="mt-2 text-muted">
          This measurement may have already been deleted.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() => navigate('/history')}
        >
          Back to history
        </Button>
      </section>
    )
  }

  return (
    <MeasurementFormFields
      key={measurementId ?? 'new'}
      measurementId={measurementId}
      existing={existing}
    />
  )
}

interface MeasurementFormFieldsProps {
  measurementId?: number
  existing?: Measurement
}

function MeasurementFormFields({
  measurementId,
  existing,
}: MeasurementFormFieldsProps) {
  const navigate = useNavigate()
  const add = useMeasurements((state) => state.add)
  const update = useMeasurements((state) => state.update)
  const remove = useMeasurements((state) => state.remove)

  const isEditMode = measurementId !== undefined

  const [values, setValues] = useState<MeasurementFormValues>(() =>
    valuesFromMeasurement(existing),
  )
  const [touched, setTouched] = useState<TouchedFields>({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const headingId = useId()

  const errors = validateMeasurementForm(values)

  function fieldError(field: keyof MeasurementFormValues): string | undefined {
    return touched[field] || submitted ? errors[field] : undefined
  }

  function handleChange(field: keyof MeasurementFormValues, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }))
  }

  function handleBlur(field: keyof MeasurementFormValues) {
    setTouched((previous) => ({ ...previous, [field]: true }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    setFormError(null)

    if (hasValidationErrors(errors)) return

    const payload: MeasurementInput = {
      systolic: Number(values.systolic),
      diastolic: Number(values.diastolic),
      pulse: Number(values.pulse),
      timestamp: fromDatetimeLocalValue(values.timestamp),
      note: values.note.trim() === '' ? undefined : values.note.trim(),
    }

    setIsSubmitting(true)
    try {
      if (isEditMode && measurementId !== undefined) {
        await update(measurementId, payload)
      } else {
        await add(payload)
      }

      const storeError = useMeasurements.getState().error
      if (storeError) {
        setFormError(storeError)
        return
      }

      navigate('/history')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (measurementId === undefined) return
    const confirmed = window.confirm(
      'Delete this measurement? This cannot be undone.',
    )
    if (!confirmed) return

    setIsSubmitting(true)
    try {
      await remove(measurementId)
      const storeError = useMeasurements.getState().error
      if (storeError) {
        setFormError(storeError)
        return
      }
      navigate('/history')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section aria-labelledby={headingId}>
      <h1 id={headingId} className="text-2xl font-bold text-ink">
        {isEditMode ? 'Edit measurement' : 'Add measurement'}
      </h1>

      <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-5">
        {formError && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {formError}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="systolic">Systolic (mmHg)</Label>
            <Input
              id="systolic"
              name="systolic"
              type="number"
              inputMode="numeric"
              min={SYSTOLIC_RANGE.min}
              max={SYSTOLIC_RANGE.max}
              className="mt-1"
              value={values.systolic}
              onChange={(event) => handleChange('systolic', event.target.value)}
              onBlur={() => handleBlur('systolic')}
              aria-invalid={Boolean(fieldError('systolic'))}
              aria-describedby={
                fieldError('systolic') ? 'systolic-error' : undefined
              }
              required
            />
            {fieldError('systolic') && (
              <p
                id="systolic-error"
                role="alert"
                className="mt-1 text-sm text-red-600"
              >
                {fieldError('systolic')}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
            <Input
              id="diastolic"
              name="diastolic"
              type="number"
              inputMode="numeric"
              min={DIASTOLIC_RANGE.min}
              max={DIASTOLIC_RANGE.max}
              className="mt-1"
              value={values.diastolic}
              onChange={(event) =>
                handleChange('diastolic', event.target.value)
              }
              onBlur={() => handleBlur('diastolic')}
              aria-invalid={Boolean(fieldError('diastolic'))}
              aria-describedby={
                fieldError('diastolic') ? 'diastolic-error' : undefined
              }
              required
            />
            {fieldError('diastolic') && (
              <p
                id="diastolic-error"
                role="alert"
                className="mt-1 text-sm text-red-600"
              >
                {fieldError('diastolic')}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="pulse">Pulse (bpm)</Label>
          <Input
            id="pulse"
            name="pulse"
            type="number"
            inputMode="numeric"
            min={PULSE_RANGE.min}
            max={PULSE_RANGE.max}
            className="mt-1"
            value={values.pulse}
            onChange={(event) => handleChange('pulse', event.target.value)}
            onBlur={() => handleBlur('pulse')}
            aria-invalid={Boolean(fieldError('pulse'))}
            aria-describedby={fieldError('pulse') ? 'pulse-error' : undefined}
            required
          />
          {fieldError('pulse') && (
            <p id="pulse-error" role="alert" className="mt-1 text-sm text-red-600">
              {fieldError('pulse')}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="timestamp">Date &amp; time</Label>
          <Input
            id="timestamp"
            name="timestamp"
            type="datetime-local"
            className="mt-1"
            value={values.timestamp}
            onChange={(event) => handleChange('timestamp', event.target.value)}
            onBlur={() => handleBlur('timestamp')}
            aria-invalid={Boolean(fieldError('timestamp'))}
            aria-describedby={
              fieldError('timestamp') ? 'timestamp-error' : undefined
            }
            required
          />
          {fieldError('timestamp') && (
            <p
              id="timestamp-error"
              role="alert"
              className="mt-1 text-sm text-red-600"
            >
              {fieldError('timestamp')}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="note">Note (optional)</Label>
          <textarea
            id="note"
            name="note"
            maxLength={NOTE_MAX_LENGTH}
            rows={3}
            className="mt-1 flex w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-base text-ink shadow-xs outline-none placeholder:text-muted focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 aria-invalid:border-red-500 md:text-sm"
            value={values.note}
            onChange={(event) => handleChange('note', event.target.value)}
            onBlur={() => handleBlur('note')}
            aria-invalid={Boolean(fieldError('note'))}
            aria-describedby={fieldError('note') ? 'note-error' : undefined}
          />
          {fieldError('note') && (
            <p id="note-error" role="alert" className="mt-1 text-sm text-red-600">
              {fieldError('note')}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Save measurement'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={() => navigate('/history')}
          >
            Cancel
          </Button>
          {isEditMode && (
            <Button
              type="button"
              variant="destructive"
              disabled={isSubmitting}
              className="ml-auto"
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
        </div>
      </form>
    </section>
  )
}

export default MeasurementForm
