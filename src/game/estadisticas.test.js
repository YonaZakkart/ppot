import { describe, expect, it } from 'vitest'
import {
  ESTADISTICAS_INICIALES,
  actualizarEstadisticas,
  movimientoFavorito,
  porcentajeVictorias,
} from './estadisticas.js'
import { crearPartida, jugarRonda } from './motor.js'

function partidaGanada(nombre = 'Ana', dificultad = 'retador') {
  let partida = crearPartida({ nombre, meta: 2, dificultad })
  partida = jugarRonda(partida, 'piedra', 'tijera')
  partida = jugarRonda(partida, 'papel', 'piedra')
  return partida
}

function partidaPerdida() {
  let partida = crearPartida({ meta: 2 })
  partida = jugarRonda(partida, 'tijera', 'piedra')
  partida = jugarRonda(partida, 'papel', 'tijera')
  return partida
}

describe('actualizarEstadisticas', () => {
  it('no cambia nada si la partida sigue en curso', () => {
    const enCurso = jugarRonda(crearPartida({ meta: 3 }), 'piedra', 'tijera')
    expect(actualizarEstadisticas(ESTADISTICAS_INICIALES, enCurso)).toEqual(
      ESTADISTICAS_INICIALES,
    )
  })

  it('acumula victorias, rondas y uso de movimientos', () => {
    const estadisticas = actualizarEstadisticas(ESTADISTICAS_INICIALES, partidaGanada())

    expect(estadisticas).toMatchObject({
      partidas: 1,
      victorias: 1,
      derrotas: 0,
      rondasGanadas: 2,
      rondasPerdidas: 0,
      empates: 0,
      rachaPartidas: 1,
      mejorRachaPartidas: 1,
      mejorRachaRondas: 2,
    })
    expect(estadisticas.uso).toEqual({ piedra: 1, papel: 1, tijera: 0 })
  })

  it('corta la racha de partidas al perder', () => {
    let estadisticas = actualizarEstadisticas(ESTADISTICAS_INICIALES, partidaGanada())
    estadisticas = actualizarEstadisticas(estadisticas, partidaPerdida())

    expect(estadisticas.partidas).toBe(2)
    expect(estadisticas.victorias).toBe(1)
    expect(estadisticas.derrotas).toBe(1)
    expect(estadisticas.rachaPartidas).toBe(0)
    expect(estadisticas.mejorRachaPartidas).toBe(1)
    expect(estadisticas.rondasPerdidas).toBe(2)
  })

  it('no muta las estadísticas previas', () => {
    const previas = { ...ESTADISTICAS_INICIALES }
    actualizarEstadisticas(previas, partidaGanada())
    expect(previas).toEqual(ESTADISTICAS_INICIALES)
  })
})

describe('derivados', () => {
  it('calcula el porcentaje de victorias', () => {
    expect(porcentajeVictorias(ESTADISTICAS_INICIALES)).toBe(0)
    expect(porcentajeVictorias({ partidas: 4, victorias: 3 })).toBe(75)
  })

  it('detecta el movimiento favorito', () => {
    expect(movimientoFavorito(ESTADISTICAS_INICIALES)).toBeNull()
    expect(
      movimientoFavorito({ uso: { piedra: 2, papel: 7, tijera: 1 } }),
    ).toBe('papel')
  })
})
