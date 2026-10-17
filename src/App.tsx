import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout'

// Route-level code splitting (task 6 scope item 6): each route becomes its
// own lazily-fetched chunk instead of all five being bundled into the
// initial download. `/export` benefits the most — it's the only route that
// touches `pdfExport.ts` — but splitting all five keeps the first paint on
// any given route proportional to what that route actually needs.
const Dashboard = lazy(() => import('./routes/Dashboard'))
const AddMeasurement = lazy(() => import('./routes/AddMeasurement'))
const History = lazy(() => import('./routes/History'))
const Chart = lazy(() => import('./routes/Chart'))
const Export = lazy(() => import('./routes/Export'))

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path="/"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/add"
          element={
            <Suspense fallback={<RouteFallback />}>
              <AddMeasurement />
            </Suspense>
          }
        />
        <Route
          path="/add/:id"
          element={
            <Suspense fallback={<RouteFallback />}>
              <AddMeasurement />
            </Suspense>
          }
        />
        <Route
          path="/history"
          element={
            <Suspense fallback={<RouteFallback />}>
              <History />
            </Suspense>
          }
        />
        <Route
          path="/chart"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Chart />
            </Suspense>
          }
        />
        <Route
          path="/export"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Export />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}

/** Shown only for the instant a route chunk is being fetched (typically
 * imperceptible on repeat visits, once Workbox has it precached). */
function RouteFallback() {
  return (
    <p className="text-muted" role="status">
      Loading…
    </p>
  )
}

export default App
