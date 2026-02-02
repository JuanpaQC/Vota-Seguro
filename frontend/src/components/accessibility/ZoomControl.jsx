import { useState } from 'react'
import { useAccessibility } from '../../context/AccessibilityContext'

const ZoomControl = () => {
  const {
    increaseZoom,
    decreaseZoom,
    resetZoom,
    canIncreaseZoom,
    canDecreaseZoom,
    zoomPercentage
  } = useAccessibility()

  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botón flotante principal */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--app-accent)] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] focus:ring-offset-2"
        aria-label="Controles de zoom"
        title="Controles de zoom"
      >
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
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6"
          />
        </svg>
      </button>

      {/* Panel expandido */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 w-64 rounded-lg border border-[color:var(--app-border)] bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-[var(--app-ink)]">Tamaño de texto</h3>
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

          {/* Indicador de zoom actual */}
          <div className="mb-4 text-center">
            <div className="text-2xl font-bold text-[var(--app-accent)]">
              {zoomPercentage}%
            </div>
            <div className="text-xs text-[var(--app-muted)]">Tamaño actual</div>
          </div>

          {/* Controles de zoom */}
          <div className="flex gap-2">
            <button
              onClick={decreaseZoom}
              disabled={!canDecreaseZoom}
              className="flex h-10 flex-1 items-center justify-center rounded-md border border-[color:var(--app-border)] bg-white text-[var(--app-ink)] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
              aria-label="Reducir tamaño"
              title="Reducir tamaño"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
              </svg>
            </button>

            <button
              onClick={resetZoom}
              className="flex h-10 flex-1 items-center justify-center rounded-md border border-[color:var(--app-border)] bg-white text-xs font-medium text-[var(--app-ink)] transition hover:bg-gray-50"
              aria-label="Restablecer tamaño"
              title="Restablecer a 100%"
            >
              Restablecer
            </button>

            <button
              onClick={increaseZoom}
              disabled={!canIncreaseZoom}
              className="flex h-10 flex-1 items-center justify-center rounded-md border border-[color:var(--app-border)] bg-white text-[var(--app-ink)] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
              aria-label="Aumentar tamaño"
              title="Aumentar tamaño"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-3 border-t border-[color:var(--app-border)] pt-3 text-xs text-[var(--app-muted)]">
            <p>Ajusta el tamaño del texto para mejorar la lectura.</p>
            <p className="mt-1">Disponible: 100%, 110%, 125%, 150%</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ZoomControl
