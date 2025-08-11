'use client'
import { Nav } from '../components/Nav'
import { useState } from 'react'

const BLOCKS = [
  { name:'Posture & dos', items:[
    'Wall angels — 3×12',
    'Superman hold — 3×20s',
    'Row élastique — 3×15',
  ]},
  { name:'Hanches & jambes', items:[
    'Glute bridges — 3×15',
    'Side leg raises — 3×12 / côté',
    'Walking lunges — 2×20 pas',
  ]},
  { name:'Bras fins & poignets', items:[
    'Banded pull-aparts — 3×15',
    'Wrist circles — 2×30s',
    'Triceps kicks légers — 3×12',
  ]},
  { name:'Cardio léger & grâce', items:[
    'Marche active 20 min',
    'Montées de genoux doux — 3×30s',
    'Étirements fluides 5 min',
  ]},
]

export default function Page(){
  const [done, setDone] = useState<Record<string,boolean>>({})
  const toggle = (k:string)=> setDone(s=>({ ...s, [k]: !s[k] }))

  return (
    <main className="container">
      <Nav /><div style={{height:12}}/>
      <div className="card">
        <h2>Workout — silhouette féminine</h2>
        {BLOCKS.map((b,i)=>(
          <div key={i} style={{marginTop:12}}>
            <h3>{b.name}</h3>
            {b.items.map((ex,j)=>{
              const k = `${i}-${j}`
              return (
                <label key={k} style={{display:'flex',gap:8, padding:'6px 0', alignItems:'center'}}>
                  <input type="checkbox" checked={!!done[k]} onChange={()=>toggle(k)} />
                  <span>{ex}</span>
                </label>
              )
            })}
          </div>
        ))}
        <p className="muted">Astuce : respire fluide, épaules basses, mouvements gracieux ✨</p>
      </div>
    </main>
  )
}
