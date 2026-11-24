import { useState } from 'react'
import Icono from './Icono.jsx'
import { SERIES } from '../game/movimientos.js'
import { DIFICULTADES } from '../game/rival.js'
import { ESTADISTICAS_INICIALES, porcentajeVictorias } from '../game/estadisticas.js'

export default function FormularioJugador({ onIniciar, estadisticas = ESTADISTICAS_INICIALES }) {
  const [nombre, setNombre] = useState('')
  const [meta, setMeta] = useState(2)
  const [dificultad, setDificultad] = useState('retador')

  function enviar(evento) {
    evento.preventDefault()
    onIniciar({ nombre, meta, dificultad })
  }

  return (
    <form className="panel panel--azul formulario" onSubmit={enviar}>
      <div className="formulario__intro">
        <span className="etiqueta">Duelo 1 vs 1</span>
        <h1>Entra a la arena</h1>
        <p className="texto-tenue">
          Configura tu serie y reta a Flork. Sin piedad, sin excusas.
        </p>
      </div>

      <label className="campo">
        <span className="campo__etiqueta">Tu nombre</span>
        <input
          className="campo__entrada"
          type="text"
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          maxLength={16}
          placeholder="Jugador"
          autoComplete="off"
          autoFocus
        />
      </label>

      <fieldset className="grupo">
        <legend className="grupo__titulo">Formato de la serie</legend>
        <div className="segmentado">
          {SERIES.map((serie) => (
            <button
              key={serie.id}
              type="button"
              className={`segmentado__opcion ${meta === serie.meta ? 'activo' : ''}`}
              aria-pressed={meta === serie.meta}
              aria-label={serie.etiqueta}
              onClick={() => setMeta(serie.meta)}
            >
              <span aria-hidden="true">{serie.corto}</span>
              <span className="sr-solo">{serie.etiqueta}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="grupo">
        <legend className="grupo__titulo">Dificultad del rival</legend>
        <div className="dificultades">
          {DIFICULTADES.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              className={`dificultad ${dificultad === opcion.id ? 'activo' : ''}`}
              aria-pressed={dificultad === opcion.id}
              onClick={() => setDificultad(opcion.id)}
            >
              <span className="dificultad__nivel" aria-hidden="true">
                {'◆'.repeat(opcion.nivel)}
              </span>
              <span className="dificultad__nombre">{opcion.nombre}</span>
              <span className="dificultad__desc">{opcion.descripcion}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <button className="boton boton--dorado boton--bloque formulario__iniciar" type="submit">
        <Icono nombre="rayo" tamano={18} />
        Iniciar duelo
      </button>

      {estadisticas.partidas > 0 && (
        <dl className="resumen-stats" aria-label="Tus estadísticas">
          <div className="resumen-stats__dato">
            <dt>Partidas</dt>
            <dd>{estadisticas.partidas}</dd>
          </div>
          <div className="resumen-stats__dato">
            <dt>Victorias</dt>
            <dd>{estadisticas.victorias}</dd>
          </div>
          <div className="resumen-stats__dato">
            <dt>Éxito</dt>
            <dd>{porcentajeVictorias(estadisticas)}%</dd>
          </div>
          <div className="resumen-stats__dato">
            <dt>Mejor racha</dt>
            <dd>{estadisticas.mejorRachaPartidas}</dd>
          </div>
        </dl>
      )}
    </form>
  )
}
