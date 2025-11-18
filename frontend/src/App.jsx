import { useState } from 'react'
import './App.css'
import Navbar from './Pages/Navbar'
import Footer from './Pages/Footer'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-8">
        <section id="home" className="text-center py-16 bg-gray-100">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Welcome to Roriri Software Solutions</h1>
          <p className="text-lg mb-8 text-gray-600">Book your appointments easily and efficiently.</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300">Book Appointment</button>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default App
