'use client'
import { Nav } from '../components/Nav'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Row = {
  created_at: string
  matiere: string | null
  note_prof: number | null
  comment_prof: string | null
}

export default function Page(){
  const [loading,setLoading] = useState(false)
  const [rows,setRows] = useState<Row[]>([])
  const [parMatiere,setParMatiere] = useState<{ matiere:string; moyenne:number; count:number }[]>([])
  const [moyenne,setMoyenne] = useState<number|null>(null)
  const monthKey = new Date().toISOString().slice(0,7) // YYYY-MM

  async function generer(){
    setLoading(true)
    const { data, error } = await supabase
      .from('proofs')
      .select('*')
      .gte('created_at', `${monthKey}-01`)
      .lte('created_at', `${monthKey}-31`)
      .order('created_at', { ascending: true })

    if (error) { alert(error.message); setLoading(false); return }

    const notes = (data||[]).filter(r => typeof r.note_prof === 'number') as Row[]
    setRows(notes)

    // Moyenne par matière
    const groups: Record<string,{sum:number;count:number}> = {}
    for (const n of notes){
      const key = n.matiere || 'Général'
      if (!groups[key]) groups[key] = { sum:0, count:0 }
      groups[key].sum += (n.note_prof || 0)
      groups[key].count += 1
    }
    const pm = Object.entries(groups).map(([matiere, {sum,count}])=>({
      matiere, moyenne: Math.round(sum / count), count
    }))
    setParMatiere(pm)

    // Moyenne générale
    const moy = Math.round(pm.reduce((a,b)=>a + b.moyenne * b.count, 0) / (pm.reduce((a,b)=>a + b.count, 0) || 1))
    setMoyenne(moy)

    setLoading(false)
  }

  function imprimer(){
    window.print()
  }

  return (
    <main className="container">
      <Nav /><div style={{ height:12 }} />
      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, flexWrap:'wrap'}}>
          <h2>Bulletin — {monthKey}</h2>
          <div style={{display:'flex', gap:8}}>
            <button className="btn" onClick={generer} disabled={loading}>{loading? 'Calcul...' : 'Générer'}</button>
            <button className="btn-outline" onClick={imprimer}>Imprimer / PDF</button>
          </div>
        </div>

        {moyenne==null ? (
          <p className="muted">Clique sur “Générer” pour calculer la moyenne à partir des preuves notées.</p>
        ) : (
          <>
            <h3>Moyenne générale: {moyenne}/20</h3>

            <h4>Par matière</h4>
            {parMatiere.length ? (
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr>
                    <th style={{textAlign:'left', borderBottom:'1px solid #f3d1d8', padding:'6px'}}>Matière</th>
                    <th style={{textAlign:'left', borderBottom:'1px solid #f3d1d8', padding:'6px'}}>Notes</th>
                    <th style={{textAlign:'left', borderBottom:'1px solid #f3d1d8', padding:'6px'}}>Moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {parMatiere.map((m)=>(
                    <tr key={m.matiere}>
                      <td style={{borderBottom:'1px solid #f9e0e6', padding:'6px'}}>{m.matiere}</td>
                      <td style={{borderBottom:'1px solid #f9e0e6', padding:'6px'}}>{m.count}</td>
                      <td style={{borderBottom:'1px solid #f9e0e6', padding:'6px'}}>{m.moyenne}/20</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="muted">Aucune matière pour ce mois.</p>}

            <h4 style={{marginTop:12}}>Détails des notes</h4>
            {rows.length ? (
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr>
                    <th style={{textAlign:'left', borderBottom:'1px solid #f3d1d8', padding:'6px'}}>Date</th>
                    <th style={{textAlign:'left', borderBottom:'1px solid #f3d1d8', padding:'6px'}}>Matière</th>
                    <th style={{textAlign:'left', borderBottom:'1px solid #f3d1d8', padding:'6px'}}>Note</th>
                    <th style={{textAlign:'left', borderBottom:'1px solid #f3d1d8', padding:'6px'}}>Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r,i)=>(
                    <tr key={i}>
                      <td style={{borderBottom:'1px solid #f9e0e6', padding:'6px'}}>{r.created_at.slice(0,10)}</td>
                      <td style={{borderBottom:'1px solid #f9e0e6', padding:'6px'}}>{r.matiere || 'Général'}</td>
                      <td style={{borderBottom:'1px solid #f9e0e6', padding:'6px'}}>{r.note_prof}/20</td>
                      <td style={{borderBottom:'1px solid #f9e0e6', padding:'6px'}}>{r.comment_prof || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="muted">Aucune note listée.</p>}
          </>
        )}
      </div>
    </main>
  )
}
