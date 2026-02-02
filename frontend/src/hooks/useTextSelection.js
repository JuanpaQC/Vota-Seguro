import { useState, useEffect } from 'react'

/**
 * Hook para detectar cuando el usuario selecciona texto
 * Retorna el texto seleccionado y las coordenadas para mostrar un botón flotante
 */
export const useTextSelection = () => {
  const [selection, setSelection] = useState({
    text: '',
    x: 0,
    y: 0,
    hasSelection: false
  })

  useEffect(() => {
    const handleSelection = () => {
      const selectedText = window.getSelection()?.toString().trim()
      
      if (selectedText && selectedText.length > 0) {
        const range = window.getSelection()?.getRangeAt(0)
        const rect = range?.getBoundingClientRect()
        
        if (rect) {
          setSelection({
            text: selectedText,
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
            hasSelection: true
          })
        }
      } else {
        setSelection({
          text: '',
          x: 0,
          y: 0,
          hasSelection: false
        })
      }
    }

    document.addEventListener('selectionchange', handleSelection)
    document.addEventListener('mouseup', handleSelection)

    return () => {
      document.removeEventListener('selectionchange', handleSelection)
      document.removeEventListener('mouseup', handleSelection)
    }
  }, [])

  return selection
}
