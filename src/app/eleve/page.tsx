'use client'
import { Nav } from '../components/Nav'

export default function Page(){
  return (<main className="container">
    <Nav />
    <div style={{ height: 12 }}/>
    <div className="card">
      <h2>Eleve</h2>
      <p className="muted">Contenu connecté à la base en cours de mise en place.</p>
    </div>
  </main>)
}
