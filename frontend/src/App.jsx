import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Landing from './Landing/Landing.jsx'
import Login from './User Page/Login.jsx'
import Signin from './User Page/Signin.jsx'
import AppointmentBooking from './Appointment/AppointmentBooking.jsx'
import AdminDashboard from './Dashboard/Admin/AdminDashboard.jsx'
import ClientDashboard from './Dashboard/Client/ClientDashboard.jsx'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/signin" element={<Signin />} />
        <Route path="/appointment" element={<AppointmentBooking />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/client" element={<ClientDashboard />} />
      </Routes>
    </>
  )
}

export default App
