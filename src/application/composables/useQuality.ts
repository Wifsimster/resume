import { ref, watch } from 'vue'

export type QualityLevel = 'low' | 'high'

const STORAGE_KEY = 'wifsimster_quality'

// Detect initial quality based on device
const detectQuality = (): QualityLevel => {
  // Check localStorage first
  const saved = localStorage.getItem(STORAGE_KEY) as QualityLevel | null
  if (saved === 'low' || saved === 'high') return saved
  
  // Check for low-power devices
  const isLowPower = 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    navigator.hardwareConcurrency <= 4
  
  return isLowPower ? 'low' : 'high'
}

const quality = ref<QualityLevel>(detectQuality())

// Save to localStorage when quality changes
watch(quality, (newQuality) => {
  localStorage.setItem(STORAGE_KEY, newQuality)
})

export function useQuality() {
  const toggleQuality = () => {
    quality.value = quality.value === 'low' ? 'high' : 'low'
    return quality.value
  }
  
  const setQuality = (level: QualityLevel) => {
    quality.value = level
  }
  
  const isHighQuality = () => quality.value === 'high'
  
  return {
    quality,
    toggleQuality,
    setQuality,
    isHighQuality
  }
}

