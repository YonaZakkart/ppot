import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import titulo from './assets/titulo.webp'
import Icono from './components/Icono.jsx'
import FormularioJugador from './components/FormularioJugador.jsx'
import ArenaDuelo from './components/ArenaDuelo.jsx'
import TablaMarcador from './components/TablaMarcador.jsx'
import HistorialRondas from './components/HistorialRondas.jsx'
import ModalCampeon from './components/ModalCampeon.jsx'
import {
  ESTADOS,
  RESULTADOS,
  crearPartida,
  jugarRonda,
  reiniciarPartida,
  resolverRonda,
} from './game/motor.js'
import { ATAJOS } from './game/movimientos.js'
import { elegirMovimientoRival } from './game/rival.js'
import { actualizarEstadisticas } from './game/estadisticas.js'
import {
  cargarAjustes,
  cargarEstadisticas,
  guardarAjustes,
  guardarEstadisticas,
} from './game/almacenamiento.js'
import { cantar, detenerVoz, reproducir } from './sonido.js'

const FASE = {
  INICIO: 'inicio',
  ELIGIENDO: 'eligiendo',
  REVELANDO: 'revelando',
  RESULTADO: 'resultado',
}

const MS_REVELADO = 1150
const MS_RESULTADO = 1700
const MS_MODAL = 900
const CANTO = ['Piedra…', 'Papel…', '¡Tijera!']

