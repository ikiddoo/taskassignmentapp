import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <h1>Vite + React</h1>
      
      <div className="mt-4">
        <h2>Count: {count}</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setCount(count + 1)}
        >
          Increment
        </button>
      </div>
  
    </>
  )
}

export default App
