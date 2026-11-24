import { MOVIMIENTOS, movimientoQueVenceA } from './movimientos.js'

export const DIFICULTADES = [
  {
    id: 'novato',
    nombre: 'Novato',
    resumen: 'Pura suerte',
    descripcion: 'Flork juega al azar. Ideal para calentar.',
  },
  {
    id: 'retador',
    nombre: 'Retador',
    resumen: 'Lee tus patrones',
    descripcion: 'Contragolpea tus jugadas más repetidas.',
  },
  {
    id: 'pesadilla',
    nombre: 'Pesadilla',
    resumen: 'Anticipa tu jugada',
    descripcion: 'Aprende tus secuencias y las castiga.',
  },
]

export const DIFICULTAD_POR_DEFECTO = 'retador'

export function obtenerDificultad(id) {
  return DIFICULTADES.find((dificultad) => dificultad.id === id) ?? DIFICULTADES[1]
}

function jugadaMasFrecuente(historial) {
  if (!historial.length) return null

  const conteo = Object.fromEntries(MOVIMIENTOS.map((movimiento) => [movimiento, 0]))
  for (const ronda of historial) conteo[ronda.jugador] += 1

  return MOVIMIENTOS.reduce((mejor, movimiento) =>
    conteo[movimiento] > conteo[mejor] ? movimiento : mejor,
  )
}

/** Predice la próxima jugada a partir de lo que suele seguir a tu última jugada. */
function prediccionDeSecuencia(historial) {
  if (historial.length < 2) return null

  const ultima = historial[historial.length - 1].jugador
  const siguientes = {}

  for (let i = 0; i < historial.length - 1; i += 1) {
    if (historial[i].jugador !== ultima) continue
    const siguiente = historial[i + 1].jugador
    siguientes[siguiente] = (siguientes[siguiente] ?? 0) + 1
  }

  const entradas = Object.entries(siguientes)
  if (!entradas.length) return null

  return entradas.reduce((mejor, actual) => (actual[1] > mejor[1] ? actual : mejor))[0]
}

function elegirPorPeso(opciones, azar) {
  const total = opciones.reduce((suma, opcion) => suma + opcion.peso, 0)
  let punto = Math.min(Math.max(azar(), 0), 0.999999) * total

  for (const opcion of opciones) {
    punto -= opcion.peso
    if (punto < 0) return opcion.movimiento
  }

  return opciones[opciones.length - 1].movimiento
}

function jugadaAlAzar(azar) {
  const indice = Math.min(MOVIMIENTOS.length - 1, Math.floor(azar() * MOVIMIENTOS.length))
  return MOVIMIENTOS[indice]
}

/**
 * Elige la jugada del rival según la dificultad y el historial de la partida.
 * `azar` se puede inyectar para pruebas deterministas.
 */
export function elegirMovimientoRival({
  dificultad = DIFICULTAD_POR_DEFECTO,
  historial = [],
  azar = Math.random,
} = {}) {
  if (dificultad === 'novato' || !historial.length) return jugadaAlAzar(azar)

  const frecuente = jugadaMasFrecuente(historial)
  const ultima = historial[historial.length - 1].jugador

  if (dificultad === 'pesadilla') {
    const predicha = prediccionDeSecuencia(historial) ?? frecuente
    return elegirPorPeso(
      [
        { movimiento: movimientoQueVenceA(predicha), peso: 0.6 },
        { movimiento: movimientoQueVenceA(frecuente), peso: 0.25 },
        { movimiento: jugadaAlAzar(azar), peso: 0.15 },
      ],
      azar,
    )
  }

  return elegirPorPeso(
    [
      { movimiento: movimientoQueVenceA(frecuente), peso: 0.5 },
      { movimiento: movimientoQueVenceA(ultima), peso: 0.25 },
      { movimiento: jugadaAlAzar(azar), peso: 0.25 },
    ],
    azar,
  )
}
