'use client'
import { Nav } from '../components/Nav'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ProfCard } from '../components/ProfCard'

type Proof = {
  id: string
  file_url: string
  created_at: string
  note_prof: number | null
  comment_prof: string | null
  matiere: string | null
}

export default function Page(){
  const [pw,setPw] = useState('')
  const [ok,setOk] = useState(false)
  const [proofs,setProofs] = useState<Proof[]>([])
  const [notes, setNotes] = useState<Record<string,{ note?: number; com?: string }>>({})

  useEffect(()=>{ const s = sessionStorage.getItem('prof_ok'); setOk(s==='1') },[])

  const enter = () => {
    const hardcoded = (process.env.NEXT_PUBLIC_PROF_PASSWORD as string) || 'amelia123'
    if (pw===hardcoded){ setOk(true); sessionStorage.setItem('prof_ok','1') }
    else alert('Mot de passe incorrect')
  }

  async function load(){
    const { data, error } = await supabase
      .from('proofs')
      .select('*')
      .order('created_at', { ascending:false })
    if (error) { alert(error.message); return }
    setProofs((data || []) as Proof[])
  }

  useEffect(()=>{ if (ok) load() },[ok])

  function publicUrl(path:string){
    const { data } = supabase.storage.from('proofs').getPublicUrl(path)
    return data.publicUrl
  }

  async function grade(id:string){
    const entry = notes[id] as { note?: number; com?: string } | undefined
    if (!entry || typeof entry.note !== 'number') {
      alert('Entre une note numérique /20 (et optionnellement un commentaire)')
      return
    }
    const { error } = await supabase
      .from('proofs')
      .update({ note_prof: entry.note, comment_prof: entry.com ?? null })
      .eq('id', id)
    if (error) return alert(error.message)
    await load()
    alert('Note enregistrée')
  }

  if (!ok) return (
    <main className="container">
      <Nav /><div style={{ height:12 }} />
      <ProfCard subtitle="Accès réservé à la professeure" />
      <div style={{ height:12 }} />
      <div className="card" style={{maxWidth:420}}>
        <h3>Accès Professeure</h3>
        <input
          className="input"
          type="password"
          placeholder="Mot de passe"
          value={pw}
          onChange={e=>setPw(e.target.value)}
        />
        <div style={{height:8}}/>
        <button className="btn" onClick={enter}>Entrer</button>
        <p className="muted" style={{marginTop:8}}>Indice (démo) : amelia123</p>
      </div>
    </main>
  )

  return (
    <main className="container">
      <Nav /><div style={{ height:12 }} />
      <ProfCard subtitle="Espace privé de correction et de suivi" />
      <div style={{ height:12 }} />

      <div className="card">
        <h3>Preuves à corriger</h3>
        {!proofs.length && <p className="muted">Aucune preuve pour l’instant</p>}

        {proofs.map(p => (
          <div key={p.id} style={{borderTop:'1px solid #fde2e2', paddingTop:8, marginTop:8}}>
            <div className="muted">
              {new Date(p.created_at).toLocaleString()}
              {p.matiere ? ` • ${p.matiere}` : ''}
            </div>

            <div style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', marginTop:6}}>
              <a className="btn-outline" href={publicUrl(p.file_url)} target="_blank" rel="noreferrer">Voir</a>

              <input
                className="input"
                style={{width:90}}
                type="number"
                min={0}
                max={20}
                placeholder="/20"
                value={notes[p.id]?.note ?? (p.note_prof ?? '')}
                onChange={e=>setNotes(s=>({
                  ...s,
                  [p.id]: { ...(s[p.id]||{}), note: parseInt(e.target.value||'0',10) }
                }))}
              />

              <input
                className="input"
                style={{minWidth:220}}
                placeholder="Commentaire"
                value={notes[p.id]?.com ?? (p.comment_prof ?? '')}
                onChange={e=>setNotes(s=>({
                  ...s,
                  [p.id]: { ...(s[p.id]||{}), com: e.target.value }
                }))}
              />

              <button className="btn" onClick={()=>grade(p.id)}>Noter</button>
            </div>

            {typeof p.note_prof==='number' && (
              <div className="muted" style={{marginTop:4}}>
                Déjà noté: {p.note_prof}/20 {p.comment_prof ? `— ${p.comment_prof}` : ''}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
