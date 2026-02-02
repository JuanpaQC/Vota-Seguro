import { useState } from 'react'
import { useTextToSpeech } from '../../context/TextToSpeechContext'

const TextToSpeechControl = () => {
  const {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    stop
  } = useTextToSpeech()

  const [isExpanded, setIsExpanded] = useState(false)

  if (!isSupported) {
    return null
  }

  const spanishVoices = voices.filter(voice => voice.lang.startsWith('es'))
  const ratePercentage = Math.round(rate * 100)

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Botón flotante principal */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isSpeaking
            ? 'bg-green-500 text-white focus:ring-green-500'
            : 'bg-[var(--app-accent)] text-white focus:ring-[var(--app-accent)]'
        }`}
        aria-label="Controles de lectura de texto"
        title="Lectura de texto"
      >
        {isSpeaking ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6 animate-pulse"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
            />
          </svg>
        )}
      </button>

      {/* Panel expandido */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 w-72 rounded-lg border border-[color:var(--app-border)] bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-[var(--app-ink)]">Lectura de texto</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-[var(--app-muted)] hover:text-[var(--app-ink)]"
              aria-label="Cerrar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Estado de lectura */}
          {isSpeaking && (
            <div className="mb-4 rounded-md bg-green-50 p-3 text-center">
              <div className="text-sm font-medium text-green-700">
                {isPaused ? '⏸️ Pausado' : '🔊 Leyendo...'}
              </div>
            </div>
          )}

          {/* Control de detener */}
          {isSpeaking && (
            <button
              onClick={stop}
              className="mb-4 w-full rounded-md bg-red-500 py-2 text-sm font-medium text-white transition hover:bg-red-600"
            >
              Detener lectura
            </button>
          )}

          {/* Selector de voz */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[var(--app-ink)]">
              Voz
            </label>
            <select
              value={selectedVoice?.name || ''}
              onChange={(e) => {
                const voice = voices.find(v => v.name === e.target.value)
                setSelectedVoice(voice)
              }}
              className="w-full rounded-md border border-[color:var(--app-border)] bg-white px-3 py-2 text-sm text-[var(--app-ink)] focus:border-[var(--app-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--app-accent)]"
            >
              {spanishVoices.length > 0 ? (
                spanishVoices.map(voice => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))
              ) : (
                <option>Sin voces en español disponibles</option>
              )}
            </select>
          </div>

          {/* Control de velocidad */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--app-ink)]">
                Velocidad
              </label>
              <span className="text-sm font-bold text-[var(--app-accent)]">
                {ratePercentage}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              step="10"
              value={rate * 100}
              onChange={(e) => setRate(parseFloat(e.target.value) / 100)}
              className="w-full accent-[var(--app-accent)]"
              aria-label="Velocidad de lectura"
            />
            <div className="mt-1 flex justify-between text-xs text-[var(--app-muted)]">
              <span>Lenta</span>
              <span>Normal</span>
              <span>Rápida</span>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="border-t border-[color:var(--app-border)] pt-3 text-xs text-[var(--app-muted)]">
            <p className="mb-2">
              💡 <strong>Cómo usar:</strong>
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Selecciona texto en la página</li>
              <li>Presiona el botón "Leer" que aparecerá</li>
              <li>O haz clic derecho → "Leer texto"</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default TextToSpeechControl
