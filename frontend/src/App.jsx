import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Holidays from './pages/Holidays'
import SalaryReports from './pages/SalaryReports'
import UploadAttendance from './pages/UploadAttendance'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/employees" element={<Layout><Employees /></Layout>} />
        <Route path="/holidays" element={<Layout><Holidays /></Layout>} />
        <Route path="/salary" element={<Layout><SalaryReports /></Layout>} />
        <Route path="/upload" element={<Layout><UploadAttendance /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
export default App
