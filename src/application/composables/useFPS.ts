import { ref, onUnmounted, getCurrentInstance } from 'vue'

export function useFPS() {
  const fps = ref(0)
  const enabled = ref(false)
  
  let lastTime = performance.now()
  let frameCount = 0
  let animationFrameId: number | null = null
  
  const updateFPS = () => {
    if (!enabled.value) return
    
    frameCount++
    const currentTime = performance.now()
    const delta = currentTime - lastTime
    
    // Update FPS every second
    if (delta >= 1000) {
      fps.value = Math.round((frameCount * 1000) / delta)
      frameCount = 0
      lastTime = currentTime
    }
    
    animationFrameId = requestAnimationFrame(updateFPS)
  }
  
  const start = () => {
    if (enabled.value) return
    enabled.value = true
    lastTime = performance.now()
    frameCount = 0
    fps.value = 0
    animationFrameId = requestAnimationFrame(updateFPS)
  }
  
  const stop = () => {
    enabled.value = false
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    fps.value = 0
  }
  
  // Only register lifecycle hooks if we're in a component context
  const instance = getCurrentInstance()
  if (instance) {
    onUnmounted(() => {
      stop()
    })
  }
  
  return {
    fps,
    enabled,
    start,
    stop
  }
}

