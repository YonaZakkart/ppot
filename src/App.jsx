import './App.css'
import titulo from './assets/titulo.webp'

export default function App() {
  return (
    <main className="app">
      <header className="cabecera">
        <img className="cabecera__titulo" src={titulo} alt="Piedra, Papel o Tijera" />
        <p className="cabecera__lema">
          <span className="texto-dorado">Duelo</span> neón contra Flork
        </p>
      </header>

      <section className="panel panel--azul base-lista" aria-label="Estado del proyecto">
        <span className="etiqueta">Arena en preparación</span>
        <h1>La base ya está montada</h1>
        <p className="texto-tenue">
          Tema oscuro con neones dorados y azules, assets optimizados y estructura de
          componentes lista para el combate.
        </p>
      </section>
    </main>
  )
}
