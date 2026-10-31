/**
 * Shared domain types for the Blood Pressure Monitor app.
 * See ai/instructions/bp-monitor-spec.md §5 for the data model reference.
 */

/** WHO blood pressure classification bands (spec §5.2). */
export type Category =
  | 'OPTIMAL'
  | 'NORMAL'
  | 'ELEVATED'
  | 'STAGE_1'
  | 'STAGE_2'
  | 'STAGE_3'

/** A single blood pressure measurement persisted in IndexedDB. */
export interface Measurement {
  /**
   * Auto-increment IndexedDB primary key. Always present once read back from
   * storage; omit it (see `NewMeasurement`) when creating a record, Dexie
   * assigns it on insert.
   */
  id: number
  /** Systolic pressure in mmHg, range 60–250. */
  systolic: number
  /** Diastolic pressure in mmHg, range 40–150. */
  diastolic: number
  /** Pulse in bpm, range 30–200. */
  pulse: number
  /** Auto-filled at entry, editable. */
  timestamp: Date
  /** Optional free-text note, max 500 chars. */
  note?: string
  /** Auto-derived WHO category based on systolic/diastolic. */
  category: Category
}

/** A new measurement before it has been saved and assigned an `id`. */
export type NewMeasurement = Omit<Measurement, 'id'>
