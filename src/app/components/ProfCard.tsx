'use client'
import Image from 'next/image'

export function ProfCard({
  title = "Mademoiselle Amélia",
  subtitle = "Ta prof personnelle ✨",
  small = false
}: { title?: string; subtitle?: string; small?: boolean }) {
  const size = small ? 48 : 72
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12,
      background:'#fff', border:'1px solid #fecdd3',
      borderRadius:16, padding:12
    }}>
      <div style={{
        width:size, height:size, borderRadius:'50%', overflow:'hidden',
        border:'2px solid #fb7185', flex:'0 0 auto'
      }}>
        <Image src="/amelia.jpg" alt="Mlle Amélia" width={size} height={size} />
      </div>
      <div>
        <div style={{fontWeight:700}}>{title}</div>
        <div className="muted">{subtitle}</div>
      </div>
    </div>
  )
}
