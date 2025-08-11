'use client'
import { Nav } from '../components/Nav'
import { useEffect, useMemo, useState } from 'react'

type Exo = {
  id: string
  name: string
  sets: string
  media: { src: string; alt: string }
  how: string
  tip: string
}

type DayPlan = {
  title: string
  focus: string
  exercises: Exo[]
}

const WEEK: Record<string, DayPlan> = {
  Lundi: {
    title: 'Fessiers & Hanches',
    focus: 'Galbe et arrondi visibles',
    exercises: [
      {
        id: 'hip-thrust',
        name: 'Hip Thrust (chaise + sac à dos)',
        sets: '4×12',
        media: {
          src: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=60',
          alt: 'Hip thrust maison'
        },
        how: 'Assieds-toi au sol, omoplates contre le bord d’une chaise. Pieds à plat, genoux fléchis. Pose un sac à dos chargé sur les hanches. Monte les hanches jusqu’à aligner genoux-bassin-épaules, squeeze fessiers 1s, redescends contrôlé.',
        tip: 'Accentue la contraction en haut et garde les genoux légèrement poussés vers l’extérieur.'
      },
      {
        id: 'step-up',
        name: 'Step-Up sur chaise',
        sets: '3×10/jambe',
        media: {
          src: 'https://images.unsplash.com/photo-1577221084712-45b0445d2b00?auto=format&fit=crop&w=800&q=60',
          alt: 'Step-up'
        },
        how: 'Monte sur la chaise avec un pied, pousse fort dans le talon pour tendre la jambe puis redescends en contrôle. Alterne ou fais toutes les reps d’un côté.',
        tip: 'Regarde loin devant, buste fièr·e : ça affine la ligne épaules-taille visuellement.'
      },
      {
        id: 'side-lying-abduction',
        name: 'Abduction latérale au sol',
        sets: '3×20/côté',
        media: {
          src: 'https://images.unsplash.com/photo-1594737625785-c6683fc6f529?auto=format&fit=crop&w=800&q=60',
          alt: 'Abduction hanche'
        },
        how: 'Allongé·e sur le côté, jambe du dessus tendue. Lève la jambe vers le plafond sans basculer le bassin. Redescends lentement.',
        tip: 'Pointe le pied légèrement vers le sol pour mieux cibler moyen fessier (arrondi hanche).'
      }
    ]
  },
  Mardi: {
    title: 'Posture & Bras fins',
    focus: 'Clavicules basses, nuque longue',
    exercises: [
      {
        id: 'row-bouteille',
        name: 'Row penché (bouteilles)',
        sets: '3×15',
        media: {
          src: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=800&q=60',
          alt: 'Row avec bouteilles'
        },
        how: 'Buste penché dos plat, une bouteille dans chaque main. Tire les coudes vers l’arrière, proche du corps, serre les omoplates, redescends contrôlé.',
        tip: 'Renforce le dos = épaules naturellement plus basses → silhouette plus élégante.'
      },
      {
        id: 'wall-angels',
        name: 'Wall Angels',
        sets: '3×12',
        media: {
          src: 'https://images.unsplash.com/photo-1596357395104-7b77f2d5eb89?auto=format&fit=crop&w=800&q=60',
          alt: 'Wall angels'
        },
        how: 'Dos au mur, lombaires légères au mur, bras en “cactus”. Fais glisser les bras vers le haut puis vers le bas sans décoller les avant-bras du mur.',
        tip: 'Active le haut du dos, ouvre la poitrine, corrige l’arrondi des épaules.'
      },
      {
        id: 'triceps-chair-dips',
        name: 'Dips triceps sur chaise',
        sets: '3×12',
        media: {
          src: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=60',
          alt: 'Dips sur chaise'
        },
        how: 'Mains sur le bord de la chaise, fesses proches du bord, fléchis les coudes en gardant l’ouverture des épaules, remonte en poussant.',
        tip: 'Triceps toniques = bras plus “nets” sans volume lourd.'
      }
    ]
  },
  Mercredi: {
    title: 'Cardio gracieux',
    focus: 'Déhanché fluide & endurance légère',
    exercises: [
      {
        id: 'marche-active',
        name: 'Marche active',
        sets: '20–30 min',
        media: {
          src: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=800&q=60',
          alt: 'Marche active'
        },
        how: 'Marche soutenue, bras souples, port de tête. Inspire par le nez, expire longuement.',
        tip: 'Travaille ta démarche talon-pointe et l’ondulation naturelle du bassin.'
      },
      {
        id: 'stretch-hanches',
        name: 'Stretch hanches/dos',
        sets: '10 min',
        media: {
          src: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=800&q=60',
          alt: 'Stretch hanches'
        },
        how: 'Fentes étirées, pigeon, ouverture thoracique. Respiration calme, 30–45s par posture.',
        tip: 'Mobilité = mouvements plus gracieux et lignes plus longues.'
      }
    ]
  },
  Jeudi: {
    title: 'Bas du corps – galbe',
    focus: 'Ischios + fessiers',
    exercises: [
      {
        id: 'bulgarian-split',
        name: 'Bulgarian split squat (chaise)',
        sets: '3×10/jambe',
        media: {
          src: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=60',
          alt: 'Split squat'
        },
        how: 'Un pied sur la chaise derrière, descends en fente jusqu’à cuisse parallèle, remonte en poussant dans le talon avant.',
        tip: 'Met l’accent sur fessiers/ischios = galbe bas du corps.'
      },
      {
        id: 'good-morning-sac',
        name: 'Good morning (sac sur épaules)',
        sets: '3×12',
        media: {
          src: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&w=800&q=60',
          alt: 'Good morning'
        },
        how: 'Pieds largeur hanches, genoux souples, penche le buste en gardant le dos plat, hanches en arrière, remonte en serrant fessiers.',
        tip: 'Dessine l’arrière des cuisses sans épaissir la taille.'
      },
      {
        id: 'glute-bridge',
        name: 'Glute bridge au sol',
        sets: '3×20',
        media: {
          src: 'https://images.unsplash.com/photo-1583454151140-ef8e1918b5b9?auto=format&fit=crop&w=800&q=60',
          alt: 'Glute bridge'
        },
        how: 'Allongé·e, pieds à plat proches des fesses, monte le bassin, contracte 1s, redescends en contrôle.',
        tip: 'Mets le poids dans les talons pour mieux cibler fessiers.'
      }
    ]
  },
  Vendredi: {
    title: 'Core & Taille',
    focus: 'Effet corset (taille plus fine)',
    exercises: [
      {
        id: 'plank',
        name: 'Planche',
        sets: '3×30–45s',
        media: {
          src: 'https://images.unsplash.com/photo-1546484959-fde6ee6cbe1d?auto=format&fit=crop&w=800&q=60',
          alt: 'Planche'
        },
        how: 'Coudes sous épaules, corps gainé, bassin neutre, nuque longue. Respire sans cambrer.',
        tip: 'Renforce le caisson abdominal sans épaissir la taille.'
      },
      {
        id: 'dead-bug',
        name: 'Dead bug',
        sets: '3×10/côté',
        media: {
          src: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=800&q=60',
          alt: 'Dead bug'
        },
        how: 'Allongé·e, bras vers le plafond, genoux au-dessus des hanches. Étends bras droit + jambe gauche, reviens, alterne.',
        tip: 'Contrôle le bas du dos au sol pour un vrai effet “corset”.'
      },
      {
        id: 'side-plank',
        name: 'Side plank',
        sets: '3×20–30s/côté',
        media: {
          src: 'https://images.unsplash.com/photo-1581905764498-f1b60bae941a?auto=format&fit=crop&w=800&q=60',
          alt: 'Side plank'
        },
        how: 'Appui sur l’avant-bras, corps en ligne. Hanches hautes, souffle régulier.',
        tip: 'Affine la ligne latérale de la taille.'
      }
    ]
  },
  Samedi: {
    title: 'Cardio & Grâce',
    focus: 'Endurance douce + élégance',
    exercises: [
      {
        id: 'knees-up',
        name: 'Montées de genoux doux',
        sets: '3×30s',
        media: {
          src: 'https://images.unsplash.com/photo-1532384816664-01b8b105e42b?auto=format&fit=crop&w=800&q=60',
          alt: 'Cardio léger'
        },
        how: 'Debout, monte les genoux à mi-hauteur en rythme, pieds légers, bras souples.',
        tip: 'Garde la nuque longue et les épaules basses pour une allure chic.'
      },
      {
        id: 'pas-chasses',
        name: 'Pas chassés',
        sets: '3×20m',
        media: {
          src: 'https://images.unsplash.com/photo-1543978990-a8223a8b9a5f?auto=format&fit=crop&w=800&q=60',
          alt: 'Pas chassés'
        },
        how: 'Latéral droite-gauche en glissant, genoux souples, pieds qui “caressent” le sol.',
        tip: 'Travaille la coordination et la grâce du bas du corps.'
      }
    ]
  },
  Dimanche: {
    title: 'Repos actif',
    focus: 'Récupération & mobilité',
    exercises: [
      {
        id: 'relax-stretch',
        name: 'Étirements doux',
        sets: '10–15 min',
        media: {
          src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=60',
          alt: 'Stretch relax'
        },
        how: 'Respiration lente, étirements globalement agréables, sans douleur.',
        tip: 'Un corps détendu paraît plus souple et élégant.'
      }
    ]
  }
}

