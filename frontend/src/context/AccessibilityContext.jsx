import { createContext, useContext, useState, useEffect } from 'react'

const AccessibilityContext = createContext()

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}

export const AccessibilityProvider = ({ children }) => {
  // Niveles de zoom: 100%, 110%, 125%, 150%
  const zoomLevels = [1, 1.1, 1.25, 1.5]
  const [zoomLevel, setZoomLevel] = useState(() => {
    const saved = localStorage.getItem('app-zoom-level')
    return saved ? parseFloat(saved) : 1
  })

  useEffect(() => {
    localStorage.setItem('app-zoom-level', zoomLevel.toString())
    document.documentElement.style.fontSize = `${zoomLevel * 16}px`
  }, [zoomLevel])

  const increaseZoom = () => {
    const currentIndex = zoomLevels.indexOf(zoomLevel)
    if (currentIndex < zoomLevels.length - 1) {
      setZoomLevel(zoomLevels[currentIndex + 1])
    }
  }

  const decreaseZoom = () => {
    const currentIndex = zoomLevels.indexOf(zoomLevel)
    if (currentIndex > 0) {
      setZoomLevel(zoomLevels[currentIndex - 1])
    }
  }

  const resetZoom = () => {
    setZoomLevel(1)
  }

  const value = {
    zoomLevel,
    increaseZoom,
    decreaseZoom,
    resetZoom,
    canIncreaseZoom: zoomLevel < zoomLevels[zoomLevels.length - 1],
    canDecreaseZoom: zoomLevel > zoomLevels[0],
    zoomPercentage: Math.round(zoomLevel * 100)
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}
