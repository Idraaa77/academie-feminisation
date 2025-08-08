'use client'
import { Nav } from '../components/Nav'
import { useEffect, useState } from 'react'

const DAILY = [
  { id: 'voice-1', title: 'Voix: 10 min résonance', cat: 'Voix' },
  { id: 'posture-1', title: "Posture: alignement (mur)", cat: 'Posture' },
  { id: 'walk-1', title: 'Marche: foulée mollets/hanches', cat: 'Mouvement' },
  { id: 'gesture-1', title: 'Gestuelle: douceur des mains', cat: 'Gestuelle' },
  { id: 'makeup-1', title: 'Make-up: 1 technique', cat: 'Esthétique' },
  { id: 'diction-1', title: 'Diction: lecture 5 min', cat: 'Voix' },
]

export default function Page(){
  const [done, setDone] = useState<Record<string, boolean>>({})
  useEffect(()=>{
    const ls = localStorage.getItem('ex_done')
    setDone(ls? JSON.parse(ls): {})
  },[])
  useEffect(()=>{
    localStorage.setItem('ex_done', JSON.stringify(done))
    const count = Object.values(done).filter(Boolean).length
    const deltaXP = count*5
    localStorage.setItem('xp_demo', String(deltaXP)) // very naive demo linkage
  },[done])

  return (<main className="container">
    <Nav />
    <div style={{height: 12}}/>
    <div className="card">
      <h2>Exercices du jour</h2>
      {DAILY.map(ex => (
        <label key={ex.id} style={{display:'flex',gap:8, alignItems:'center', padding:'8px 0', borderBottom:'1px solid #fde2e2'}}>
          <input type="checkbox" checked={!!done[ex.id]} onChange={()=>setDone(s=>({...s,[ex.id]:!s[ex.id]}))}/>
          <div>
            <div><b>{ex.title}</b></div>
            <div className="muted">Catégorie: {ex.cat}</div>
          </div>
        </label>
      ))}
      <p className="muted">+5 XP par exercice coché (démo locale)</p>
    </div>
  </main>)
}