export default function Page(){
  const days = useMemo(()=>Object.keys(WEEK) as (keyof typeof WEEK)[], [])
  const [day,setDay] = useState<keyof typeof WEEK>('Lundi')
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [viewer, setViewer] = useState<{src:string; alt:string} | null>(null)

  // Charger état
  useEffect(()=>{
    setDone(JSON.parse(localStorage.getItem('wk_done') || '{}'))
  },[])
  // Sauvegarder + XP
  function toggle(exoId:string){
    setDone(s=>{
      const next = { ...s, [exoId]: !s[exoId] }
      localStorage.setItem('wk_done', JSON.stringify(next))
      // +5 XP quand on coche (pas quand on décoche)
      if (!s[exoId]) {
        const xp = parseInt(localStorage.getItem('xp_demo')||'0',10)
        localStorage.setItem('xp_demo', String(xp + 5))
      }
      return next
    })
  }

  const plan = WEEK[day]

  return (
    <main className="container">
      <Nav /><div style={{height:12}}/>

      {/* Tabs jours */}
      <div style={{display:'flex', flexWrap:'wrap', gap:8, marginBottom:12}}>
        {days.map(d=>(
          <button key={d} className={`btn-outline`} disabled={day===d} onClick={()=>setDay(d)}>{d}</button>
        ))}
      </div>

      {/* Plan du jour */}
      <div className="card">
        <h2>{plan.title}</h2>
        <p className="muted">Objectif du jour : {plan.focus}</p>

        {plan.exercises.map(exo=>(
          <div key={exo.id} style={{borderTop:'1px solid #fde2e2', paddingTop:8, marginTop:8}}>
            <div style={{display:'grid', gridTemplateColumns:'120px 1fr', gap:12, alignItems:'center'}}>
              {/* Image cliquable */}
              <div style={{width:120, height:90, borderRadius:12, overflow:'hidden', border:'1px solid #fecdd3', cursor:'zoom-in'}}>
                <img
                  src={exo.media.src}
                  alt={exo.media.alt}
                  style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
                  onClick={()=>setViewer(exo.media)}
                />
              </div>

              <div>
                <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
                  <label style={{display:'flex', alignItems:'center', gap:8}}>
                    <input type="checkbox" checked={!!done[exo.id]} onChange={()=>toggle(exo.id)} />
                    <b>{exo.name}</b>
                  </label>
                  <span className="badge">{exo.sets}</span>
                </div>
                <div className="muted" style={{marginTop:4}}><b>Comment faire :</b> {exo.how}</div>
                <div className="muted" style={{marginTop:4}}><b>Astuce féminisation :</b> {exo.tip}</div>
              </div>
            </div>
          </div>
        ))}

        <p className="muted" style={{marginTop:8}}>Conseil : reste à 1–2 répétitions de l’échec, respire fluide, épaules basses ✨</p>
      </div>

      {/* Lightbox simple */}
      {viewer && (
        <div
          onClick={()=>setViewer(null)}
          style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,.5)',
            display:'grid', placeItems:'center', padding:16, zIndex:50, cursor:'zoom-out'
          }}
        >
          <div style={{maxWidth:'90vw', maxHeight:'85vh', borderRadius:16, overflow:'hidden', border:'4px solid #fecdd3', background:'#fff'}}>
            <img src={viewer.src} alt={viewer.alt} style={{display:'block', maxWidth:'90vw', maxHeight:'85vh', objectFit:'contain'}} />
          </div>
        </div>
      )}
    </main>
  )
}
