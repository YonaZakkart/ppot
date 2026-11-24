import { MOVIMIENTOS, SERIES, VENCE_A, esMovimiento } from './movimientos.js'

export const ESTADOS = {
  EN_CURSO: 'en_curso',
  FINALIZADA: 'finalizada',
}

export const RESULTADOS = {
  VICTORIA: 'victoria',
  DERROTA: 'derrota',
  EMPATE: 'empate',
}

const NOMBRE_POR_DEFECTO = 'Jugador'
const LARGO_MAXIMO_NOMBRE = 16

export function resolverRonda(jugador, rival) {
  if (!esMovimiento(jugador) || !esMovimiento(rival)) {
    throw new TypeError('Los movimientos deben ser piedra, papel o tijera')
  }
  if (jugador === rival) return RESULTADOS.EMPATE
  return VENCE_A[jugador] === rival ? RESULTADOS.VICTORIA : RESULTADOS.DERROTA
}

export function normalizarNombre(nombre) {
  const limpio = String(nombre ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, LARGO_MAXIMO_NOMBRE)
  return limpio || NOMBRE_POR_DEFECTO
}

export function crearPartida({ nombre, meta = 2, dificultad = 'retador' } = {}) {
  const metaValida = SERIES.some((serie) => serie.meta === meta) ? meta : 2

  return {
    nombre: normalizarNombre(nombre),
    meta: metaValida,
    dificultad,
    marcador: { jugador: 0, rival: 0, empates: 0 },
    historial: [],
    ronda: 1,
    rachaJugador: 0,
    mejorRacha: 0,
    estado: ESTADOS.EN_CURSO,
    campeon: null,
  }
}

export function jugarRonda(partida, movimientoJugador, movimientoRival) {
  if (partida.estado === ESTADOS.FINALIZADA) return partida

  const resultado = resolverRonda(movimientoJugador, movimientoRival)
  const marcador = { ...partida.marcador }

  if (resultado === RESULTADOS.VICTORIA) marcador.jugador += 1
  else if (resultado === RESULTADOS.DERROTA) marcador.rival += 1
  else marcador.empates += 1

  const rachaJugador = resultado === RESULTADOS.VICTORIA ? partida.rachaJugador + 1 : 0

  const historial = [
    ...partida.historial,
    {
      ronda: partida.ronda,
      jugador: movimientoJugador,
      rival: movimientoRival,
      resultado,
    },
  ]

  const campeon =
    marcador.jugador >= partida.meta
      ? 'jugador'
      : marcador.rival >= partida.meta
        ? 'rival'
        : null

  return {
    ...partida,
    marcador,
    historial,
    rachaJugador,
    mejorRacha: Math.max(partida.mejorRacha, rachaJugador),
    ronda: partida.ronda + 1,
    estado: campeon ? ESTADOS.FINALIZADA : ESTADOS.EN_CURSO,
    campeon,
  }
}

export function reiniciarPartida(partida) {
  return crearPartida({
    nombre: partida.nombre,
    meta: partida.meta,
    dificultad: partida.dificultad,
  })
}

export function resumenPartida(partida) {
  const conteo = { victoria: 0, derrota: 0, empate: 0 }
  const uso = { piedra: 0, papel: 0, tijera: 0 }

  for (const ronda of partida.historial) {
    conteo[ronda.resultado] += 1
    uso[ronda.jugador] += 1
  }

  return {
    ...conteo,
    rondas: partida.historial.length,
    uso,
    favorito: MOVIMIENTOS.reduce((a, b) => (uso[b] > uso[a] ? b : a)),
    mejorRacha: partida.mejorRacha,
  }
}
