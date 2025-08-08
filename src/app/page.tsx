'use client'
import { Nav } from './components/Nav'
import { useEffect, useMemo, useState } from 'react'
import { xpToLevel, LEVELS } from '@/lib/levels'

export default function Home() {
  const [xp, setXp] = useState(0)
  useEffect(()=>{
    // demo: XP from localStorage for now
    const ls = localStorage.getItem('xp_demo')
    setXp(ls? parseInt(ls,10) : 0)
  },[])
  const { level, next } = useMemo(()=>xpToLevel(xp), [xp])

  const percent = Math.min(100, next? Math.round((xp-LEVELS[level].threshold)/((next-LEVELS[level].threshold)||1)*100):100)

  return (
    <main className="container">
      <Nav />
      <div style={{height: 12}}/>
      <div className="card">
        <h1>Académie de Féminisation</h1>
        <p className="muted">École girly avec une touche <b>Sabrina Carpenter</b> : douceur, espièglerie et glow ✨</p>
        <div style={{height: 8}}/>
        <div className="badge">{LEVELS[level].name}</div>
        <p className="muted">{LEVELS[level].motto}</p>
        <div style={{height: 8}}/>
        <div style={{background:'#ffe4e6', border:'1px solid #fb7185', borderRadius:999, overflow:'hidden', height:12}}>
          <div style={{width:`${percent}%`, height:'100%', background:'#ec4899'}}/>
        </div>
        <p className="muted">XP: {xp} {next? `(prochain palier ${next})` : '(dernier palier atteint!)'}</p>
      </div>
    </main>
  )
}
