import { describe, expect, it } from 'vitest'
import {
  ESTADOS,
  RESULTADOS,
  crearPartida,
  jugarRonda,
  normalizarNombre,
  reiniciarPartida,
  resumenPartida,
  resolverRonda,
} from './motor.js'
import { MOVIMIENTOS } from './movimientos.js'

describe('resolverRonda', () => {
  it('resuelve las nueve combinaciones posibles', () => {
    const esperado = {
      'piedra-piedra': RESULTADOS.EMPATE,
      'piedra-papel': RESULTADOS.DERROTA,
      'piedra-tijera': RESULTADOS.VICTORIA,
      'papel-piedra': RESULTADOS.VICTORIA,
      'papel-papel': RESULTADOS.EMPATE,
      'papel-tijera': RESULTADOS.DERROTA,
      'tijera-piedra': RESULTADOS.DERROTA,
      'tijera-papel': RESULTADOS.VICTORIA,
      'tijera-tijera': RESULTADOS.EMPATE,
    }

    for (const jugador of MOVIMIENTOS) {
      for (const rival of MOVIMIENTOS) {
        expect(resolverRonda(jugador, rival), `${jugador} vs ${rival}`).toBe(
          esperado[`${jugador}-${rival}`],
        )
      }
    }
  })

  it('rechaza movimientos inválidos', () => {
    expect(() => resolverRonda('lagarto', 'piedra')).toThrow(TypeError)
    expect(() => resolverRonda('piedra', undefined)).toThrow(TypeError)
  })
})

describe('crearPartida', () => {
  it('arranca limpia con valores por defecto', () => {
    const partida = crearPartida()
    expect(partida.nombre).toBe('Jugador')
    expect(partida.meta).toBe(2)
    expect(partida.marcador).toEqual({ jugador: 0, rival: 0, empates: 0 })
    expect(partida.historial).toEqual([])
    expect(partida.estado).toBe(ESTADOS.EN_CURSO)
    expect(partida.campeon).toBeNull()
  })

  it('sanea el nombre y la meta de la serie', () => {
    expect(normalizarNombre('   Ana   María  ')).toBe('Ana María')
    expect(normalizarNombre('')).toBe('Jugador')
    expect(normalizarNombre('x'.repeat(40))).toHaveLength(16)
    expect(crearPartida({ meta: 99 }).meta).toBe(2)
    expect(crearPartida({ meta: 4 }).meta).toBe(4)
  })
})

describe('jugarRonda', () => {
  it('acumula marcador, historial y racha', () => {
    let partida = crearPartida({ nombre: 'Ana' })

    partida = jugarRonda(partida, 'piedra', 'tijera')
    expect(partida.marcador).toEqual({ jugador: 1, rival: 0, empates: 0 })
    expect(partida.rachaJugador).toBe(1)
    expect(partida.mejorRacha).toBe(1)
    expect(partida.ronda).toBe(2)
    expect(partida.historial[0]).toEqual({
      ronda: 1,
      jugador: 'piedra',
      rival: 'tijera',
      resultado: RESULTADOS.VICTORIA,
    })

    partida = jugarRonda(partida, 'papel', 'tijera')
    expect(partida.rachaJugador).toBe(0)
    expect(partida.mejorRacha).toBe(1)
    expect(partida.ronda).toBe(3)

    partida = jugarRonda(partida, 'papel', 'papel')
    expect(partida.marcador.empates).toBe(1)
  })

  it('no muta la partida original', () => {
    const original = crearPartida()
    const siguiente = jugarRonda(original, 'piedra', 'tijera')

    expect(original.historial).toHaveLength(0)
    expect(original.marcador.jugador).toBe(0)
    expect(siguiente).not.toBe(original)
  })

  it('corona al jugador al alcanzar la meta', () => {
    let partida = crearPartida({ meta: 2 })

    partida = jugarRonda(partida, 'piedra', 'tijera')
    expect(partida.estado).toBe(ESTADOS.EN_CURSO)

    partida = jugarRonda(partida, 'papel', 'piedra')
    expect(partida.estado).toBe(ESTADOS.FINALIZADA)
    expect(partida.campeon).toBe('jugador')
  })

  it('corona al rival al alcanzar la meta', () => {
    let partida = crearPartida({ meta: 2 })

    partida = jugarRonda(partida, 'piedra', 'papel')
    partida = jugarRonda(partida, 'piedra', 'papel')

    expect(partida.campeon).toBe('rival')
    expect(partida.marcador).toEqual({ jugador: 0, rival: 2, empates: 0 })
  })

  it('ignora rondas después del final', () => {
    let partida = crearPartida({ meta: 2 })
    partida = jugarRonda(partida, 'piedra', 'tijera')
    partida = jugarRonda(partida, 'piedra', 'tijera')

    const congelada = jugarRonda(partida, 'papel', 'piedra')
    expect(congelada).toBe(partida)
  })
})

describe('reiniciarPartida', () => {
  it('conserva jugador, serie y dificultad', () => {
    let partida = crearPartida({ nombre: 'Ana', meta: 3, dificultad: 'pesadilla' })
    partida = jugarRonda(partida, 'piedra', 'tijera')

    const nueva = reiniciarPartida(partida)
    expect(nueva.nombre).toBe('Ana')
    expect(nueva.meta).toBe(3)
    expect(nueva.dificultad).toBe('pesadilla')
    expect(nueva.marcador).toEqual({ jugador: 0, rival: 0, empates: 0 })
    expect(nueva.historial).toEqual([])
  })
})

describe('resumenPartida', () => {
  it('cuenta resultados, uso y movimiento favorito', () => {
    let partida = crearPartida({ meta: 5 })
    partida = jugarRonda(partida, 'piedra', 'tijera')
    partida = jugarRonda(partida, 'piedra', 'papel')
    partida = jugarRonda(partida, 'tijera', 'tijera')

    const resumen = resumenPartida(partida)
    expect(resumen).toMatchObject({
      rondas: 3,
      victoria: 1,
      derrota: 1,
      empate: 1,
      favorito: 'piedra',
    })
    expect(resumen.uso).toEqual({ piedra: 2, papel: 0, tijera: 1 })
  })
})
