import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Landing from './Pages/Landing/Landing'
import Signin from './User Page/signin/Signin'
import Login from './User Page/Login/Login'
import AppointmentBooking from './Pages/Landing/Appointments/AppointmentBooking'
import { AuthProvider } from './Context/AuthContext'

function App() {
  const [count, setCount] = useState(0)

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/appointment" element={<AppointmentBooking />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
