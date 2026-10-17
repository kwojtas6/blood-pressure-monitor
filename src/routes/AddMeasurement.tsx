import { useParams } from 'react-router'
import MeasurementForm from '../components/MeasurementForm'

/**
 * Route wrapper for `/add` (create) and `/add/:id` (edit). Parses the
 * optional `:id` param and hands it to `MeasurementForm`, which does the
 * actual add-vs-edit branching.
 */
function AddMeasurement() {
  const { id } = useParams<{ id?: string }>()
  const measurementId = id !== undefined ? Number(id) : undefined

  return (
    <MeasurementForm
      measurementId={
        measurementId !== undefined && Number.isFinite(measurementId)
          ? measurementId
          : undefined
      }
    />
  )
}

export default AddMeasurement
