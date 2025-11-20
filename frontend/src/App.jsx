import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Landing from './Content Page/Landing/Landing'
import Signin from './User Page/signin/Signin'
import Login from './User Page/Login/Login'
import AppointmentBooking from './Content Page/Appointments/Appointment Booking'
import PrivacyPolicy from './Content Page/PrivacyPolicy/PrivacyPolicy'
import TermsCondition from './Content Page/TermsCondition/TermsCondition'
import { AuthProvider } from './Context/AuthContext'
import Loader from './components/Loader/Loader'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000) // 3 seconds loading

    return () => clearTimeout(timer)
  }, [])

  return (
    <AuthProvider>
      <Loader isVisible={isLoading} onComplete={() => setIsLoading(false)} />
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/appointment" element={<AppointmentBooking />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-condition" element={<TermsCondition />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
