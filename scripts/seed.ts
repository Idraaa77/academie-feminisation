import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE!  // needs service role for seeding
const client = createClient(url, key)

const plan = [
  { month:1, weeks: [
    ['Bases • semaine 1', 'Respiration, alignement, voix – masque'],
    ['Bases • semaine 2', 'Posture neutre, diction douce'],
    ['Bases • semaine 3', 'Marche mollets/hanches, mains'],
    ['Bases • semaine 4', 'Teint & sourcils simples; révision']
  ], exam: ['Examen M1 — Quiz de bases', [
    { q: 'La résonance se place surtout dans…', opts:['la gorge','le masque','le ventre'], a:1 },
    { q: 'Alignement recherché ?', opts:['dos très cambré','oreilles-épaules-bassin','épaules projetées'], a:1 }
  ] ]},
  // ... compléter mois 2 → 12 à l’itération suivante
];

async function run(){
  for (const m of plan){
    for (let i=0; i<m.weeks.length; i++){
      const [title, desc] = m.weeks[i]
      const { data: s, error } = await client
        .from('syllabus')
        .insert({ month: m.month, week: i+1, title, description: desc })
        .select()
        .single()
      if (error) { console.error(error); process.exit(1) }
      if (i===m.weeks.length-1 && m.exam){
        const [examTitle, questions] = m.exam as any
        await client.from('exams').insert({
          syllabus_id: s.id,
          title: examTitle,
          kind: 'quiz',
          questions: questions
        })
      }
    }
  }
  console.log('Seed ok')
}
run()
