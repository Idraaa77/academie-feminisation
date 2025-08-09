'use client'
import { Nav } from '../components/Nav'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Proof = { id:string; created_at:string; note_prof:number|null; comment_prof:string|null }

export default function Page(){
  const [details,setDetails] = useState<{date:string; note:number; com?:string}[]>([])
  const [moyenne,setMoyenne] = useState<number|null>(null)
  const [loading,setLoading] = useState(false)
  const monthKey = new Date().toISOString().slice(0,7) // YYYY-MM

  async function generate(){
    setLoading(true)
    // 1) Récupère toutes les preuves notées ce mois-ci
    const { data: proofs, error } = await supabase
      .from('proofs')
      .select('*')
      .gte('created_at', `${monthKey}-01`)
      .lte('created_at', `${monthKey}-31`)
      .order('created_at', { ascending: true })
    if (error) { alert(error.message); setLoading(false); return }

    const notes = (proofs||[]).filter((p:Proof)=> typeof p.note_prof === 'number') as Proof[]
    if (!notes.length){
      setDetails([])
      setMoyenne(0)
      // enregistre 0 si aucune note (tu peux changer ce choix)
      await supabase.from('bulletins').upsert({ user_id: null, month: monthKey, moyenne: 0, details: [] })
      setLoading(false)
      return
    }

    const list = notes.map(p=>({ date: p.created_at.slice(0,10), note: p.note_prof as number, com: p.comment_prof || '' }))
    const moy = Math.round(list.reduce((a,b)=>a+b.note,0) / list.length)

    setDetails(list)
    setMoyenne(moy)

    // 2) Sauvegarde / met à jour le bulletin du mois
    const { error: upErr } = await supabase
      .from('bulletins')
      .upsert({ user_id: null, month: monthKey, moyenne: moy, details: list as any })
    if (upErr) alert(upErr.message)
    setLoading(false)
  }

  // Option : auto-charger un aperçu à l’ouverture (sans enregistrer)
  useEffect(()=>{ /* no-op for now */ },[])

  return (
    <main className="container">
      <Nav /><div style={{ height: 12 }} />
      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, flexWrap:'wrap'}}>
          <h2>Bulletin mensuel — {monthKey}</h2>
          <button className="btn" onClick={generate} disabled={loading}>{loading? 'Calcul...' : 'Générer'}</button>
        </div>
        {moyenne==null ? (
          <p className="muted">Clique sur “Générer” pour calculer la moyenne à partir des preuves notées par Mlle Amélia.</p>
        ) : (
          <>
            <h3>Moyenne: {moyenne}/20</h3>
            {details.length ? details.map((d,i)=>(
              <div key={i} className="muted">
                {d.date} — {d.note}/20 {d.com ? `• ${d.com}` : ''}
              </div>
            )) : <p className="muted">Aucune note ce mois-ci.</p>}
          </>
        )}
      </div>
    </main>
  )
}
