/**
 * Field-level validation for the measurement form (spec §2, §5). Pure
 * functions, deliberately kept free of React/DOM so they can be exercised
 * in isolation.
 */

export const SYSTOLIC_RANGE = { min: 60, max: 250 } as const
export const DIASTOLIC_RANGE = { min: 40, max: 150 } as const
export const PULSE_RANGE = { min: 30, max: 200 } as const
export const NOTE_MAX_LENGTH = 500

/** Raw (string) values as held by the form's controlled inputs. */
export interface MeasurementFormValues {
  systolic: string
  diastolic: string
  pulse: string
  note: string
  /** `datetime-local` input value, e.g. "2026-10-17T08:30". */
  timestamp: string
}

export interface MeasurementFormErrors {
  systolic?: string
  diastolic?: string
  pulse?: string
  note?: string
  timestamp?: string
}

function validateRangeField(
  raw: string,
  label: string,
  range: { min: number; max: number },
): string | undefined {
  const trimmed = raw.trim()
  if (trimmed === '') return `${label} is required.`
  const value = Number(trimmed)
  if (!Number.isFinite(value)) return `${label} must be a number.`
  if (value < range.min || value > range.max) {
    return `${label} must be between ${range.min} and ${range.max}.`
  }
  return undefined
}

/** Validates every field of the measurement form, returning only the errors found. */
export function validateMeasurementForm(
  values: MeasurementFormValues,
): MeasurementFormErrors {
  const errors: MeasurementFormErrors = {}

  const systolicError = validateRangeField(
    values.systolic,
    'Systolic',
    SYSTOLIC_RANGE,
  )
  if (systolicError) errors.systolic = systolicError

  const diastolicError = validateRangeField(
    values.diastolic,
    'Diastolic',
    DIASTOLIC_RANGE,
  )
  if (diastolicError) errors.diastolic = diastolicError

  const pulseError = validateRangeField(values.pulse, 'Pulse', PULSE_RANGE)
  if (pulseError) errors.pulse = pulseError

  if (values.note.length > NOTE_MAX_LENGTH) {
    errors.note = `Note must be ${NOTE_MAX_LENGTH} characters or fewer.`
  }

  if (values.timestamp.trim() === '') {
    errors.timestamp = 'Date and time is required.'
  } else if (Number.isNaN(new Date(values.timestamp).getTime())) {
    errors.timestamp = 'Enter a valid date and time.'
  }

  return errors
}

/** True if any field in `errors` has a message. */
export function hasValidationErrors(errors: MeasurementFormErrors): boolean {
  return Object.values(errors).some((message) => message !== undefined)
}
