'use client'
import { Nav } from '../components/Nav'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Row = { id:string; month:number; week:number; title:string; description:string }
type Exam = { id:string; syllabus_id:string; title:string; kind:string }

export default function Page(){
  const [mois,setMois] = useState<number>(1)
  const [rows,setRows] = useState<Row[]>([])
  const [exams,setExams] = useState<Record<string,Exam>>({})

  useEffect(()=>{ load() },[mois])

  async function load(){
    const { data } = await supabase.from('syllabus')
      .select('*').eq('month', mois).order('week', { ascending:true })
    setRows((data||[]) as Row[])
    if (data?.length){
      const ids = data.map(d=>d.id)
      const { data: ex } = await supabase.from('exams').select('*').in('syllabus_id', ids)
      const map: Record<string,Exam> = {}; (ex||[]).forEach((e:any)=>map[e.syllabus_id]=e)
      setExams(map)
    } else setExams({})
  }

  return (
    <main className="container">
      <Nav /><div style={{height:12}}/>
      <div className="card">
        <h2>Syllabus</h2>
        <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:8}}>
          {Array.from({length:12},(_,i)=>i+1).map(m=>(
            <button key={m} className={`btn-outline`} onClick={()=>setMois(m)} disabled={m===mois}>
              Mois {m}
            </button>
          ))}
        </div>
        {!rows.length ? <p className="muted">Aucune semaine pour ce mois.</p> : rows.map(w=>(
          <div key={w.id} style={{borderTop:'1px solid #fde2e2', paddingTop:8, marginTop:8}}>
            <b>Semaine {w.week} — {w.title}</b>
            <div className="muted">{w.description}</div>
            {exams[w.id] && (
              <div style={{marginTop:6}}>
                <span className="badge">Examen : {exams[w.id].title}</span>
              </div>
            )}
          </div>
        ))}
        <p className="muted" style={{marginTop:8}}>Les examens apparaissent à la dernière semaine du mois.</p>
      </div>
    </main>
  )
}
