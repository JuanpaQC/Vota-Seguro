import { useTextSelection } from '../../hooks/useTextSelection'
import { useTextToSpeech } from '../../context/TextToSpeechContext'

const ReadSelectedTextButton = () => {
  const selection = useTextSelection()
  const { speak, isSpeaking, pause, resume, isPaused } = useTextToSpeech()

  if (!selection.hasSelection) {
    return null
  }

  const handleReadClick = () => {
    if (isSpeaking) {
      if (isPaused) {
        resume()
      } else {
        pause()
      }
    } else {
      speak(selection.text)
    }
  }

  return (
    <button
      onClick={handleReadClick}
      style={{
        position: 'fixed',
        left: `${selection.x}px`,
        top: `${selection.y}px`,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999
      }}
      className="flex items-center gap-1 rounded-full bg-[var(--app-accent)] px-3 py-1.5 text-sm font-medium text-white shadow-lg transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] focus:ring-offset-2"
      aria-label={isSpeaking ? (isPaused ? 'Reanudar lectura' : 'Pausar lectura') : 'Leer texto seleccionado'}
    >
      {isSpeaking ? (
        isPaused ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                clipRule="evenodd"
              />
            </svg>
            Reanudar
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
                clipRule="evenodd"
              />
            </svg>
            Pausar
          </>
        )
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
            <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
          </svg>
          Leer
        </>
      )}
    </button>
  )
}

export default ReadSelectedTextButton
