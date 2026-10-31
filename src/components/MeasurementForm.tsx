import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useMeasurements } from '../store/useMeasurements'
import type { Category, Measurement } from '../types'
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
import { AlertCircleIcon, CheckCircleIcon, ChevronLeftIcon, MinusIcon, PlusIcon } from './icons'
import PageHeader, { HeaderButton } from './PageHeader'
import { Button } from './ui/button'
import { Label } from './ui/label'

/** Small uppercase field label used throughout the form (layouts v2). */
const FIELD_LABEL_CLASSES = 'text-[11px] font-medium tracking-wide text-muted uppercase'

/** Shared look of the form's inset input rows. */
const INSET_ROW_CLASSES =
  'rounded-md border border-border-strong/60 bg-surface-inset focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/40'

interface StepperFieldProps {
  id: 'systolic' | 'diastolic' | 'pulse'
  label: string
  unit: string
  range: { min: number; max: number }
  /** Value the first −/+ press fills in when the field is still empty. */
  startValue: number
  value: string
  error?: string
  onChange: (value: string) => void
  onBlur: () => void
}

/**
 * −/+ stepper around a real `<input type="number">` (layouts v2
 * `02-formularz.html`). The input keeps its label/validation wiring and can
 * still be typed into; the buttons step by 1 within the allowed range, and
 * the first press on an empty field fills in a typical value instead.
 */
