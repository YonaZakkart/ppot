import { MOVIMIENTOS } from './movimientos.js'
import { ESTADOS, resumenPartida } from './motor.js'

export const ESTADISTICAS_INICIALES = {
  partidas: 0,
  victorias: 0,
  derrotas: 0,
  rondasGanadas: 0,
  rondasPerdidas: 0,
  empates: 0,
  rachaPartidas: 0,
  mejorRachaPartidas: 0,
  mejorRachaRondas: 0,
  uso: { piedra: 0, papel: 0, tijera: 0 },
}

export function actualizarEstadisticas(estadisticas, partida) {
  const base = {
    ...ESTADISTICAS_INICIALES,
    ...estadisticas,
    uso: { ...ESTADISTICAS_INICIALES.uso, ...estadisticas?.uso },
  }
  if (!partida || partida.estado !== ESTADOS.FINALIZADA || !partida.campeon) return base

  const resumen = resumenPartida(partida)
  const gano = partida.campeon === 'jugador'
  const rachaPartidas = gano ? base.rachaPartidas + 1 : 0

  return {
    ...base,
    partidas: base.partidas + 1,
    victorias: base.victorias + (gano ? 1 : 0),
    derrotas: base.derrotas + (partida.campeon === 'rival' ? 1 : 0),
    rondasGanadas: base.rondasGanadas + resumen.victoria,
    rondasPerdidas: base.rondasPerdidas + resumen.derrota,
    empates: base.empates + resumen.empate,
    rachaPartidas,
    mejorRachaPartidas: Math.max(base.mejorRachaPartidas, rachaPartidas),
    mejorRachaRondas: Math.max(base.mejorRachaRondas, resumen.mejorRacha),
    uso: Object.fromEntries(
      MOVIMIENTOS.map((movimiento) => [
        movimiento,
        base.uso[movimiento] + resumen.uso[movimiento],
      ]),
    ),
  }
}

export function porcentajeVictorias(estadisticas) {
  if (!estadisticas.partidas) return 0
  return Math.round((estadisticas.victorias / estadisticas.partidas) * 100)
}

export function movimientoFavorito(estadisticas) {
  const uso = estadisticas.uso ?? {}
  const favorito = MOVIMIENTOS.reduce((mejor, movimiento) =>
    (uso[movimiento] ?? 0) > (uso[mejor] ?? 0) ? movimiento : mejor,
  )
  return (uso[favorito] ?? 0) > 0 ? favorito : null
}
