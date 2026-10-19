import { create } from 'zustand'
import {
  addMeasurement,
  deleteMeasurement,
  getAllMeasurements,
  updateMeasurement,
} from '../db/dexie'
import type { Measurement, NewMeasurement } from '../types'
import { bpClassification } from '../utils/bpClassification'

/** What a caller supplies when adding/editing a reading — `category` is derived, not entered. */
export type MeasurementInput = Omit<NewMeasurement, 'category'>

interface MeasurementsState {
  measurements: Measurement[]
  isLoading: boolean
  error: string | null
  /** (Re)loads all measurements from IndexedDB into state. */
  load: () => Promise<void>
  /** Classifies and persists a new measurement, then refreshes state. */
  add: (input: MeasurementInput) => Promise<void>
  /** Applies changes to an existing measurement (re-classifying if needed), then refreshes state. */
  update: (id: number, changes: Partial<MeasurementInput>) => Promise<void>
  /** Deletes a measurement, then refreshes state. */
  remove: (id: number) => Promise<void>
}

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

/**
 * Zustand store wrapping the Dexie persistence layer (src/db/dexie.ts) to
 * give components reactive access to measurement data without talking to
 * IndexedDB directly.
 */
export const useMeasurements = create<MeasurementsState>((set, get) => ({
  measurements: [],
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null })
    try {
      const measurements = await getAllMeasurements()
      set({ measurements, isLoading: false })
    } catch (error) {
      set({
        isLoading: false,
        error: toErrorMessage(error, 'Failed to load measurements.'),
      })
    }
  },

  add: async (input) => {
    try {
      const { category } = bpClassification(input.systolic, input.diastolic)
      await addMeasurement({ ...input, category })
      await get().load()
    } catch (error) {
      set({ error: toErrorMessage(error, 'Failed to save measurement.') })
    }
  },

  update: async (id, changes) => {
    try {
      const current = get().measurements.find((m) => m.id === id)
      const systolic = changes.systolic ?? current?.systolic
      const diastolic = changes.diastolic ?? current?.diastolic
      const category =
        systolic !== undefined && diastolic !== undefined
          ? bpClassification(systolic, diastolic).category
          : undefined

      await updateMeasurement(id, {
        ...changes,
        ...(category ? { category } : {}),
      })
      await get().load()
    } catch (error) {
      set({ error: toErrorMessage(error, 'Failed to update measurement.') })
    }
  },

  remove: async (id) => {
    try {
      await deleteMeasurement(id)
      await get().load()
    } catch (error) {
      set({ error: toErrorMessage(error, 'Failed to delete measurement.') })
    }
  },
}))
