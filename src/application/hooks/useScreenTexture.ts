import { useEffect, useRef, useState } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

interface ScreenTextureProps {
  title?: string
  subtitle?: string
  projects?: Array<{ icon: string, label: string, year: string }>
  techStack?: Array<{ icon: string, label: string }>
}

export function useScreenTexture(props: ScreenTextureProps) {
  const [screenTexture, setScreenTexture] = useState<CanvasTexture | null>(null)
  const screenTextureRef = useRef<CanvasTexture | null>(null)
  const debounceTimerRef = useRef<number | null>(null)
  const lastPropsHashRef = useRef('')
  const initializedRef = useRef(false)

  const getPropsHash = () => {
    return JSON.stringify({
      title: props.title,
      subtitle: props.subtitle,
      projects: props.projects,
      techStack: props.techStack
    })
  }

  const createScreenTexture = () => {
    const canvas = document.createElement('canvas')
    const width = 1920
    const height = 1080
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.fillStyle = '#0D1117'
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = '#B87333'
    ctx.fillRect(0, 0, width, 10)

    ctx.fillStyle = '#B87333'
    ctx.font = 'bold 104px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(props.title || 'Maker', width / 2, 138)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '46px sans-serif'
    ctx.globalAlpha = 0.75
    const subtitle = props.subtitle || "J'adore construire et expérimenter, voici quelques uns de mes projets..."
    const subtitleLines = (subtitle.match(/.{1,52}(\s|$)/g) || [subtitle]).slice(0, 2)
    subtitleLines.forEach((line, i) => {
      ctx.fillText(line.trim(), width / 2, 214 + i * 58)
    })
    ctx.globalAlpha = 1

    ctx.fillStyle = '#B87333'
    ctx.font = 'bold 58px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('Projets', 60, 400)

    const projects = props.projects || []
    projects.slice(0, 6).forEach((project, idx) => {
      const x = 60 + (idx % 2) * 920
      const y = 500 + Math.floor(idx / 2) * 160

      ctx.fillStyle = '#B87333'
      ctx.globalAlpha = 0.16
      ctx.beginPath()
      ctx.roundRect(x, y - 66, 880, 126, 14)
      ctx.fill()
      ctx.globalAlpha = 1

      ctx.font = '56px sans-serif'
      ctx.fillText(project.icon, x + 28, y + 4)

      ctx.fillStyle = '#F5E6D3'
      ctx.font = 'bold 46px sans-serif'
      ctx.fillText(project.label, x + 110, y - 6)

      ctx.fillStyle = '#FFFFFF'
      ctx.globalAlpha = 0.45
      ctx.font = '38px sans-serif'
      ctx.fillText(project.year, x + 110, y + 44)
      ctx.globalAlpha = 1
    })

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
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 8
    texture.needsUpdate = true
    return texture
  }

  const updateTexture = () => {
    const currentHash = getPropsHash()

    if (currentHash === lastPropsHashRef.current) {
      return
    }

    lastPropsHashRef.current = currentHash

    if (screenTextureRef.current) {
      screenTextureRef.current.dispose()
    }

    const texture = createScreenTexture()
    screenTextureRef.current = texture
    setScreenTexture(texture)
  }

  const debouncedUpdate = () => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = window.setTimeout(() => {
      updateTexture()
      debounceTimerRef.current = null
    }, 100)
  }

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      lastPropsHashRef.current = getPropsHash()
      const texture = createScreenTexture()
      screenTextureRef.current = texture
      setScreenTexture(texture)
      return
    }
    debouncedUpdate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.title, props.subtitle, props.projects, props.techStack])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      if (screenTextureRef.current) {
        screenTextureRef.current.dispose()
        screenTextureRef.current = null
      }
      initializedRef.current = false
      lastPropsHashRef.current = ''
    }
  }, [])

  return {
    screenTexture
  }
}