function StepperField({
  id,
  label,
  unit,
  range,
  startValue,
  value,
  error,
  onChange,
  onBlur,
}: StepperFieldProps) {
  const current = value.trim() === '' ? Number.NaN : Number(value)

  function step(delta: number) {
    const next = Number.isFinite(current)
      ? Math.min(range.max, Math.max(range.min, Math.round(current) + delta))
      : startValue
    onChange(String(next))
    onBlur()
  }

  const buttonClasses =
    'flex h-full w-[52px] shrink-0 items-center justify-center bg-surface text-accent transition-colors hover:bg-accent-soft focus-visible:bg-accent-soft focus-visible:outline-none disabled:opacity-40'

  return (
    <div>
      <Label htmlFor={id} className={FIELD_LABEL_CLASSES}>
        {label} <span className="sr-only">({unit})</span>
      </Label>
      <div className={`mt-2 flex h-[52px] items-stretch overflow-hidden ${INSET_ROW_CLASSES}`}>
        <button
          type="button"
          className={`${buttonClasses} border-r border-border`}
          aria-label={`Decrease ${label.toLowerCase()}`}
          disabled={Number.isFinite(current) && current <= range.min}
          onClick={() => step(-1)}
        >
          <MinusIcon className="h-5 w-5" />
        </button>
        <input
          id={id}
          name={id}
          type="number"
          inputMode="numeric"
          min={range.min}
          max={range.max}
          placeholder="–"
          className="w-full min-w-0 bg-transparent text-center text-[26px] font-medium text-accent outline-none placeholder:text-muted [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
          required
        />
        <button
          type="button"
          className={`${buttonClasses} border-l border-border`}
          aria-label={`Increase ${label.toLowerCase()}`}
          disabled={Number.isFinite(current) && current >= range.max}
          onClick={() => step(1)}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
      <p id={`${id}-hint`} className="mt-1 flex justify-between text-[11px] text-muted">
        <span>min {range.min} {unit}</span>
        <span>max {range.max} {unit}</span>
      </p>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

/** White card wrapper for a group of form fields. */
function FormCard({ children }: { children: ReactNode }) {
  return <div className="space-y-4 rounded-lg border border-border bg-surface p-3.5">{children}</div>
}

const NORMAL_RANGE: ReadonlySet<Category> = new Set(['OPTIMAL', 'NORMAL'])

function classificationMessage(category: Category, systolic: string, diastolic: string): string {
  const reading = `${systolic}/${diastolic} mmHg`
  if (NORMAL_RANGE.has(category)) return `${reading} is within the WHO normal range`
  if (category === 'ELEVATED') return `${reading} is above the WHO normal range`
  return `${reading} is in the WHO hypertension range`
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
        <PageHeader
          headingId="measurement-not-found-heading"
          title="Measurement not found"
          subtitle="This measurement may have already been deleted."
        />
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
  const location = useLocation()
  const timestampRef = useRef<HTMLInputElement>(null)
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

  /** Header "‹ Back": previous in-app screen, or the dashboard on a direct load. */
  function goBack() {
    if (location.key === 'default') navigate('/')
    else navigate(-1)
  }

  function cancel() {
    navigate('/history')
  }

  /** "Change" next to the date: open the native picker where supported, else focus the input. */
  function openDatePicker() {
    const input = timestampRef.current
    if (!input) return
    input.focus()
    try {
      input.showPicker?.()
    } catch {
      // showPicker can throw (e.g. not allowed in this context); focus is enough.
    }
  }

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

  const liveBadge = liveClassification ? CATEGORY_BADGE_STYLES[liveClassification.category] : null
  const LiveIcon =
    liveClassification && NORMAL_RANGE.has(liveClassification.category) ? CheckCircleIcon : AlertCircleIcon

  return (
    <section aria-labelledby={headingId}>
      <PageHeader
        headingId={headingId}
        title={isEditMode ? 'Edit measurement' : 'New measurement'}
        subtitle={isEditMode ? 'Update this blood pressure reading' : 'Enter your blood pressure reading'}
        leading={
          <HeaderButton onClick={goBack} disabled={isSubmitting}>
            <ChevronLeftIcon className="-ml-1 h-4 w-4" /> Back
          </HeaderButton>
        }
        trailing={
          <HeaderButton onClick={cancel} disabled={isSubmitting}>
            Cancel
          </HeaderButton>
        }
      />

      <form noValidate onSubmit={handleSubmit} className="mt-3 space-y-3">
        {formError && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        )}

        <FormCard>
          <StepperField
            id="systolic"
            label="Systolic pressure"
            unit="mmHg"
            range={SYSTOLIC_RANGE}
            startValue={120}
            value={values.systolic}
            error={fieldError('systolic')}
            onChange={(value) => handleChange('systolic', value)}
            onBlur={() => handleBlur('systolic')}
          />
          <StepperField
            id="diastolic"
            label="Diastolic pressure"
            unit="mmHg"
            range={DIASTOLIC_RANGE}
            startValue={80}
            value={values.diastolic}
            error={fieldError('diastolic')}
            onChange={(value) => handleChange('diastolic', value)}
            onBlur={() => handleBlur('diastolic')}
          />
          <StepperField
            id="pulse"
            label="Pulse"
            unit="bpm"
            range={PULSE_RANGE}
            startValue={70}
            value={values.pulse}
            error={fieldError('pulse')}
            onChange={(value) => handleChange('pulse', value)}
            onBlur={() => handleBlur('pulse')}
          />
        </FormCard>

        <FormCard>
          <div>
            <Label htmlFor="timestamp" className={FIELD_LABEL_CLASSES}>
              Date &amp; time
            </Label>
            <div className={`mt-2 flex h-11 items-center gap-2 px-3.5 ${INSET_ROW_CLASSES}`}>
              <input
                ref={timestampRef}
                id="timestamp"
                name="timestamp"
                type="datetime-local"
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none [&::-webkit-calendar-picker-indicator]:hidden"
                value={values.timestamp}
                onChange={(event) => handleChange('timestamp', event.target.value)}
                onBlur={() => handleBlur('timestamp')}
                aria-invalid={Boolean(fieldError('timestamp'))}
                aria-describedby={fieldError('timestamp') ? 'timestamp-error' : undefined}
                required
              />
              <button
                type="button"
                onClick={openDatePicker}
                className="shrink-0 rounded-sm text-xs font-medium text-accent hover:underline focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                Change<span className="sr-only"> date and time</span>
              </button>
            </div>
            {fieldError('timestamp') && (
              <p id="timestamp-error" role="alert" className="mt-1 text-sm text-red-700">
                {fieldError('timestamp')}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="note" className={FIELD_LABEL_CLASSES}>
              Note (optional)
            </Label>
            <textarea
              id="note"
              name="note"
              maxLength={NOTE_MAX_LENGTH}
              rows={3}
              placeholder="e.g. after exercise, in the morning before breakfast…"
              className={`mt-2 block min-h-[72px] w-full px-3.5 py-3 text-sm text-ink outline-none placeholder:text-muted ${INSET_ROW_CLASSES}`}
              value={values.note}
              onChange={(event) => handleChange('note', event.target.value)}
              onBlur={() => handleBlur('note')}
              aria-invalid={Boolean(fieldError('note'))}
              aria-describedby={fieldError('note') ? 'note-error' : undefined}
            />
            {fieldError('note') && (
              <p id="note-error" role="alert" className="mt-1 text-sm text-red-700">
                {fieldError('note')}
              </p>
            )}
          </div>
        </FormCard>

        {/* Live WHO classification (computed by `bpClassification`, no duplicated logic). */}
        <div role="status" aria-live="polite">
          {liveClassification && liveBadge && (
            <div
              className="flex items-center gap-2.5 rounded-md border px-3.5 py-2.5"
              style={{
                backgroundColor: liveBadge.bg,
                color: liveBadge.text,
                borderColor: `color-mix(in srgb, ${liveBadge.text} 35%, transparent)`,
              }}
            >
              <span
                aria-hidden
                className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: liveBadge.text }}
              >
                <LiveIcon className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-[13px] font-medium">
                  Blood pressure: {CATEGORY_LABELS[liveClassification.category]}
                </p>
                <p className="text-[11px]">
                  {classificationMessage(liveClassification.category, values.systolic, values.diastolic)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2.5 pt-1">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Save measurement'}
          </Button>
          <Button type="button" variant="outline" size="lg" disabled={isSubmitting} onClick={cancel}>
            Cancel
          </Button>
          {isEditMode && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="text-red-700 hover:bg-red-50"
              disabled={isSubmitting}
              onClick={handleDelete}
            >
              Delete measurement
            </Button>
          )}
        </div>
      </form>
    </section>
  )
}

export default MeasurementForm
