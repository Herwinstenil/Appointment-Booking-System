import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Landing from './Landing/Landing.jsx'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </>
  )
}

export default App
