'use client'
import { Nav } from '../components/Nav'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Cat =
  | 'haut'
  | 'bas'
  | 'chaussures'
  | 'accessoire'
  | 'sous-vetements'
  | 'collants'
  | 'robe'

type Item = {
  id: string
  image_url: string
  nom: string | null
  categorie: Cat | string
  created_at: string
}

const ALL_CATEGORIES = [
  'haut',
  'bas',
  'chaussures',
  'accessoire',
  'sous-vetements',
  'collants',
  'robe',
] as const

const LABEL: Record<Cat, string> = {
  haut: 'Haut',
  bas: 'Bas',
  chaussures: 'Chaussures',
  accessoire: 'Accessoire',
  'sous-vetements': 'Sous-vêtements',
  collants: 'Collants',
  robe: 'Robe',
}

export default function Page() {
  // Formulaire
  const [file, setFile] = useState<File | null>(null)
  const [nom, setNom] = useState('')
  const [cat, setCat] = useState<Cat>('haut')
  // Liste & filtre
  const [items, setItems] = useState<Item[]>([])
  const [filtre, setFiltre] = useState<'tous' | Cat>('tous')
  // Tenue aléatoire (on stocke par catégorie)
  const [look, setLook] = useState<Partial<Record<Cat, Item>> | null>(null)

  async function load() {
    const { data, error } = await supabase
      .from('clothes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      alert(error.message)
      return
    }
    setItems((data || []) as Item[])
  }
  useEffect(() => {
    load()
  }, [])

  // Upload + insert (avec nettoyage du nom de fichier)
  async function addCloth() {
    if (!file) return alert('Choisis une image')
    if (!nom.trim()) return alert('Donne un nom à l’habit')

    const safeBase = file.name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.\-_]/g, '-')
      .toLowerCase()

    const path = `${crypto.randomUUID()}-${safeBase}`
    const { data: up, error: errUp } = await supabase
      .storage
      .from('clothes')
      .upload(path, file, { contentType: file.type, upsert: false })
    if (errUp) return alert(errUp.message)

    const { error: errDb } = await supabase.from('clothes').insert({
      user_id: null,
      image_url: up.path,
      nom,
      categorie: cat,
    })
    if (errDb) return alert(errDb.message)

    setFile(null)
    setNom('')
    setCat('haut')
    await load()
    alert('Habit ajouté 💖')
  }

  function publicUrl(path: string) {
    const { data } = supabase.storage.from('clothes').getPublicUrl(path)
    return data.publicUrl
  }

  // Galerie filtrée
  const visible = useMemo(() => {
    if (filtre === 'tous') return items
    return items.filter((i) => i.categorie === filtre)
  }, [items, filtre])

  // Tirage aléatoire (robe remplace haut + bas)
  function tenueAleatoire() {
    const pick = (c: Cat) => {
      const arr = items.filter((i) => i.categorie === c)
      if (!arr.length) return undefined
      return arr[Math.floor(Math.random() * arr.length)] as Item
    }

    const hasRobe = items.some((i) => i.categorie === 'robe')
    const tenue: Partial<Record<Cat, Item>> = {}

    if (hasRobe) {
      // 50% de chances de prendre une robe (et donc pas de haut/bas)
      const takeRobe = Math.random() < 0.5
      if (takeRobe) {
        const r = pick('robe')
        if (r) tenue['robe'] = r
      } else {
        const h = pick('haut')
        const b = pick('bas')
        if (h) tenue['haut'] = h
        if (b) tenue['bas'] = b
      }
    } else {
      const h = pick('haut')
      const b = pick('bas')
      if (h) tenue['haut'] = h
      if (b) tenue['bas'] = b
    }

    // Les autres catégories sont indépendantes
    const shoes = pick('chaussures')
    const acc = pick('accessoire')
    const underwear = pick('sous-vetements')
    const tights = pick('collants')

    if (shoes) tenue['chaussures'] = shoes
    if (acc) tenue['accessoire'] = acc
    if (underwear) tenue['sous-vetements'] = underwear
    if (tights) tenue['collants'] = tights

    if (!Object.keys(tenue).length) {
      alert('Ajoute des habits pour tirer une tenue 😊')
      return
    }
    setLook(tenue)
  }

  const isSaturday = new Date().getDay() === 6 // 6 = samedi

  // Ordre d’affichage sympa pour la tenue
  const DISPLAY_ORDER: Cat[] = [
    'robe', // si robe, on l’affiche d’abord
    'haut',
    'bas',
    'collants',
    'sous-vetements',
    'chaussures',
    'accessoire',
  ]

  return (
    <main className="container">
      <Nav />
      <div style={{ height: 12 }} />

      {/* Formulaire d’ajout */}
      <div className="card">
        <h2>Dressing — ajoute tes habits</h2>
        <div
          style={{
            display: 'grid',
            gap: 8,
            gridTemplateColumns: '1fr 1fr',
            maxWidth: 700,
          }}
        >
          <div>
            <label className="muted">Image</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div>
            <label className="muted">Nom</label>
            <input
              className="input"
              placeholder="ex. Robe satin, Top rose"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          <div>
            <label className="muted">Catégorie</label>
            <select
              className="input"
              value={cat}
              onChange={(e) => setCat(e.target.value as Cat)}
            >
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {LABEL[c as Cat]}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button className="btn" onClick={addCloth}>
              Ajouter
            </button>
          </div>
        </div>
      </div>

      <div style={{ height: 12 }} />

      {/* Outils : filtre + tenue du samedi */}
      <div className="card" style={{ display: 'grid', gap: 8 }}>
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <b>Filtrer :</b>
          <button
            className="btn-outline"
            onClick={() => setFiltre('tous')}
            disabled={filtre === 'tous'}
          >
            Tous
          </button>
          {ALL_CATEGORIES.map((c) => (
            <button
              key={c}
              className="btn-outline"
              onClick={() => setFiltre(c)}
              disabled={filtre === c}
            >
              {LABEL[c as Cat]}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <b>Tenue aléatoire :</b>
          <button className="btn" onClick={tenueAleatoire}>
            {isSaturday ? 'Tenue du samedi 🎉' : 'Générer une tenue'}
          </button>
          <span className="muted">
            Une <b>robe</b> peut remplacer <b>haut + bas</b> automatiquement.
          </span>
        </div>

        {look && (
          <div className="card" style={{ borderColor: '#fbcfe8' }}>
            <h3>Ta tenue ✨</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
                gap: 12,
              }}
            >
              {DISPLAY_ORDER.map((k) => {
                const it = look?.[k]
                return (
                  <div key={k} style={{ textAlign: 'center' }}>
                    <div className="muted" style={{ marginBottom: 6 }}>
                      {LABEL[k]}
                    </div>
                    {it ? (
                      <>
                        <div
                          style={{
                            border: '1px solid #fecdd3',
                            borderRadius: 12,
                            overflow: 'hidden',
                            aspectRatio: '1/1',
                          }}
                        >
                          <img
                            src={publicUrl(it.image_url)}
                            alt={it.nom || k}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                        <div style={{ marginTop: 6 }}>{it.nom}</div>
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

      <div style={{ height: 12 }} />

      {/* Galerie */}
      <div className="card">
        <h3>Ma garde-robe</h3>
        {!visible.length ? (
          <p className="muted">
            Aucun habit ici pour l’instant. Ajoute-en au dessus 💗
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 12,
            }}
          >
            {visible.map((it) => (
              <div key={it.id} className="card" style={{ padding: 8 }}>
                <div
                  style={{
                    border: '1px solid #fecdd3',
                    borderRadius: 12,
                    overflow: 'hidden',
                    aspectRatio: '1/1',
                  }}
                >
                  <img
                    src={publicUrl(it.image_url)}
                    alt={it.nom || String(it.categorie)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ marginTop: 6, fontWeight: 600 }}>
                  {it.nom || '(sans nom)'}
                </div>
                <div className="muted">
                  {LABEL[(it.categorie as Cat)] || (it.categorie as string)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
