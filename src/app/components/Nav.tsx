'use client'
import { usePathname, useRouter } from 'next/navigation'

const tabs = [
  ['/', 'Accueil'],
  ['/exercices', 'Exercices'],
  ['/syllabus', 'Syllabus'],
  ['/dressing', 'Dressing'],
  ['/workout', 'Workout'],
  ['/bulletins', 'Bulletins'],
  ['/prof', 'Professeure'],
  ['/eleve', 'Élève'],
  ['/paliers', 'Paliers'],
] as const

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  return (
    <div className="tabs" style={{gridTemplateColumns: 'repeat(9, minmax(0,1fr))'}}>
      {tabs.map(([href,label]) => (
        <button key={href} className={`tab ${pathname===href?'active':''}`} onClick={()=>router.push(href)}>{label}</button>
      ))}
    </div>
  )
}
