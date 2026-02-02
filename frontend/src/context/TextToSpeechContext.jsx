import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const TextToSpeechContext = createContext()

export const useTextToSpeech = () => {
  const context = useContext(TextToSpeechContext)
  if (!context) {
    throw new Error('useTextToSpeech must be used within TextToSpeechProvider')
  }
  return context
}

export const TextToSpeechProvider = ({ children }) => {
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [rate, setRate] = useState(1) // Velocidad: 0.5 a 2
  const [pitch, setPitch] = useState(1) // Tono: 0 a 2
  const utteranceRef = useRef(null)

  // Verificar soporte y cargar voces
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true)
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices()
        setVoices(availableVoices)
        
        // Seleccionar voz en español por defecto
        const spanishVoice = availableVoices.find(
          voice => voice.lang.startsWith('es')
        )
        if (spanishVoice && !selectedVoice) {
          setSelectedVoice(spanishVoice)
        }
      }

      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [selectedVoice])

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speak = useCallback((text) => {
    if (!isSupported || !text) return

    // Cancelar cualquier lectura anterior
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance

    if (selectedVoice) {
      utterance.voice = selectedVoice
    }
    utterance.rate = rate
    utterance.pitch = pitch

    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
    }

    utterance.onerror = (event) => {
      console.error('Error en Text-to-Speech:', event)
      setIsSpeaking(false)
      setIsPaused(false)
    }

    window.speechSynthesis.speak(utterance)
  }, [isSupported, selectedVoice, rate, pitch])

  const pause = useCallback(() => {
    if (window.speechSynthesis && isSpeaking && !isPaused) {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }, [isSpeaking, isPaused])

  const resume = useCallback(() => {
    if (window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    }
  }, [isPaused])

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setIsPaused(false)
    }
  }, [])

  const value = {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    pitch,
    setPitch,
    speak,
    pause,
    resume,
    stop
  }

  return (
    <TextToSpeechContext.Provider value={value}>
      {children}
    </TextToSpeechContext.Provider>
  )
}
