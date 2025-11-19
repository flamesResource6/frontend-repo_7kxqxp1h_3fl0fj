import React from 'react'
import BuilderUI from './components/BuilderUI'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_0%_0%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(800px_circle_at_100%_0%,rgba(16,185,129,0.1),transparent_40%)] pointer-events-none"/>
      <BuilderUI />
    </div>
  )
}

export default App