export default function App() {
  const [estadisticas, setEstadisticas] = useState(cargarEstadisticas)
  const [ajustes, setAjustes] = useState(cargarAjustes)
  const [partida, setPartida] = useState(null)
  const [fase, setFase] = useState(FASE.INICIO)
  const [rondaActual, setRondaActual] = useState(null)
  const [canto, setCanto] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const ajustesRef = useRef(ajustes)

  useEffect(() => {
    guardarEstadisticas(estadisticas)
  }, [estadisticas])

  useEffect(() => {
    ajustesRef.current = ajustes
    guardarAjustes(ajustes)
  }, [ajustes])

  // Secuencia del canto antes de revelar las jugadas
  useEffect(() => {
    if (fase !== FASE.REVELANDO) return

    setCanto(CANTO[0])
    cantar('Piedra, papel, tijera', { activa: ajustesRef.current.voz })

    const temporizadores = [
      setTimeout(() => setCanto(CANTO[1]), 380),
      setTimeout(() => setCanto(CANTO[2]), 760),
    ]

    return () => temporizadores.forEach(clearTimeout)
  }, [fase, rondaActual?.ronda])

  // Resolución de la ronda tras el canto
  useEffect(() => {
    if (fase !== FASE.REVELANDO || !rondaActual || !partida) return

    const temporizador = setTimeout(() => {
      const resultado = resolverRonda(rondaActual.jugador, rondaActual.rival)
      const siguiente = jugarRonda(partida, rondaActual.jugador, rondaActual.rival)

      setPartida(siguiente)
      setRondaActual((actual) => (actual ? { ...actual, resultado } : actual))
      setFase(FASE.RESULTADO)

      if (siguiente.estado === ESTADOS.FINALIZADA) {
        setEstadisticas((previas) => actualizarEstadisticas(previas, siguiente))
        reproducir(siguiente.campeon === 'jugador' ? 'fanfarria' : 'derrotaSerie', {
          silenciado: !ajustesRef.current.sonido,
        })
        cantar(
          siguiente.campeon === 'jugador'
            ? `¡${siguiente.nombre}, campeón!`
            : 'Flork se lleva la corona',
          { activa: ajustesRef.current.voz },
        )
      } else {
        reproducir(
          resultado === RESULTADOS.VICTORIA
            ? 'victoria'
            : resultado === RESULTADOS.DERROTA
              ? 'derrota'
              : 'empate',
          { silenciado: !ajustesRef.current.sonido },
        )
      }
    }, MS_REVELADO)

    return () => clearTimeout(temporizador)
  }, [fase, rondaActual, partida])

  // Avance automático a la siguiente ronda
  useEffect(() => {
    if (fase !== FASE.RESULTADO || !partida || partida.estado === ESTADOS.FINALIZADA) return

    const temporizador = setTimeout(() => {
      setFase(FASE.ELIGIENDO)
      setRondaActual(null)
    }, MS_RESULTADO)

    return () => clearTimeout(temporizador)
  }, [fase, partida])

  // Aparición del modal de campeón
  useEffect(() => {
    if (!partida || partida.estado !== ESTADOS.FINALIZADA) return

    const temporizador = setTimeout(() => setModalAbierto(true), MS_MODAL)
    return () => clearTimeout(temporizador)
  }, [partida])

  const iniciar = useCallback(({ nombre, meta, dificultad }) => {
    setPartida(crearPartida({ nombre, meta, dificultad }))
    setFase(FASE.ELIGIENDO)
    setRondaActual(null)
    setModalAbierto(false)
  }, [])

  const elegir = useCallback(
    (movimiento) => {
      if (!partida || fase !== FASE.ELIGIENDO) return

      const jugadaRival = elegirMovimientoRival({
        dificultad: partida.dificultad,
        historial: partida.historial,
      })

      setRondaActual({
        ronda: partida.ronda,
        jugador: movimiento,
        rival: jugadaRival,
        resultado: null,
      })
      setFase(FASE.REVELANDO)
      reproducir('clic', { silenciado: !ajustesRef.current.sonido })
    },
    [partida, fase],
  )

  const revancha = useCallback(() => {
    detenerVoz()
    setPartida((actual) => (actual ? reiniciarPartida(actual) : actual))
    setFase(FASE.ELIGIENDO)
    setRondaActual(null)
    setModalAbierto(false)
  }, [])

  const volverAlInicio = useCallback(() => {
    detenerVoz()
    setPartida(null)
    setFase(FASE.INICIO)
    setRondaActual(null)
    setModalAbierto(false)
    setCanto('')
  }, [])

  const cerrarModal = useCallback(() => setModalAbierto(false), [])

  const alternarSonido = useCallback(() => {
    setAjustes((actuales) => ({ ...actuales, sonido: !actuales.sonido }))
  }, [])

  const alternarVoz = useCallback(() => {
    if (ajustesRef.current.voz) detenerVoz()
    setAjustes((actuales) => ({ ...actuales, voz: !actuales.voz }))
  }, [])

  // Atajos de teclado para jugar
  useEffect(() => {
    if (!partida || fase !== FASE.ELIGIENDO) return

    function alPulsar(evento) {
      if (evento.ctrlKey || evento.altKey || evento.metaKey) return

      const etiqueta = evento.target?.tagName
      if (etiqueta === 'INPUT' || etiqueta === 'TEXTAREA' || etiqueta === 'SELECT') return

      const movimiento = ATAJOS[evento.key.toLowerCase()]
      if (!movimiento) return

      evento.preventDefault()
      elegir(movimiento)
    }

    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [partida, fase, elegir])

  const mensaje = useMemo(() => {
    if (!partida) return ''

    if (fase === FASE.REVELANDO) return canto || CANTO[0]

    if (fase === FASE.RESULTADO && rondaActual?.resultado) {
      if (partida.estado === ESTADOS.FINALIZADA) {
        return partida.campeon === 'jugador'
          ? `¡${partida.nombre} gana la serie!`
          : 'Flork gana la serie'
      }
      if (rondaActual.resultado === RESULTADOS.VICTORIA) return `¡Punto para ${partida.nombre}!`
      if (rondaActual.resultado === RESULTADOS.DERROTA) return 'Flork se lleva la ronda'
      return 'Empate técnico'
    }

    return 'Elige tu jugada'
  }, [partida, fase, canto, rondaActual])

  const tono = useMemo(() => {
    if (fase !== FASE.RESULTADO || !rondaActual?.resultado) return 'neutro'
    if (partida?.estado === ESTADOS.FINALIZADA) {
      return partida.campeon === 'jugador' ? 'exito' : 'peligro'
    }
    if (rondaActual.resultado === RESULTADOS.VICTORIA) return 'exito'
    if (rondaActual.resultado === RESULTADOS.DERROTA) return 'peligro'
    return 'empate'
  }, [fase, rondaActual, partida])

  return (
    <main className="app">
      <header className="cabecera">
        <div className="hud">
          <span className="hud__marca">
            PPoT <em>arcade</em>
          </span>

          <div className="ajustes" role="group" aria-label="Ajustes de audio">
            <button
              type="button"
              className={`ajustes__boton ${ajustes.sonido ? 'activo' : ''}`}
              aria-pressed={ajustes.sonido}
              onClick={alternarSonido}
              title={ajustes.sonido ? 'Silenciar efectos' : 'Activar efectos'}
            >
              <Icono nombre={ajustes.sonido ? 'sonido' : 'silencio'} tamano={16} />
              <span>SFX</span>
            </button>

            <button
              type="button"
              className={`ajustes__boton ${ajustes.voz ? 'activo' : ''}`}
              aria-pressed={ajustes.voz}
              onClick={alternarVoz}
              title={ajustes.voz ? 'Silenciar la voz' : 'Activar la voz del canto'}
            >
              <Icono nombre="microfono" tamano={16} />
              <span>Voz</span>
            </button>
          </div>
        </div>

        <img className="cabecera__titulo" src={titulo} alt="Piedra, Papel o Tijera" />
        <p className="cabecera__lema">
          <span className="texto-dorado">Duelo</span> neón contra Flork
        </p>
      </header>

      {!partida ? (
        <FormularioJugador onIniciar={iniciar} estadisticas={estadisticas} />
      ) : (
        <div className="tablero">
          <ArenaDuelo
            partida={partida}
            fase={fase}
            rondaActual={rondaActual}
            mensaje={mensaje}
            tono={tono}
            onElegir={elegir}
            onRevancha={revancha}
            onSalir={volverAlInicio}
          />

          <aside className="lateral" aria-label="Panel de la partida">
            <TablaMarcador partida={partida} />
            <HistorialRondas historial={partida.historial} />
          </aside>
        </div>
      )}

      <footer className="pie">
        <span>PPoT · Duelo Neón</span>
        {estadisticas.partidas > 0 && (
          <span className="pie__dato">
            Récord: <strong>{estadisticas.victorias}V</strong> ·{' '}
            <strong>{estadisticas.derrotas}D</strong>
          </span>
        )}
      </footer>

      <ModalCampeon
        partida={partida}
        abierto={modalAbierto}
        onRevancha={revancha}
        onCambiarJugador={volverAlInicio}
        onCerrar={cerrarModal}
      />
    </main>
  )
}
