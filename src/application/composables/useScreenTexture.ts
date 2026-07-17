import { ref, watch, onMounted, onUnmounted } from 'vue'
import { CanvasTexture, SRGBColorSpace } from 'three'

interface ScreenTextureProps {
  title?: string
  subtitle?: string
  projects?: Array<{ icon: string, label: string, year: string }>
  techStack?: Array<{ icon: string, label: string }>
}

export function useScreenTexture(props: ScreenTextureProps) {
  const screenTexture = ref<CanvasTexture | null>(null)
  let debounceTimer: number | null = null
  let lastPropsHash = ''

  // Create a hash of props to detect actual changes
  const getPropsHash = () => {
    return JSON.stringify({
      title: props.title,
      subtitle: props.subtitle,
      projects: props.projects,
      techStack: props.techStack
    })
  }

  // The screen plane covers only a few hundred on-screen pixels, so the layout
  // is deliberately LARGE: big type and roomy rows read clearly at that size,
  // where the previous dense 26-32px layout blurred into noise.
  const createScreenTexture = () => {
    const canvas = document.createElement('canvas')
    const width = 1920
    const height = 1080
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Background with a subtle top accent bar
    ctx.fillStyle = '#0D1117'
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = '#B87333'
    ctx.fillRect(0, 0, width, 10)

    // Title
    ctx.fillStyle = '#B87333'
    ctx.font = 'bold 104px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(props.title || 'Maker', width / 2, 138)

    // Subtitle (max 2 lines, large)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '46px sans-serif'
    ctx.globalAlpha = 0.75
    const subtitle = props.subtitle || "J'adore construire et expérimenter, voici quelques uns de mes projets..."
    const subtitleLines = (subtitle.match(/.{1,52}(\s|$)/g) || [subtitle]).slice(0, 2)
    subtitleLines.forEach((line, i) => {
      ctx.fillText(line.trim(), width / 2, 214 + i * 58)
    })
    ctx.globalAlpha = 1

    // Projects section
    ctx.fillStyle = '#B87333'
    ctx.font = 'bold 58px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('Projets', 60, 400)

    const projects = props.projects || []
    projects.slice(0, 6).forEach((project, idx) => {
      const x = 60 + (idx % 2) * 920
      const y = 500 + Math.floor(idx / 2) * 160

      // Project card background
      ctx.fillStyle = '#B87333'
      ctx.globalAlpha = 0.16
      ctx.beginPath()
      ctx.roundRect(x, y - 66, 880, 126, 14)
      ctx.fill()
      ctx.globalAlpha = 1

      // Icon
      ctx.font = '56px sans-serif'
      ctx.fillText(project.icon, x + 28, y + 4)

      // Label
      ctx.fillStyle = '#F5E6D3'
      ctx.font = 'bold 46px sans-serif'
      ctx.fillText(project.label, x + 110, y - 6)

      // Year
      ctx.fillStyle = '#FFFFFF'
      ctx.globalAlpha = 0.45
      ctx.font = '38px sans-serif'
      ctx.fillText(project.year, x + 110, y + 44)
      ctx.globalAlpha = 1
    })

    // Tech stack: one row of large badges along the bottom
    const techStack = (props.techStack || []).slice(0, 6)
    techStack.forEach((tech, idx) => {
      const x = 60 + idx * 305
      const y = 1010

      ctx.fillStyle = '#FFFFFF'
      ctx.globalAlpha = 0.1
      ctx.beginPath()
      ctx.roundRect(x, y - 48, 285, 72, 12)
      ctx.fill()
      ctx.globalAlpha = 1

      ctx.font = '38px sans-serif'
      ctx.fillText(tech.icon, x + 18, y + 4)

      ctx.fillStyle = '#FFFFFF'
      ctx.globalAlpha = 0.7
      ctx.font = '30px sans-serif'
      ctx.fillText(tech.label, x + 72, y + 2)
      ctx.globalAlpha = 1
    })

    const texture = new CanvasTexture(canvas)
    // sRGB tag keeps the colours true (untagged canvas textures render washed
    // out), and anisotropy keeps the text crisp at the camera's oblique angle.
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 8
    texture.needsUpdate = true
    return texture
  }

  // Update texture when props actually change (with debouncing)
  const updateTexture = () => {
    const currentHash = getPropsHash()
    
    // Only recreate if props actually changed
    if (currentHash === lastPropsHash) {
      return
    }
    
    lastPropsHash = currentHash
    
    // Dispose of old texture
    if (screenTexture.value) {
      screenTexture.value.dispose()
    }
    
    // Create new texture
    screenTexture.value = createScreenTexture()
  }

  // Debounced update function
  const debouncedUpdate = () => {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = window.setTimeout(() => {
      updateTexture()
      debounceTimer = null
    }, 100) // 100ms debounce
  }

  // Watch for prop changes with proper change detection
  watch(() => [props.projects, props.techStack, props.title, props.subtitle], () => {
    debouncedUpdate()
  }, { deep: true })

  onMounted(() => {
    lastPropsHash = getPropsHash()
    screenTexture.value = createScreenTexture()
  })

  onUnmounted(() => {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer)
    }
    if (screenTexture.value) {
      screenTexture.value.dispose()
    }
  })

  return {
    screenTexture
  }
}

