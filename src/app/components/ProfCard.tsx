'use client'
import Image from 'next/image'
import { useState } from 'react'
// Import statique depuis /public (chemin relatif depuis ce fichier)
import ameliaPic from '../../../public/amelia.jpg'

export function ProfCard({
  title = "Mademoiselle Amélia",
  subtitle = "Ta prof personnelle ✨",
  small = false
}: { title?: string; subtitle?: string; small?: boolean }) {
  const size = small ? 48 : 72
  const [broken, setBroken] = useState(false)

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12,
      background:'#fff', border:'1px solid #fecdd3',
      borderRadius:16, padding:12
    }}>
      <div style={{
        width:size, height:size, borderRadius:'50%', overflow:'hidden',
        border:'2px solid #fb7185', flex:'0 0 auto', display:'grid', placeItems:'center'
      }}>
        {!broken ? (
          <Image
            src={ameliaPic} alt="Mlle Amélia" width={size} height={size}
            onError={()=>setBroken(true)}
            priority
            style={{ objectFit:'cover', width:size, height:size }}
          />
        ) : (
          // Fallback si l'image casse
          <div style={{
            width:size, height:size, display:'grid', placeItems:'center',
            background:'#ffe4e6', color:'#db2777', fontWeight:700
          }}>
            A
          </div>
        )}
      </div>
      <div>
        <div style={{fontWeight:700}}>{title}</div>
        <div className="muted">{subtitle}</div>
      </div>
    </div>
  )
}
