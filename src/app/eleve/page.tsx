'use client'
import { Nav } from '../components/Nav'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Msg = { id:string; body:string; created_at:string; from_user:string|null; to_user:string|null }

export default function Page(){
  const [msgs,setMsgs] = useState<Msg[]>([])
  const [body,setBody] = useState('')

  async function load(){
    const { data } = await supabase.from('messages').select('*').order('created_at',{ascending:false})
    setMsgs((data||[]) as Msg[])
  }
  useEffect(()=>{ load() },[])

  async function send(){
    if (!body.trim()) return
    const { error } = await supabase.from('messages').insert({ from_user: null, to_user: null, body })
    if (error) return alert(error.message)
    setBody(''); await load()
  }

  return (
    <main className="container">
      <Nav /><div style={{height:12}}/>
      <div className="card">
        <h2>Messages — Élève</h2>
        <div style={{display:'grid', gap:8}}>
          <div style={{display:'flex', gap:8}}>
            <input className="input" placeholder="Écrire à Mlle Amélia…" value={body} onChange={e=>setBody(e.target.value)} />
            <button className="btn" onClick={send}>Envoyer</button>
          </div>
          {!msgs.length ? <p className="muted">Aucun message.</p> :
            msgs.map(m=>(
              <div key={m.id} className="card" style={{padding:'10px', borderColor:'#fbcfe8'}}>
                <div className="muted">{new Date(m.created_at).toLocaleString()}</div>
                <div>{m.body}</div>
              </div>
            ))
          }
        </div>
      </div>
    </main>
  )
}
