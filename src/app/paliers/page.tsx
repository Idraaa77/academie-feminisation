'use client'
import { Nav } from '../components/Nav'
import { LEVELS } from '@/lib/levels'
import { ProfCard } from '../components/ProfCard'

export default function Page(){
  return (
    <main className="container">
      <Nav /><div style={{height:12}}/>
      <ProfCard size="lg" subtitle="Ton chemin : départ garçon → vibes Sabrina Carpenter ✨" />
      <div style={{height:12}}/>

      <div className="card">
        <h2>Paliers vers “Sabrina Carpenter”</h2>
        {LEVELS.map((lv,i)=>(
          <div key={lv.id} style={{borderTop:'1px solid #fde2e2', paddingTop:8, marginTop:8}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <span className="badge">Niveau {i}</span>
              <b>{lv.name}</b>
              <span className="muted">• seuil {lv.threshold} XP</span>
            </div>
            <div className="muted">{lv.motto}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
