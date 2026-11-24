import { describe, expect, it } from 'vitest'
import {
  AJUSTES_INICIALES,
  CLAVES,
  borrar,
  cargarAjustes,
  cargarEstadisticas,
  guardar,
  guardarAjustes,
  guardarEstadisticas,
  leer,
} from './almacenamiento.js'
import { ESTADISTICAS_INICIALES } from './estadisticas.js'

describe('almacenamiento sin localStorage', () => {
  it('devuelve los valores por defecto y no lanza errores', () => {
    expect(leer('inexistente', 'defecto')).toBe('defecto')
    expect(guardar('clave', { a: 1 })).toBe(false)
    expect(borrar('clave')).toBe(false)
    expect(cargarEstadisticas()).toEqual(ESTADISTICAS_INICIALES)
    expect(cargarAjustes()).toEqual(AJUSTES_INICIALES)
    expect(guardarEstadisticas(ESTADISTICAS_INICIALES)).toBe(false)
    expect(guardarAjustes(AJUSTES_INICIALES)).toBe(false)
  })

  it('expone claves versionadas', () => {
    expect(CLAVES.estadisticas).toContain('ppot:')
    expect(CLAVES.ajustes).toContain('ppot:')
  })
})
