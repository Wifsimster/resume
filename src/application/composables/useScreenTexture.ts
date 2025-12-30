import { ref, watch, onMounted } from 'vue'
import { CanvasTexture } from 'three'

interface ScreenTextureProps {
  title?: string
  subtitle?: string
  projects?: Array<{ icon: string, label: string, year: string }>
  techStack?: Array<{ icon: string, label: string }>
}

export function useScreenTexture(props: ScreenTextureProps) {
  const screenTexture = ref<CanvasTexture | null>(null)

  const createScreenTexture = () => {
    const canvas = document.createElement('canvas')
    const width = 1920
    const height = 1080
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Background
    ctx.fillStyle = '#0D1117'
    ctx.fillRect(0, 0, width, height)

    // Title
    ctx.fillStyle = '#B87333'
    ctx.font = 'bold 72px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(props.title || 'Maker', width / 2, 120)

    // Subtitle
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '32px sans-serif'
    ctx.globalAlpha = 0.7
    const subtitle = props.subtitle || 'J\'adore construire et expérimenter, voici quelques uns de mes projets...'
    const subtitleLines = subtitle.match(/.{1,60}/g) || [subtitle]
    subtitleLines.forEach((line, i) => {
      ctx.fillText(line, width / 2, 180 + i * 40)
    })
    ctx.globalAlpha = 1

    // Projects section
    ctx.fillStyle = '#B87333'
    ctx.font = 'bold 48px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('Projets', 80, 300)

    // Projects
    const projects = props.projects || []
    projects.forEach((project, idx) => {
      const x = 80 + (idx % 2) * 920
      const y = 380 + Math.floor(idx / 2) * 140

      // Project card background
      ctx.fillStyle = '#B87333'
      ctx.globalAlpha = 0.15
      ctx.fillRect(x, y - 60, 850, 100)
      ctx.globalAlpha = 1

      // Icon
      ctx.font = '40px sans-serif'
      ctx.fillText(project.icon, x + 25, y)

      // Label
      ctx.fillStyle = '#F5E6D3'
      ctx.font = '32px sans-serif'
      ctx.fillText(project.label, x + 80, y)

      // Year
      ctx.fillStyle = '#FFFFFF'
      ctx.globalAlpha = 0.4
      ctx.font = '24px sans-serif'
      ctx.fillText(project.year, x + 25, y + 40)
      ctx.globalAlpha = 1
    })

    // Tech Stack section
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 48px sans-serif'
    ctx.globalAlpha = 0.7
    ctx.fillText('Technologies', 80, 800)
    ctx.globalAlpha = 1

    // Tech Stack
    const techStack = props.techStack || []
    techStack.forEach((tech, idx) => {
      const x = 80 + (idx % 3) * 620
      const y = 880 + Math.floor(idx / 3) * 90

      // Tech badge background
      ctx.fillStyle = '#FFFFFF'
      ctx.globalAlpha = 0.1
      ctx.fillRect(x, y - 35, 580, 60)
      ctx.globalAlpha = 1

      // Icon
      ctx.font = '28px sans-serif'
      ctx.fillText(tech.icon, x + 20, y)

      // Label
      ctx.fillStyle = '#FFFFFF'
      ctx.globalAlpha = 0.6
      ctx.font = '26px sans-serif'
      ctx.fillText(tech.label, x + 65, y)
      ctx.globalAlpha = 1
    })

    const texture = new CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }

  // Update texture when props change
  watch(() => [props.projects, props.techStack, props.title, props.subtitle], () => {
    screenTexture.value = createScreenTexture()
  }, { deep: true })

  onMounted(() => {
    screenTexture.value = createScreenTexture()
  })

  return {
    screenTexture
  }
}

