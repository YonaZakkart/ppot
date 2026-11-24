import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import titulo from './assets/titulo.webp'
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
import { cargarEstadisticas, guardarEstadisticas } from './game/almacenamiento.js'

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
  const [partida, setPartida] = useState(null)
  const [fase, setFase] = useState(FASE.INICIO)
  const [rondaActual, setRondaActual] = useState(null)
  const [canto, setCanto] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    guardarEstadisticas(estadisticas)
  }, [estadisticas])

  // Secuencia del canto antes de revelar las jugadas
  useEffect(() => {
    if (fase !== FASE.REVELANDO) return

    setCanto(CANTO[0])
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
    },
    [partida, fase],
  )

  const revancha = useCallback(() => {
    setPartida((actual) => (actual ? reiniciarPartida(actual) : actual))
    setFase(FASE.ELIGIENDO)
    setRondaActual(null)
    setModalAbierto(false)
  }, [])

  const volverAlInicio = useCallback(() => {
    setPartida(null)
    setFase(FASE.INICIO)
    setRondaActual(null)
    setModalAbierto(false)
    setCanto('')
  }, [])

  const cerrarModal = useCallback(() => setModalAbierto(false), [])

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
