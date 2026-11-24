import Icono from './Icono.jsx'
import { NOMBRES } from '../game/movimientos.js'

const ETIQUETAS = {
  victoria: 'Ganaste',
  derrota: 'Perdiste',
  empate: 'Empate',
}

export default function HistorialRondas({ historial }) {
  const rondas = [...historial].reverse()

  return (
    <section className="panel historial" aria-label="Historial de rondas">
      <header className="historial__cabecera">
        <span className="etiqueta">Historial</span>
        <span className="historial__total">{historial.length} rondas</span>
      </header>

      {rondas.length === 0 ? (
        <p className="historial__vacio">
          Todavía no hay rondas. Lanza tu primera jugada y empieza a escribir la leyenda.
        </p>
      ) : (
        <ol className="historial__lista">
          {rondas.map((ronda) => (
            <li key={ronda.ronda} className={`historial__item historial__item--${ronda.resultado}`}>
              <span className="historial__ronda">R{ronda.ronda}</span>
              <span className="historial__mov" title={NOMBRES[ronda.jugador]}>
                <Icono nombre={ronda.jugador} tamano={17} />
              </span>
              <span className="historial__resultado">{ETIQUETAS[ronda.resultado]}</span>
              <span className="historial__mov historial__mov--rival" title={NOMBRES[ronda.rival]}>
                <Icono nombre={ronda.rival} tamano={17} />
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
