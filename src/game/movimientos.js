export const MOVIMIENTOS = ['piedra', 'papel', 'tijera']

export const NOMBRES = {
  piedra: 'Piedra',
  papel: 'Papel',
  tijera: 'Tijera',
}

export const ICONOS = {
  piedra: 'piedra',
  papel: 'papel',
  tijera: 'tijera',
}

/** Movimiento al que vence cada jugada. */
export const VENCE_A = {
  piedra: 'tijera',
  papel: 'piedra',
  tijera: 'papel',
}

export const ATAJOS = {
  1: 'piedra',
  2: 'papel',
  3: 'tijera',
  p: 'piedra',
  l: 'papel',
  t: 'tijera',
}

export const SERIES = [
  { id: 'bo3', rondas: 3, meta: 2, etiqueta: 'Al mejor de 3' },
  { id: 'bo5', rondas: 5, meta: 3, etiqueta: 'Al mejor de 5' },
  { id: 'bo7', rondas: 7, meta: 4, etiqueta: 'Al mejor de 7' },
]

export function esMovimiento(valor) {
  return MOVIMIENTOS.includes(valor)
}

export function movimientoQueVenceA(movimiento) {
  return MOVIMIENTOS.find((candidato) => VENCE_A[candidato] === movimiento)
}
