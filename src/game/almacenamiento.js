import { ESTADISTICAS_INICIALES } from './estadisticas.js'

export const CLAVES = {
  estadisticas: 'ppot:estadisticas:v1',
  ajustes: 'ppot:ajustes:v1',
}

export const AJUSTES_INICIALES = {
  sonido: true,
  voz: false,
}

function obtenerAlmacen() {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

export function leer(clave, porDefecto) {
  const almacen = obtenerAlmacen()
  if (!almacen) return porDefecto

  try {
    const crudo = almacen.getItem(clave)
    return crudo ? JSON.parse(crudo) : porDefecto
  } catch {
    return porDefecto
  }
}

export function guardar(clave, valor) {
  const almacen = obtenerAlmacen()
  if (!almacen) return false

  try {
    almacen.setItem(clave, JSON.stringify(valor))
    return true
  } catch {
    return false
  }
}

export function borrar(clave) {
  const almacen = obtenerAlmacen()
  if (!almacen) return false

  try {
    almacen.removeItem(clave)
    return true
  } catch {
    return false
  }
}

function numero(valor) {
  return Number.isFinite(valor) && valor > 0 ? Math.floor(valor) : 0
}

export function cargarEstadisticas() {
  const guardadas = leer(CLAVES.estadisticas, {})
  const uso = guardadas?.uso ?? {}

  return {
    ...ESTADISTICAS_INICIALES,
    partidas: numero(guardadas?.partidas),
    victorias: numero(guardadas?.victorias),
    derrotas: numero(guardadas?.derrotas),
    rondasGanadas: numero(guardadas?.rondasGanadas),
    rondasPerdidas: numero(guardadas?.rondasPerdidas),
    empates: numero(guardadas?.empates),
    rachaPartidas: numero(guardadas?.rachaPartidas),
    mejorRachaPartidas: numero(guardadas?.mejorRachaPartidas),
    mejorRachaRondas: numero(guardadas?.mejorRachaRondas),
    uso: {
      piedra: numero(uso.piedra),
      papel: numero(uso.papel),
      tijera: numero(uso.tijera),
    },
  }
}

export function guardarEstadisticas(estadisticas) {
  return guardar(CLAVES.estadisticas, estadisticas)
}

export function cargarAjustes() {
  const guardados = leer(CLAVES.ajustes, {})
  return {
    sonido: guardados?.sonido ?? AJUSTES_INICIALES.sonido,
    voz: guardados?.voz ?? AJUSTES_INICIALES.voz,
  }
}

export function guardarAjustes(ajustes) {
  return guardar(CLAVES.ajustes, ajustes)
}
