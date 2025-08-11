'use client'
import { Nav } from '../components/Nav'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Cat =
  | 'haut' | 'bas' | 'chaussures' | 'accessoire'
  | 'sous-vetements' | 'collants' | 'robe'

type Item = {
  id: string
  image_url: string
  nom: string | null
  categorie: Cat | string
  created_at: string
}

type OutfitRow = {
  id: string
  created_at: string
  items: { cat: Cat; id: string; nom: string | null; image_url: string }[]
  note: string | null
}

const ALL_CATEGORIES = ['haut','bas','chaussures','accessoire','sous-vetements','collants','robe'] as const
const LABEL: Record<Cat,string> = {
  haut:'Haut', bas:'Bas', chaussures:'Chaussures', accessoire:'Accessoire',
  'sous-vetements':'Sous-vêtements', collants:'Collants', robe:'Robe'
}
const DISPLAY_ORDER: Cat[] = ['robe','haut','bas','collants','sous-vetements','chaussures','accessoire']

export default function Page(){
  // Formulaire
  const [file,setFile] = useState<File|null>(null)
  const [nom,setNom] = useState('')
  const [cat,setCat] = useState<Cat>('haut')

  // Données
  const [items,setItems] = useState<Item[]>([])
  const [filtre,setFiltre] = useState<'tous'|Cat>('tous')
  const [look,setLook] = useState<Partial<Record<Cat,Item>>|null>(null)
  const [outfits,setOutfits] = useState<OutfitRow[]>([])
  const [saving,setSaving] = useState(false)
  const [deletingId,setDeletingId] = useState<string|null>(null)

  async function load(){
    const { data, error } = await supabase.from('clothes').select('*').order('created_at',{ascending:false})
    if (error) { alert(error.message); return }
    setItems((data||[]) as Item[])
  }
  async function loadOutfits(){
    const { data, error } = await supabase.from('outfits').select('*').order('created_at',{ascending:false}).limit(5)
    if (error) return;
    setOutfits((data||[]) as OutfitRow[])
  }
  useEffect(()=>{ load(); loadOutfits() },[])

  // Upload + insert (nom de fichier nettoyé)
  async function addCloth(){
    if (!file) return alert('Choisis une image')
    if (!nom.trim()) return alert('Donne un nom à l’habit')

    const safeBase = file.name
      .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-zA-Z0-9.\-_]/g,'-').toLowerCase()
    const path = `${crypto.randomUUID()}-${safeBase}`

    const { data: up, error: errUp } = await supabase
      .storage.from('clothes')
      .upload(path, file, { contentType: file.type, upsert: false })
    if (errUp) return alert(errUp.message)

    const { error: errDb } = await supabase.from('clothes').insert({
      user_id: null, image_url: up.path, nom, categorie: cat
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

  const visible = useMemo(()=>{
    if (filtre==='tous') return items
    return items.filter(i=>i.categorie===filtre)
  },[items,filtre])

  // Tenue aléatoire (robe peut remplacer haut+bas)
  function tenueAleatoire(){
    const pick = (c:Cat)=>{
      const arr = items.filter(i=>i.categorie===c)
      if (!arr.length) return undefined
      return arr[Math.floor(Math.random()*arr.length)] as Item
    }

    const hasRobe = items.some(i=>i.categorie==='robe')
    const tenue: Partial<Record<Cat,Item>> = {}

    if (hasRobe && Math.random()<0.5){
      const r = pick('robe'); if (r) tenue['robe'] = r
    } else {
      const h = pick('haut'), b = pick('bas')
      if (h) tenue['haut']=h; if (b) tenue['bas']=b
    }
    const shoes = pick('chaussures'), acc = pick('accessoire')
    const underwear = pick('sous-vetements'), tights = pick('collants')
    if (shoes) tenue['chaussures']=shoes
    if (acc) tenue['accessoire']=acc
    if (underwear) tenue['sous-vetements']=underwear
    if (tights) tenue['collants']=tights

    if (!Object.keys(tenue).length) return alert('Ajoute des habits pour tirer une tenue 😊')
    setLook(tenue)
  }

  // Enregistrer la tenue actuelle
  async function saveOutfit(){
    if (!look) return
    setSaving(true)
    const payload = DISPLAY_ORDER
      .map(cat => {
        const it = look[cat]
        if (!it) return null
        return { cat, id: it.id, nom: it.nom || null, image_url: it.image_url }
      })
      .filter(Boolean) as OutfitRow['items']

    const { error } = await supabase.from('outfits').insert({
      user_id: null, items: payload, note: null
    })
    setSaving(false)
    if (error) return alert(error.message)
    alert('Tenue enregistrée ✨')
    loadOutfits()
  }

  // Supprimer un vêtement (DB + fichier Storage)
  async function removeItem(it: Item){
    if (!confirm(`Supprimer "${it.nom || it.categorie}" ?`)) return
    setDeletingId(it.id)
    // 1) supprimer le fichier (chemin = it.image_url)
    const { error: errStor } = await supabase.storage.from('clothes').remove([it.image_url])
    if (errStor) { setDeletingId(null); return alert(errStor.message) }
    // 2) supprimer la ligne en base
    const { error: errDb } = await supabase.from('clothes').delete().eq('id', it.id)
    setDeletingId(null)
    if (errDb) return alert(errDb.message)
    await load()
  }

  const isSaturday = new Date().getDay() === 6

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
            <input className="input" placeholder="ex. Robe satin, Top rose" value={nom} onChange={e=>setNom(e.target.value)} />
          </div>
          <div>
            <label className="muted">Catégorie</label>
            <select className="input" value={cat} onChange={e=>setCat(e.target.value as Cat)}>
              {ALL_CATEGORIES.map(c=><option key={c} value={c}>{LABEL[c]}</option>)}
            </select>
          </div>
          <div style={{display:'flex', alignItems:'end'}}>
            <button className="btn" onClick={addCloth}>Ajouter</button>
          </div>
        </div>
      </div>

      <div style={{height:12}}/>

      {/* Outils : filtre + tenue */}
      <div className="card" style={{display:'grid', gap:8}}>
        <div style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
          <b>Filtrer :</b>
          <button className="btn-outline" onClick={()=>setFiltre('tous')} disabled={filtre==='tous'}>Tous</button>
          {ALL_CATEGORIES.map(c=>(
            <button key={c} className="btn-outline" onClick={()=>setFiltre(c)} disabled={filtre===c}>
              {LABEL[c]}
            </button>
          ))}
        </div>

        <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
          <b>Tenue aléatoire :</b>
          <button className="btn" onClick={tenueAleatoire}>{isSaturday ? 'Tenue du samedi 🎉' : 'Générer une tenue'}</button>
          {look && <button className="btn-outline" onClick={saveOutfit} disabled={saving}>{saving? 'Enregistrement...' : 'Enregistrer cette tenue'}</button>}
          <span className="muted">Une <b>robe</b> peut remplacer <b>haut + bas</b>.</span>
        </div>

        {look && (
          <div className="card" style={{borderColor:'#fbcfe8'}}>
            <h3>Ta tenue ✨</h3>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12}}>
              {DISPLAY_ORDER.map(k=>{
                const it = look?.[k]
                return (
                  <div key={k} style={{textAlign:'center'}}>
                    <div className="muted" style={{marginBottom:6}}>{LABEL[k]}</div>
                    {it ? (
                      <>
                        <div style={{border:'1px solid #fecdd3', borderRadius:12, overflow:'hidden', aspectRatio:'1/1'}}>
                          <img src={publicUrl(it.image_url)} alt={it.nom||k} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                        </div>
                        <div style={{marginTop:6}}>{it.nom}</div>
                      </>
                    ) : <div className="muted">—</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{height:12}}/>

      {/* Historique des tenues (5 dernières) */}
      <div className="card">
        <h3>Historiques des tenues (5 dernières)</h3>
        {!outfits.length ? <p className="muted">Aucune tenue enregistrée pour l’instant.</p> : (
          <div style={{display:'grid', gap:8}}>
            {outfits.map(o=>(
              <div key={o.id} className="card" style={{padding:10, borderColor:'#fbcfe8'}}>
                <div className="muted">{new Date(o.created_at).toLocaleString()}</div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:8, marginTop:6}}>
                  {o.items.map((it,i)=>(
                    <div key={i} style={{textAlign:'center'}}>
                      <div className="muted" style={{fontSize:11}}>{LABEL[it.cat]}</div>
                      <div style={{border:'1px solid #fecdd3', borderRadius:12, overflow:'hidden', aspectRatio:'1/1'}}>
                        <img src={publicUrl(it.image_url)} alt={it.nom||it.cat} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                      </div>
                      <div style={{fontSize:12, marginTop:4}}>{it.nom || ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{height:12}}/>

      {/* Galerie avec bouton Supprimer */}
      <div className="card">
        <h3>Ma garde-robe</h3>
        {!visible.length ? (
          <p className="muted">Aucun habit ici pour l’instant. Ajoute-en au dessus 💗</p>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12}}>
            {visible.map(it=>(
              <div key={it.id} className="card" style={{padding:8}}>
                <div style={{border:'1px solid #fecdd3', borderRadius:12, overflow:'hidden', aspectRatio:'1/1'}}>
                  <img src={publicUrl(it.image_url)} alt={it.nom||String(it.categorie)} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                </div>
                <div style={{marginTop:6, fontWeight:600}}>{it.nom || '(sans nom)'}</div>
                <div className="muted">{LABEL[(it.categorie as Cat)] || (it.categorie as string)}</div>
                <div style={{marginTop:8}}>
                  <button className="btn-outline" onClick={()=>removeItem(it)} disabled={deletingId===it.id}>
                    {deletingId===it.id ? 'Suppression…' : 'Supprimer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
