import { ref, onMounted, onUnmounted } from 'vue'
import { useAchievements } from './useAchievements'

// Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']

// Secret color themes
export type SecretTheme = 'default' | 'matrix' | 'retro' | 'cyberpunk'

const currentTheme = ref<SecretTheme>('default')
const konamiActivated = ref(false)
const clickCount = ref(0)

export function useEasterEggs() {
  const { unlock } = useAchievements()
  const keySequence = ref<string[]>([])
  
  const handleKeyDown = (event: KeyboardEvent) => {
    keySequence.value.push(event.code)
    
    // Keep only last N keys (N = KONAMI_CODE length)
    if (keySequence.value.length > KONAMI_CODE.length) {
      keySequence.value.shift()
    }
    
    // Check if sequence matches Konami code
    if (keySequence.value.length === KONAMI_CODE.length) {
      const matches = keySequence.value.every((key, index) => key === KONAMI_CODE[index])
      if (matches) {
        activateKonamiCode()
      }
    }
  }
  
  const activateKonamiCode = () => {
    if (!konamiActivated.value) {
      konamiActivated.value = true
      currentTheme.value = 'matrix'
      unlock('codeHunter')
      
      // Apply matrix theme
      document.documentElement.classList.add('theme-matrix')
      
      // Create matrix rain effect
      createMatrixEffect()
      
      console.log('🎮 Konami Code activated! Welcome, gamer.')
    }
  }
  
  const createMatrixEffect = () => {
    const canvas = document.createElement('canvas')
    canvas.id = 'matrix-rain'
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.1;
    `
    document.body.appendChild(canvas)
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789'
    const fontSize = 14
    const columns = canvas.width / fontSize
    const drops: number[] = Array(Math.floor(columns)).fill(1)
    
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = '#00FF41'
      ctx.font = `${fontSize}px monospace`
      
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }
    
    const interval = setInterval(draw, 50)
    
    // Remove after 10 seconds
    setTimeout(() => {
      clearInterval(interval)
      canvas.remove()
      document.documentElement.classList.remove('theme-matrix')
    }, 10000)
  }
  
  const trackClick = () => {
    clickCount.value++
    
    // Secret achievement after 100 clicks
    if (clickCount.value === 100) {
      console.log('🖱️ Click master!')
    }
  }
  
  const setTheme = (theme: SecretTheme) => {
    // Remove all theme classes
    document.documentElement.classList.remove('theme-matrix', 'theme-retro', 'theme-cyberpunk')
    
    if (theme !== 'default') {
      document.documentElement.classList.add(`theme-${theme}`)
    }
    
    currentTheme.value = theme
  }
  
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', trackClick)
  })
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('click', trackClick)
  })
  
  return {
    currentTheme,
    konamiActivated,
    clickCount,
    setTheme
  }
}

