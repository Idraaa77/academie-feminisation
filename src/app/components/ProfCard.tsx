'use client'
import Image from 'next/image'

type Size = 'sm'|'md'|'lg'

export function ProfCard({
  title = "Mademoiselle Amélia",
  subtitle = "Ta prof personnelle ✨",
  size = 'lg',
}: { title?: string; subtitle?: string; size?: Size }) {
  const px = size==='lg' ? 120 : size==='md' ? 72 : 48
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:16,
      background:'#fff', border:'1px solid #fecdd3',
      borderRadius:20, padding:16, boxShadow: '0 10px 20px rgba(236,72,153,.10)'
    }}>
      <div style={{
        width:px, height:px, borderRadius:'50%', overflow:'hidden',
        border:'3px solid #fb7185', flex:'0 0 auto'
      }}>
        <Image src="/amelia.jpg" alt="Mlle Amélia" width={px} height={px}
               priority style={{objectFit:'cover', width:px, height:px}}/>
      </div>
      <div>
        <div style={{fontWeight:800, fontSize: size==='lg'? 22 : 18}}>Mademoiselle Amélia</div>
        <div className="muted" style={{fontSize: size==='lg'? 14 : 12}}>{subtitle}</div>
      </div>
    </div>
  )
}
