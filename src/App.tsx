import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Spreadsheet from './Component/Spreadsheet.tsx'

function App() {
  const [count, setCount] = useState(0)

  return (
   <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Spreadsheet Prototype</h1>
      <Spreadsheet />
    </div>
  )
}

export default App
