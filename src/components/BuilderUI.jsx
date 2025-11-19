import React, { useEffect, useMemo, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs'
import { Download, Play, Upload, Wand2, Rocket, Mic, Crown, RefreshCw } from 'lucide-react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function BuilderUI() {
  const [token, setToken] = useState('')
  const [me, setMe] = useState(null)
  const [prompt, setPrompt] = useState('Build a SaaS project management app with React frontend, Next.js routing, Python backend, PostgreSQL, authentication, admin dashboard, notifications, file uploads, and payment integration.')
  const [framework, setFramework] = useState('react')
  const [database, setDatabase] = useState('mongodb')
  const [template, setTemplate] = useState('saas')
  const [project, setProject] = useState(null)
  const [tab, setTab] = useState('builder')
  const [projects, setProjects] = useState([])
  const premium = me?.plan === 'premium' || me?.plan === 'admin'

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (t) setToken(t)
  }, [])

  useEffect(() => {
    if (!token) return
    fetch(`${BACKEND_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setMe).catch(() => {})
    fetch(`${BACKEND_URL}/projects`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setProjects(d.items || [])).catch(() => {})
  }, [token])

  const loginDemo = async (plan = 'free') => {
    // register anonymous user each time
    const email = `user_${Math.random().toString(36).slice(2)}@demo.local`
    await fetch(`${BACKEND_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Demo User', email, password: 'demo123', plan }) })
      .then(r => r.json())
    const form = new URLSearchParams({ username: email, password: 'demo123' })
    const tok = await fetch(`${BACKEND_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form })
      .then(r => r.json())
    localStorage.setItem('token', tok.access_token)
    setToken(tok.access_token)
  }

  const generate = async () => {
    if (!token) return alert('Login first')
    const payload = { prompt, framework, database, template }
    const p = await fetch(`${BACKEND_URL}/ai/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }).then(async r => {
      if (!r.ok) { const t = await r.text(); throw new Error(t) } return r.json() })
    setProject(p)
    setTab('preview')
    const list = await fetch(`${BACKEND_URL}/projects`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    setProjects(list.items || [])
  }

  const download = () => {
    if (!project) return
    window.open(`${BACKEND_URL}/projects/${project.id}/download?token=${token}`, '_blank')
  }

  const deploy = async () => {
    if (!project) return
    const r = await fetch(`${BACKEND_URL}/projects/${project.id}/deploy`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    if (r.ok) { const d = await r.json(); alert(`Deployed to: ${d.url}`) } else { const t = await r.text(); alert(t) }
  }

  const rebuild = async () => {
    if (!project) return
    const r = await fetch(`${BACKEND_URL}/projects/${project.id}/rebuild`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({}) })
    if (r.ok) { const d = await r.json(); alert(`Rebuilt to version ${d.version}`) }
  }

  const FeatureBadge = ({ children }) => (
    <span className={`ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${premium ? 'bg-yellow-500/20 text-yellow-200' : 'bg-blue-500/20 text-blue-200'}`}>{children}</span>
  )

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">AI Website Builder</h1>
          <div className="flex items-center gap-3">
            {me ? (
              <>
                <span className="text-sm text-slate-300">{me.email} <FeatureBadge>{me.plan}</FeatureBadge></span>
                <button className="px-3 py-2 bg-slate-700 rounded" onClick={() => { localStorage.removeItem('token'); setToken(''); setMe(null) }}>Logout</button>
              </>
            ) : (
              <>
                <button className="px-3 py-2 bg-slate-700 rounded" onClick={() => loginDemo('free')}>Login as Free</button>
                <button className="px-3 py-2 bg-yellow-600 rounded" onClick={() => loginDemo('premium')}><Crown className="inline w-4 h-4 mr-1"/>Login as Premium</button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex flex-col gap-4">
              <label className="text-sm text-slate-300">Describe your website</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} className="w-full bg-slate-900 border border-slate-700 rounded p-3" placeholder="Describe what to build..." />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-slate-300">Framework</label>
                  <select value={framework} onChange={e => setFramework(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2">
                    <option value="react">React</option>
                    <option value="next">Next.js</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-300">Database</label>
                  <select value={database} onChange={e => setDatabase(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2">
                    <option value="mongodb">MongoDB</option>
                    <option value="postgres">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="sqlite">SQLite</option>
                    <option value="firebase">Firebase</option>
                    <option value="supabase">Supabase</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-300">Template</label>
                  <select value={template} onChange={e => setTemplate(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2">
                    <option value="basic">Basic</option>
                    <option value="saas">SaaS</option>
                    <option value="ecommerce">E‑commerce</option>
                    <option value="dashboard">Dashboard</option>
                    <option value="blog">Blog</option>
                    <option value="portfolio">Portfolio</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button onClick={generate} className="px-4 py-2 bg-blue-600 rounded inline-flex items-center gap-2"><Wand2 className="w-4 h-4"/>Generate</button>
                <button onClick={rebuild} className="px-4 py-2 bg-slate-700 rounded inline-flex items-center gap-2"><RefreshCw className="w-4 h-4"/>Rebuild</button>
                <button onClick={download} className="px-4 py-2 bg-slate-700 rounded inline-flex items-center gap-2"><Download className="w-4 h-4"/>Download</button>
                <button onClick={deploy} className={`px-4 py-2 rounded inline-flex items-center gap-2 ${premium ? 'bg-green-600' : 'bg-slate-600 cursor-not-allowed'}`} disabled={!premium}><Rocket className="w-4 h-4"/>Deploy</button>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm text-slate-300 mb-2">Live Preview</div>
              <div className="bg-black rounded-lg border border-slate-700 p-4 overflow-auto min-h-[300px]">
                {!project ? (
                  <div className="text-slate-400">No project yet. Generate to see preview.</div>
                ) : (
                  <pre className="text-xs whitespace-pre-wrap">{project.files?.frontend?.map(f => `// ${f.path}\n` + f.content).join('\n\n')}</pre>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Projects</h3>
              <span className="text-xs text-slate-400">{projects.length} total</span>
            </div>
            <div className="space-y-3 max-h-[520px] overflow-auto pr-2">
              {projects.map(p => (
                <div key={p.id} className="p-3 rounded bg-slate-900 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm truncate max-w-[200px]" title={p.prompt}>{p.prompt}</div>
                    {p.premium && <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-200">Premium</span>}
                  </div>
                  <div className="text-xs text-slate-400">{p.framework} + {p.database}</div>
                  <div className="text-xs text-slate-500">v{p.version}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
