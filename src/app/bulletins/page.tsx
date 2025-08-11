'use client'
import { Nav } from '../components/Nav'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

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

    // Groupes par matière
    const g: Record<string,{sum:number;count:number}> = {}
    for(const n of notes){
      const key = n.matiere || 'Général'
      if(!g[key]) g[key] = {sum:0,count:0}
      g[key].sum += n.note_prof || 0
      g[key].count++
    }
    const pm = Object.entries(g).map(([matiere, {sum,count}])=>({
      matiere, moyenne: Math.round(sum / count), count
    }))
    setParMatiere(pm)

    // Moyenne générale pondérée
    const totalCount = pm.reduce((a,b)=> a+b.count, 0) || 1
    const moy = Math.round(pm.reduce((a,b)=> a + b.moyenne*b.count, 0) / totalCount)
    setMoyenne(moy)
    setLoading(false)
  }

  return (
    <main className="container">
      <Nav /><div style={{ height:12 }} />
      <div className="card bulletin" id="bulletin">
        {/* Header girly avec photo d’Amélia */}
        <div className="bulletin-header">
          <div className="bulletin-photo">
            <Image src="/amelia.jpg" alt="Mlle Amélia" width={64} height={64} style={{objectFit:'cover', width:64, height:64}}/>
          </div>
          <div>
            <h2 className="bulletin-title">Bulletin — {monthKey}</h2>
            <div className="muted">Évaluations de Mademoiselle Amélia</div>
          </div>
          <div style={{marginLeft:'auto'}} className="no-print">
            <button className="btn" onClick={generer} disabled={loading}>{loading? 'Calcul...' : 'Générer'}</button>
            <button className="btn-outline" style={{marginLeft:8}} onClick={()=>window.print()}>Imprimer / PDF</button>
          </div>
        </div>

        {moyenne==null ? (
          <p className="muted">Clique sur “Générer” pour calculer la moyenne à partir des preuves notées ce mois-ci.</p>
        ) : (
          <>
            <h3 style={{margin:'8px 0'}}>Moyenne générale : {moyenne}/20</h3>

            <h4 style={{margin:'12px 0 6px'}}>Par matière</h4>
            {parMatiere.length ? (
              <table className="table">
                <thead><tr><th>Matière</th><th>Notes</th><th>Moyenne</th></tr></thead>
                <tbody>
                  {parMatiere.map((m)=>(
                    <tr key={m.matiere}>
                      <td>{m.matiere}</td>
                      <td>{m.count}</td>
                      <td>{m.moyenne}/20</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="muted">Aucune matière pour ce mois.</p>}

            <h4 style={{margin:'12px 0 6px'}}>Détails</h4>
            {rows.length ? (
              <table className="table">
                <thead><tr><th>Date</th><th>Matière</th><th>Note</th><th>Commentaire</th></tr></thead>
                <tbody>
                  {rows.map((r,i)=>(
                    <tr key={i}>
                      <td>{r.created_at.slice(0,10)}</td>
                      <td>{r.matiere || 'Général'}</td>
                      <td>{r.note_prof}/20</td>
                      <td>{r.comment_prof || ''}</td>
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
