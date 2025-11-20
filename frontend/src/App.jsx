import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import Landing from './Content Page/Landing/Landing'
import Signin from './User Page/signin/Signin'
import Login from './User Page/Login/Login'
import AppointmentBooking from './Content Page/Appointments/Appointment Booking'
import PrivacyPolicy from './Content Page/PrivacyPolicy/PrivacyPolicy'
import TermsCondition from './Content Page/TermsCondition/TermsCondition'
import { AuthProvider } from './Context/AuthContext'
import Loader from './components/Loader/Loader'

function AppContent() {
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    setIsLoading(true)
  }, [location.pathname])

  return (
    <>
      <Loader isVisible={isLoading} onComplete={() => setIsLoading(false)} duration={3000} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/appointment" element={<AppointmentBooking />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-condition" element={<TermsCondition />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
