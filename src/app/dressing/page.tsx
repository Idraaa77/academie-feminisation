'use client'
import { Nav } from '../components/Nav'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Item = {
  id: string
  image_url: string
  nom: string | null
  categorie: 'haut'|'bas'|'chaussures'|'accessoire'|string
  created_at: string
}

const CATEGORIES = ['haut','bas','chaussures','accessoire'] as const

export default function Page(){
  // Formulaire
  const [file,setFile] = useState<File|null>(null)
  const [nom,setNom] = useState('')
  const [cat,setCat] = useState<'haut'|'bas'|'chaussures'|'accessoire'>('haut')
  // Liste & filtre
  const [items,setItems] = useState<Item[]>([])
  const [filtre,setFiltre] = useState<'tous'|typeof CATEGORIES[number]>('tous')
  // Tenue aléatoire
  const [look,setLook] = useState<{haut?:Item; bas?:Item; chaussures?:Item; accessoire?:Item}|null>(null)

  async function load(){
    const { data, error } = await supabase.from('clothes').select('*').order('created_at',{ascending:false})
    if (error) { alert(error.message); return }
    setItems((data||[]) as Item[])
  }
  useEffect(()=>{ load() },[])

  // Upload + insert
  async function addCloth(){
    if (!file) return alert('Choisis une image')
    if (!nom.trim()) return alert('Donne un nom à l’habit')

    // 1) Upload image vers Storage 'clothes'
    const path = `${crypto.randomUUID()}-${file.name}`
    const { data: up, error: errUp } = await supabase.storage.from('clothes').upload(path, file)
    if (errUp) return alert(errUp.message)

    // 2) Enregistrer en base
    const { error: errDb } = await supabase.from('clothes').insert({
      user_id: null,
      image_url: up.path,
      nom,
      categorie: cat
    })
    if (errDb) return alert(errDb.message)

    setFile(null); setNom(''); setCat('haut')
    await load()
    alert('Habit ajouté 💖')
  }

  function publicUrl(path:string){
    const { data } = supabase.storage.from('clothes').getPublicUrl(path)
    return data.publicUrl
  }

  // Galerie filtrée
  const visible = useMemo(()=>{
    if (filtre==='tous') return items
    return items.filter(i=>i.categorie===filtre)
  },[items,filtre])

  // Tirage aléatoire (samedi… ou n’importe quand avec le bouton)
  function tenueAleatoire(){
    const pick = (c:'haut'|'bas'|'chaussures'|'accessoire')=>{
      const arr = items.filter(i=>i.categorie===c)
      if (!arr.length) return undefined
      return arr[Math.floor(Math.random()*arr.length)]
    }
    const tenue = {
      haut: pick('haut'),
      bas: pick('bas'),
      chaussures: pick('chaussures'),
      accessoire: pick('accessoire')
    }
    if (!tenue.haut && !tenue.bas && !tenue.chaussures && !tenue.accessoire){
      alert('Ajoute des habits pour tirer une tenue 😊')
      return
    }
    setLook(tenue)
  }

  // Petite aide "samedi"
  const isSaturday = new Date().getDay() === 6 // 6 = samedi

  return (
    <main className="container">
      <Nav /><div style={{height:12}}/>

      {/* Formulaire d’ajout */}
      <div className="card">
        <h2>Dressing — ajoute tes habits</h2>
        <div style={{display:'grid', gap:8, gridTemplateColumns:'1fr 1fr', maxWidth:700}}>
          <div>
            <label className="muted">Image</label>
            <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
          </div>
          <div>
            <label className="muted">Nom</label>
            <input className="input" placeholder="ex. Pull rose, Top satin" value={nom} onChange={e=>setNom(e.target.value)} />
          </div>
          <div>
            <label className="muted">Catégorie</label>
            <select className="input" value={cat} onChange={e=>setCat(e.target.value as any)}>
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{display:'flex', alignItems:'end'}}>
            <button className="btn" onClick={addCloth}>Ajouter</button>
          </div>
        </div>
      </div>

      <div style={{height:12}}/>

      {/* Outils : filtre + tenue du samedi */}
      <div className="card" style={{display:'grid', gap:8}}>
        <div style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
          <b>Filtrer :</b>
          <button className="btn-outline" onClick={()=>setFiltre('tous')} disabled={filtre==='tous'}>Tous</button>
          {CATEGORIES.map(c=>(
            <button key={c} className="btn-outline" onClick={()=>setFiltre(c)} disabled={filtre===c}>
              {c}
            </button>
          ))}
        </div>

        <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
          <b>Tenue aléatoire :</b>
          <button className="btn" onClick={tenueAleatoire}>{isSaturday ? 'Tenue du samedi 🎉' : 'Générer une tenue'}</button>
          <span className="muted">Prend 1 haut + 1 bas + chaussures + accessoire (si dispo).</span>
        </div>

        {look && (
          <div className="card" style={{borderColor:'#fbcfe8'}}>
            <h3>Ta tenue ✨</h3>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:12}}>
              {(['haut','bas','chaussures','accessoire'] as const).map(k=>{
                const it = (look as any)[k] as Item|undefined
                return (
                  <div key={k} style={{textAlign:'center'}}>
                    <div className="muted" style={{marginBottom:6}}>{k}</div>
                    {it ? (
                      <>
                        <div style={{border:'1px solid #fecdd3', borderRadius:12, overflow:'hidden', aspectRatio:'1/1'}}>
                          <img src={publicUrl(it.image_url)} alt={it.nom||k} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                        </div>
                        <div style={{marginTop:6}}>{it.nom}</div>
                      </>
                    ) : (
                      <div className="muted">—</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{height:12}}/>

      {/* Galerie */}
      <div className="card">
        <h3>Ma garde-robe</h3>
        {!visible.length ? (
          <p className="muted">Aucun habit ici pour l’instant. Ajoute-en au dessus 💗</p>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12}}>
            {visible.map(it=>(
              <div key={it.id} className="card" style={{padding:8}}>
                <div style={{border:'1px solid #fecdd3', borderRadius:12, overflow:'hidden', aspectRatio:'1/1'}}>
                  <img src={publicUrl(it.image_url)} alt={it.nom||it.categorie} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                </div>
                <div style={{marginTop:6, fontWeight:600}}>{it.nom || '(sans nom)'}</div>
                <div className="muted">{it.categorie}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
