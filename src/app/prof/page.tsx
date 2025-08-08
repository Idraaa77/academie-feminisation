'use client'
import { Nav } from '../components/Nav'
import { useEffect, useState } from 'react'

export default function Page(){
  const [pw,setPw] = useState('')
  const [ok,setOk] = useState(false)

  useEffect(()=>{
    const session = sessionStorage.getItem('prof_ok')
    setOk(session==='1')
  },[])

  const submit = () => {
    const hardcoded = process.env.NEXT_PUBLIC_PROF_PASSWORD || 'amelia123'
    if (pw === hardcoded){ setOk(true); sessionStorage.setItem('prof_ok','1') }
    else alert('Mot de passe incorrect')
  }

  return (<main className="container">
    <Nav />
    <div style={{height: 12}}/>
    {!ok ? (
      <div className="card" style={{maxWidth:420}}>
        <h3>Accès Professeure</h3>
        <input className="input" type="password" placeholder="Mot de passe" value={pw} onChange={e=>setPw(e.target.value)} />
        <div style={{height:8}}/>
        <button className="btn" onClick={submit}>Entrer</button>
        <p className="muted">Indice: amelia123 (démo)</p>
      </div>
    ) : (
      <div className="card">
        <h3>Interface Prof — Mlle Amélia</h3>
        <p className="muted">Ici, vous verrez les preuves à noter, enverrez des messages, etc. (connexion à Supabase à venir)</p>
      </div>
    )}
  </main>)
}
