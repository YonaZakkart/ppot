import { describe, expect, it } from 'vitest'
import { DIFICULTADES, elegirMovimientoRival, obtenerDificultad } from './rival.js'
import { MOVIMIENTOS } from './movimientos.js'

function historialDe(...jugadas) {
  return jugadas.map((jugador, indice) => ({
    ronda: indice + 1,
    jugador,
    rival: 'piedra',
    resultado: 'empate',
  }))
}

const azarFijo = (valor) => () => valor

describe('elegirMovimientoRival', () => {
  it('siempre devuelve un movimiento válido', () => {
    for (const dificultad of DIFICULTADES.map((d) => d.id)) {
      for (const valor of [0, 0.34, 0.67, 0.999]) {
        const movimiento = elegirMovimientoRival({
          dificultad,
          historial: historialDe('piedra', 'papel', 'tijera'),
          azar: azarFijo(valor),
        })
        expect(MOVIMIENTOS).toContain(movimiento)
      }
    }
  })

  it('novato juega al azar sin mirar el historial', () => {
    const historial = historialDe('piedra', 'piedra', 'piedra')
    expect(elegirMovimientoRival({ dificultad: 'novato', historial, azar: azarFijo(0) })).toBe(
      'piedra',
    )
    expect(
      elegirMovimientoRival({ dificultad: 'novato', historial, azar: azarFijo(0.5) }),
    ).toBe('papel')
  })

  it('retador contragolpea tu jugada más frecuente', () => {
    const historial = historialDe('tijera', 'tijera', 'piedra')
    // Con azar 0 elige la opción de mayor peso: vencer a "tijera" => piedra
    expect(
      elegirMovimientoRival({ dificultad: 'retador', historial, azar: azarFijo(0) }),
    ).toBe('piedra')
  })

  it('pesadilla anticipa la secuencia repetida', () => {
    const historial = historialDe('piedra', 'papel', 'piedra', 'papel')
    // Tras "papel" el jugador siempre juega "piedra": la contramedida es papel
    expect(
      elegirMovimientoRival({ dificultad: 'pesadilla', historial, azar: azarFijo(0) }),
    ).toBe('papel')
  })

  it('sin historial cae al azar', () => {
    expect(
      elegirMovimientoRival({ dificultad: 'pesadilla', historial: [], azar: azarFijo(0) }),
    ).toBe('piedra')
  })

  it('usa el retador por defecto', () => {
    expect(obtenerDificultad('inexistente').id).toBe('retador')
    expect(obtenerDificultad('pesadilla').nombre).toBe('Pesadilla')
  })
})
