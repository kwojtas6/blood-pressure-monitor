import { Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout'
import AddMeasurement from './routes/AddMeasurement'
import Chart from './routes/Chart'
import Dashboard from './routes/Dashboard'
import Export from './routes/Export'
import History from './routes/History'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<AddMeasurement />} />
        <Route path="/add/:id" element={<AddMeasurement />} />
        <Route path="/history" element={<History />} />
        <Route path="/chart" element={<Chart />} />
        <Route path="/export" element={<Export />} />
      </Route>
    </Routes>
  )
}

export default App
