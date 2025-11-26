import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Landing from './Landing/Landing.jsx'
import Login from './User Page/Login.jsx'
import Signin from './User Page/Signin.jsx'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/signin" element={<Signin />} />
      </Routes>
    </>
  )
}

export default App
