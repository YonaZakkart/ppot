let contexto = null

function obtenerContexto() {
  if (typeof window === 'undefined') return null

  const Constructor = window.AudioContext ?? window.webkitAudioContext
  if (!Constructor) return null

  try {
    if (!contexto) contexto = new Constructor()
    if (contexto.state === 'suspended') contexto.resume().catch(() => {})
    return contexto
  } catch {
    return null
  }
}

function nota(
  audio,
  { frecuencia, frecuenciaFinal, duracion = 0.16, tipo = 'triangle', volumen = 0.09, retardo = 0 },
) {
  const oscilador = audio.createOscillator()
  const ganancia = audio.createGain()
  const inicio = audio.currentTime + retardo

  oscilador.type = tipo
  oscilador.frequency.setValueAtTime(frecuencia, inicio)
  if (frecuenciaFinal) {
    oscilador.frequency.exponentialRampToValueAtTime(frecuenciaFinal, inicio + duracion)
  }

  ganancia.gain.setValueAtTime(0.0001, inicio)
  ganancia.gain.exponentialRampToValueAtTime(volumen, inicio + 0.012)
  ganancia.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion)

  oscilador.connect(ganancia)
  ganancia.connect(audio.destination)
  oscilador.start(inicio)
  oscilador.stop(inicio + duracion + 0.05)
}

const ARPEGIOS = {
  clic: [{ frecuencia: 330, frecuenciaFinal: 220, duracion: 0.08, tipo: 'square', volumen: 0.04 }],
  victoria: [
    { frecuencia: 523.25, duracion: 0.16, retardo: 0 },
    { frecuencia: 659.25, duracion: 0.16, retardo: 0.09 },
    { frecuencia: 783.99, duracion: 0.26, retardo: 0.18 },
  ],
  derrota: [
    { frecuencia: 392, duracion: 0.16, tipo: 'sawtooth', volumen: 0.06 },
    { frecuencia: 311.13, duracion: 0.18, tipo: 'sawtooth', volumen: 0.06, retardo: 0.11 },
    { frecuencia: 233.08, duracion: 0.3, tipo: 'sawtooth', volumen: 0.05, retardo: 0.22 },
  ],
  empate: [
    { frecuencia: 440, duracion: 0.12, tipo: 'sine', volumen: 0.07 },
    { frecuencia: 440, duracion: 0.16, tipo: 'sine', volumen: 0.05, retardo: 0.12 },
  ],
  fanfarria: [
    { frecuencia: 523.25, duracion: 0.16, retardo: 0 },
    { frecuencia: 659.25, duracion: 0.16, retardo: 0.11 },
    { frecuencia: 783.99, duracion: 0.16, retardo: 0.22 },
    { frecuencia: 1046.5, duracion: 0.24, retardo: 0.33 },
    { frecuencia: 1318.51, duracion: 0.4, retardo: 0.46 },
  ],
  derrotaSerie: [
    { frecuencia: 261.63, duracion: 0.28, tipo: 'sawtooth', volumen: 0.06 },
    { frecuencia: 207.65, duracion: 0.3, tipo: 'sawtooth', volumen: 0.06, retardo: 0.18 },
    { frecuencia: 155.56, duracion: 0.5, tipo: 'sawtooth', volumen: 0.05, retardo: 0.36 },
  ],
}

export function reproducir(efecto, { silenciado = false } = {}) {
  if (silenciado) return

  const arpegio = ARPEGIOS[efecto]
  if (!arpegio) return

  const audio = obtenerContexto()
  if (!audio) return

  for (const paso of arpegio) nota(audio, paso)
}

export function cantar(texto, { activa = false } = {}) {
  if (!activa || typeof window === 'undefined' || !('speechSynthesis' in window)) return

  try {
    const sintesis = window.speechSynthesis
    sintesis.cancel()

    const locucion = new SpeechSynthesisUtterance(texto)
    locucion.lang = 'es-ES'
    locucion.rate = 1.05
    locucion.pitch = 0.9
    locucion.volume = 0.9

    const vozEspanola = sintesis.getVoices().find((voz) => voz.lang.startsWith('es'))
    if (vozEspanola) locucion.voice = vozEspanola

    sintesis.speak(locucion)
  } catch {
    // Sin voces disponibles: el juego sigue funcionando igual.
  }
}

export function detenerVoz() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

  try {
    window.speechSynthesis.cancel()
  } catch {
    // Ignorado a propósito.
  }
}
