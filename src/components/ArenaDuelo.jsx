import Icono from './Icono.jsx'
import CantoDuelo from './CantoDuelo.jsx'
import { MOVIMIENTOS, NOMBRES } from '../game/movimientos.js'
import { obtenerDificultad } from '../game/rival.js'
import { ESTADOS } from '../game/motor.js'
import florkFeliz from '../assets/flork-feliz.webp'
import florkMolesto from '../assets/flork-molesto.webp'
import florkRetador from '../assets/flork-retador.webp'

const FLORK = {
  feliz: { imagen: florkFeliz, alt: 'Flork celebrando' },
  molesto: { imagen: florkMolesto, alt: 'Flork furioso' },
  retador: { imagen: florkRetador, alt: 'Flork retándote a duelo' },
}

function animoFlork(partida) {
  if (partida.marcador.rival > partida.marcador.jugador) return 'feliz'
  if (partida.marcador.jugador > partida.marcador.rival) return 'molesto'
  return 'retador'
}

export default function ArenaDuelo({
  partida,
  fase,
  rondaActual,
  mensaje,
  tono,
  onElegir,
  onRevancha,
  onSalir,
}) {
  const dificultad = obtenerDificultad(partida.dificultad)
  const animo = FLORK[animoFlork(partida)]
  const revelado = fase === 'resultado'
  const elegible = fase === 'eligiendo'
  const resultado = revelado ? rondaActual?.resultado : null
  const terminada = partida.estado === ESTADOS.FINALIZADA

  return (
    <section className="panel arena" aria-label="Arena de duelo">
      <header className="arena__cabecera">
        <span className="etiqueta">
          {terminada
            ? 'Serie finalizada'
            : `Ronda ${partida.ronda} · Al mejor de ${partida.meta * 2 - 1}`}
        </span>
        <button className="arena__salir" type="button" onClick={onSalir}>
          Abandonar
        </button>
      </header>

      <div className="arena__combatientes">
        <article className="combatiente combatiente--jugador">
          <div className="combatiente__avatar" aria-hidden="true">
            {partida.nombre.slice(0, 1).toUpperCase()}
          </div>
          <h2 className="combatiente__nombre">{partida.nombre}</h2>
          <span className="combatiente__rol">Retador</span>
        </article>

        <div className="arena__vs" aria-hidden="true">
          <Icono nombre="rayo" tamano={16} />
          <span>VS</span>
        </div>

        <article className="combatiente combatiente--flork">
          <img className="combatiente__flork" src={animo.imagen} alt={animo.alt} />
          <h2 className="combatiente__nombre">Flork</h2>
          <span className="combatiente__rol">{dificultad.nombre}</span>
        </article>
      </div>

      <div className="arena__duelo">
        <div
          className={`arena__slot ${rondaActual ? 'arena__slot--jugada' : ''} ${
            resultado === 'victoria' ? 'arena__slot--ganador' : ''
          }`}
        >
          {rondaActual ? (
            <Icono nombre={rondaActual.jugador} tamano={52} />
          ) : (
            <span className="arena__interrogante">?</span>
          )}
          {resultado === 'victoria' && <span className="arena__slot-badge">+1</span>}
          <span className="arena__slot-pie">{partida.nombre}</span>
        </div>

        <span className="arena__separador" aria-hidden="true">
          vs
        </span>

        <div
          className={`arena__slot ${revelado && rondaActual ? 'arena__slot--jugada' : ''} ${
            resultado === 'derrota' ? 'arena__slot--ganador' : ''
          }`}
        >
          {revelado && rondaActual ? (
            <Icono nombre={rondaActual.rival} tamano={52} />
          ) : (
            <span className="arena__interrogante">?</span>
          )}
          {resultado === 'derrota' && <span className="arena__slot-badge">+1</span>}
          <span className="arena__slot-pie">Flork</span>
        </div>
      </div>

      <CantoDuelo texto={mensaje} tono={tono} />

      {terminada ? (
        <div className="arena__final">
          <p className="arena__final-texto">Serie terminada. ¿Otra vuelta?</p>
          <div className="arena__final-acciones">
            <button type="button" className="boton boton--dorado" onClick={onRevancha}>
              <Icono nombre="reiniciar" tamano={17} />
              Revancha
            </button>
            <button type="button" className="boton boton--azul" onClick={onSalir}>
              Cambiar jugador
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="jugadas" role="group" aria-label="Elige tu jugada">
            {MOVIMIENTOS.map((movimiento, indice) => (
              <button
                key={movimiento}
                type="button"
                className={`jugada jugada--${movimiento}`}
                onClick={() => onElegir(movimiento)}
                disabled={!elegible}
                aria-label={`Jugar ${NOMBRES[movimiento]} (tecla ${indice + 1})`}
              >
                <Icono nombre={movimiento} tamano={42} clase="jugada__icono" />
                <span className="jugada__nombre">{NOMBRES[movimiento]}</span>
                <span className="jugada__tecla" aria-hidden="true">
                  {indice + 1}
                </span>
              </button>
            ))}
          </div>

          <p className="arena__ayuda">
            Atajos: <kbd>1</kbd> piedra · <kbd>2</kbd> papel · <kbd>3</kbd> tijera
          </p>
        </>
      )}
    </section>
  )
}
