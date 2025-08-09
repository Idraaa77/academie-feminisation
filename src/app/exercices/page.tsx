'use client'
import { Nav } from '../components/Nav'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const DAILY = [
  { id: 'voice-1', title: 'Voix: 10 min résonance', cat: 'Voix' },
  { id: 'posture-1', title: 'Posture: alignement (mur)', cat: 'Posture' },
  { id: 'walk-1', title: 'Marche: foulée mollets/hanches', cat: 'Mouvement' },
  { id: 'gesture-1', title: 'Gestuelle: douceur des mains', cat: 'Gestuelle' },
  { id: 'makeup-1', title: 'Make-up: 1 technique', cat: 'Esthétique' },
  { id: 'diction-1', title: 'Diction: lecture 5 min', cat: 'Voix' },
]

export default function Page(){
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [file,setFile] = useState<File|null>(null)

  useEffect(()=>{ setDone(JSON.parse(localStorage.getItem('ex_done')||'{}')) },[])
  useEffect(()=>{
    localStorage.setItem('ex_done', JSON.stringify(done))
    const count = Object.values(done).filter(Boolean).length
    localStorage.setItem('xp_demo', String(count*5))
  },[done])

  async function uploadProof(exId:string){
    if (!file) return alert('Choisis un fichier')
    const path = `${crypto.randomUUID()}-${file.name}`
    const { data, error } = await supabase.storage.from('proofs').upload(path, file)
    if (error) return alert(error.message)
    await supabase.from('proofs').insert({ user_id: null, exercise_id: null, file_url: data.path })
    alert('Preuve envoyée – Mlle Amélia pourra la noter')
    setFile(null)
  }

  return (
    <main className="container">
      <Nav />
      <div style={{ height: 12 }} />
      <div className="card">
        <h2>Exercices du jour</h2>
        {DAILY.map(ex => (
          <label key={ex.id} style={{display:'flex',gap:8, alignItems:'center', padding:'8px 0', borderBottom:'1px solid #fde2e2'}}>
            <input type="checkbox" checked={!!done[ex.id]} onChange={()=>setDone(s=>({...s,[ex.id]:!s[ex.id]}))}/>
            <div>
              <div><b>{ex.title}</b></div>
              <div className="muted">Catégorie: {ex.cat}</div>
            </div>
            <div style={{marginLeft:'auto', display:'flex', gap:8}}>
              <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
              <button className="btn" onClick={()=>uploadProof(ex.id)}>Envoyer preuve</button>
            </div>
          </label>
        ))}
        <p className="muted">+5 XP par exercice coché (démo)</p>
      </div>
    </main>
  )
}
