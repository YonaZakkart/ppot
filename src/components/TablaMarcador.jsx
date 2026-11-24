import { obtenerDificultad } from '../game/rival.js'

function Pips({ total, ganadas, tono }) {
  return (
    <span className={`marcador__pips marcador__pips--${tono}`} aria-hidden="true">
      {Array.from({ length: total }, (_, indice) => (
        <span
          key={indice}
          className={`marcador__pip ${indice < ganadas ? 'marcador__pip--lleno' : ''}`}
        />
      ))}
    </span>
  )
}

export default function TablaMarcador({ partida }) {
  const { nombre, marcador, meta, dificultad } = partida

  return (
    <section className="panel marcador" aria-label="Marcador de la serie">
      <header className="marcador__cabecera">
        <span className="etiqueta">Marcador</span>
        <span className="marcador__formato">Primero a {meta}</span>
      </header>

      <div className="marcador__fila marcador__fila--jugador">
        <div className="marcador__quien">
          <span className="marcador__punto marcador__punto--dorado" aria-hidden="true" />
          <span className="marcador__nombre">{nombre}</span>
        </div>
        <Pips total={meta} ganadas={marcador.jugador} tono="dorado" />
        <span className="marcador__valor">{marcador.jugador}</span>
      </div>

      <div className="marcador__fila marcador__fila--rival">
        <div className="marcador__quien">
          <span className="marcador__punto marcador__punto--azul" aria-hidden="true" />
          <span className="marcador__nombre">Flork</span>
        </div>
        <Pips total={meta} ganadas={marcador.rival} tono="azul" />
        <span className="marcador__valor">{marcador.rival}</span>
      </div>

      <footer className="marcador__pie">
        <span>Empates: {marcador.empates}</span>
        <span>Rival: {obtenerDificultad(dificultad).nombre}</span>
      </footer>
    </section>
  )
}
