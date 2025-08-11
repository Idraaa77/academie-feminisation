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

export function Nav(){
  const pathname = usePathname(); const router = useRouter()
  return (
    <div className="tabs" role="tablist" aria-label="Navigation principale">
      {tabs.map(([href,label]) => (
        <button
          key={href}
          className={`tab ${pathname===href?'active':''}`}
          onClick={()=>router.push(href)}
          aria-current={pathname===href?'page':undefined}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
