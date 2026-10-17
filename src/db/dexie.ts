import Dexie, { type EntityTable } from 'dexie'
import type { Measurement, NewMeasurement } from '../types'

/**
 * Local-only IndexedDB wrapper (Dexie). All blood pressure data lives here —
 * no server, no sync. See ai/instructions/bp-monitor-spec.md §5.
 */
type MeasurementTable = EntityTable<Measurement, 'id'>

class BloodPressureDatabase extends Dexie {
  measurements!: MeasurementTable

  constructor() {
    super('BloodPressureMonitorDB')
    this.version(1).stores({
      // '++id' = auto-increment primary key, 'timestamp' = indexed for
      // chronological queries and date-range filtering.
      measurements: '++id, timestamp',
    })
  }
}

export const db = new BloodPressureDatabase()

/** Inserts a new measurement and returns its generated id. */
export async function addMeasurement(
  measurement: NewMeasurement,
): Promise<number> {
  return db.measurements.add(measurement)
}

/** Applies a partial update to an existing measurement. */
export async function updateMeasurement(
  id: number,
  changes: Partial<NewMeasurement>,
): Promise<void> {
  await db.measurements.update(id, changes)
}

/** Deletes a measurement by id. */
export async function deleteMeasurement(id: number): Promise<void> {
  await db.measurements.delete(id)
}

/** Returns all measurements, oldest first. */
export async function getAllMeasurements(): Promise<Measurement[]> {
  return db.measurements.orderBy('timestamp').toArray()
}
