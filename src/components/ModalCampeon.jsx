import { useEffect, useRef } from 'react'
import Icono from './Icono.jsx'
import { NOMBRES } from '../game/movimientos.js'
import { resumenPartida } from '../game/motor.js'
import florkFeliz from '../assets/flork-feliz.webp'
import florkMolesto from '../assets/flork-molesto.webp'

export default function ModalCampeon({
  partida,
  abierto,
  onRevancha,
  onCambiarJugador,
  onCerrar,
}) {
  const botonPrincipal = useRef(null)

  useEffect(() => {
    if (!abierto) return

    botonPrincipal.current?.focus()

    function alPulsar(evento) {
      if (evento.key === 'Escape') onCerrar()
    }

    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [abierto, onCerrar])

  if (!partida || !partida.campeon || !abierto) return null

  const gano = partida.campeon === 'jugador'
  const resumen = resumenPartida(partida)

  return (
    <div
      className="modal"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar()
      }}
    >
      <div
        className={`modal__caja panel ${gano ? '' : 'panel--azul'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-campeon"
        aria-describedby="resumen-campeon"
      >
        <span className="etiqueta">Serie finalizada</span>

        <img
          className={`modal__flork ${gano ? 'modal__flork--perdedor' : 'modal__flork--ganador'}`}
          src={gano ? florkMolesto : florkFeliz}
          alt={gano ? 'Flork derrotado y furioso' : 'Flork celebrando la victoria'}
        />

        <h2 id="titulo-campeon" className="modal__titulo">
          {gano ? `¡${partida.nombre}, campeón!` : 'Flork se lleva la corona'}
        </h2>

        <p id="resumen-campeon" className="modal__texto texto-tenue">
          {gano
            ? 'Leíste al rival y dominaste la arena. La corona es tuya.'
            : 'Te faltó lectura. La revancha está a un clic.'}
        </p>

        <p className="modal__marcador">
          <span className="texto-dorado">{partida.marcador.jugador}</span>
          <span className="modal__guion">—</span>
          <span className="texto-azul">{partida.marcador.rival}</span>
        </p>

        <dl className="modal__stats">
          <div>
            <dt>Rondas ganadas</dt>
            <dd>{resumen.victoria}</dd>
          </div>
          <div>
            <dt>Empates</dt>
            <dd>{resumen.empate}</dd>
          </div>
          <div>
            <dt>Mejor racha</dt>
            <dd>{resumen.mejorRacha}</dd>
          </div>
          <div>
            <dt>Jugada favorita</dt>
            <dd>{resumen.favorito ? NOMBRES[resumen.favorito] : '—'}</dd>
          </div>
        </dl>

        <div className="modal__acciones">
          <button
            ref={botonPrincipal}
            type="button"
            className="boton boton--dorado"
            onClick={onRevancha}
          >
            <Icono nombre="reiniciar" tamano={17} />
            Revancha
          </button>
          <button type="button" className="boton boton--azul" onClick={onCambiarJugador}>
            Cambiar jugador
          </button>
        </div>

        <button type="button" className="modal__cerrar" onClick={onCerrar}>
          Ver el tablero
        </button>
      </div>
    </div>
  )
}
