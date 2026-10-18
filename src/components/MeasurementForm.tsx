import { useEffect, useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useMeasurements } from '../store/useMeasurements'
import type { Measurement } from '../types'
import type { MeasurementInput } from '../store/useMeasurements'
import {
  bpClassification,
  CATEGORY_BADGE_STYLES,
  CATEGORY_LABELS,
} from '../utils/bpClassification'
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
import { CheckCircleIcon } from './icons'
import PageHeader from './PageHeader'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface NumericFieldProps {
  id: 'systolic' | 'diastolic' | 'pulse'
  label: string
  unit: string
  range: { min: number; max: number }
  value: string
  error?: string
  onChange: (value: string) => void
  onBlur: () => void
}

/**
 * Large-value card treatment for a numeric reading field
 * (`ai/instructions/ui-mockup-reference.md` §3/§4, task 7 Decision 3): a
 * real `<input type="number">` with its existing label/validation wiring
 * untouched, just restyled (bigger value text, a unit suffix, a min/max
 * caption) — not a custom tap-to-edit widget. Factored out since the same
 * shape repeats for systolic/diastolic/pulse.
 */
function NumericField({
  id,
  label,
  unit,
  range,
  value,
  error,
  onChange,
  onBlur,
}: NumericFieldProps) {
  return (
    <div className="rounded-md bg-surface-inset p-3">
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1 flex items-baseline gap-2">
        <Input
          id={id}
          name={id}
          type="number"
          inputMode="numeric"
          min={range.min}
          max={range.max}
          className="h-auto w-full border-0 bg-transparent p-0 text-[22px] font-medium shadow-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          required
        />
        <span className="shrink-0 text-sm text-muted">{unit}</span>
      </div>
      <p className="mt-1 text-xs text-muted">
        Range: {range.min}–{range.max} {unit}
      </p>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

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

  // Live WHO-classification success banner (task 7 scope item 6): computed
  // straight from `bpClassification` — no duplicated classification logic —
  // once both pressure fields are filled in and currently valid.
  const hasValidPressureValues =
    values.systolic !== '' &&
    values.diastolic !== '' &&
    !errors.systolic &&
    !errors.diastolic
  const liveClassification = hasValidPressureValues
    ? bpClassification(Number(values.systolic), Number(values.diastolic))
    : null

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
      <PageHeader
        headingId={headingId}
        title={isEditMode ? 'Edit measurement' : 'Add measurement'}
        subtitle={
          isEditMode
            ? 'Update this reading'
            : 'Enter your systolic, diastolic, and pulse readings'
        }
      />

      <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-5">
        {formError && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {formError}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <NumericField
            id="systolic"
            label="Systolic"
            unit="mmHg"
            range={SYSTOLIC_RANGE}
            value={values.systolic}
            error={fieldError('systolic')}
            onChange={(value) => handleChange('systolic', value)}
            onBlur={() => handleBlur('systolic')}
          />
          <NumericField
            id="diastolic"
            label="Diastolic"
            unit="mmHg"
            range={DIASTOLIC_RANGE}
            value={values.diastolic}
            error={fieldError('diastolic')}
            onChange={(value) => handleChange('diastolic', value)}
            onBlur={() => handleBlur('diastolic')}
          />
        </div>

        <NumericField
          id="pulse"
          label="Pulse"
          unit="bpm"
          range={PULSE_RANGE}
          value={values.pulse}
          error={fieldError('pulse')}
          onChange={(value) => handleChange('pulse', value)}
          onBlur={() => handleBlur('pulse')}
        />

        {liveClassification && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
            style={{
              backgroundColor: CATEGORY_BADGE_STYLES[liveClassification.category].bg,
              color: CATEGORY_BADGE_STYLES[liveClassification.category].text,
            }}
          >
            <CheckCircleIcon className="h-4 w-4 shrink-0" />
            <span>
              Blood pressure: {CATEGORY_LABELS[liveClassification.category]} (
              {values.systolic}/{values.diastolic})
            </span>
          </div>
        )}

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
