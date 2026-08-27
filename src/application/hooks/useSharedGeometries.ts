import { BoxGeometry, SphereGeometry, CylinderGeometry, PlaneGeometry } from 'three'
import { MeshStandardMaterial, MeshBasicMaterial } from 'three'

// Shared geometries - created once and reused
// Using lower segment counts for better performance (4x4 instead of 6x6 for LEDs)
export const sharedGeometries = {
  // Small LED spheres (most common) - reduced segments for tiny objects
  smallLED: new SphereGeometry(0.02, 4, 4),
  tinyLED: new SphereGeometry(0.015, 4, 4),
  microLED: new SphereGeometry(0.01, 4, 4),

  // Small boxes for details
  smallBox: new BoxGeometry(0.05, 0.05, 0.05),
  tinyBox: new BoxGeometry(0.03, 0.03, 0.03),

  // Small cylinders - reduced segments
  smallCylinder: new CylinderGeometry(0.04, 0.04, 0.01, 12),

  // Small planes
  smallPlane: new PlaneGeometry(0.1, 0.1)
}

// Shared materials - created once and reused where properties match
// IMPORTANT: Do not clone these - reuse directly for maximum GPU batching
export const sharedMaterials = {
  // Dark metal materials for rack frames
  darkMetal: new MeshStandardMaterial({
    color: '#0A0A0A',
    roughness: 0.9,
    metalness: 0.1
  }),

  darkMetal2: new MeshStandardMaterial({
    color: '#1A1A1A',
    roughness: 0.8,
    metalness: 0.8
  }),

  darkMetal3: new MeshStandardMaterial({
    color: '#2D2D2D',
    roughness: 0.7,
    metalness: 0.6
  }),

  // LED materials - pre-created for common colors
  ledGreen: new MeshBasicMaterial({
    color: '#00FF00',
    transparent: true
  }),

  ledBlue: new MeshBasicMaterial({
    color: '#0088FF',
    transparent: true
  }),

  ledOrange: new MeshBasicMaterial({
    color: '#FF8800',
    transparent: true
  }),

  ledRed: new MeshBasicMaterial({
    color: '#FF0000',
    transparent: true
  }),

  ledWhite: new MeshBasicMaterial({
    color: '#FFFFFF',
    transparent: true
  }),

  ledYellow: new MeshBasicMaterial({
    color: '#FFFF00',
    transparent: true
  })
}

// Helper to get shared material - returns directly, NO cloning for performance
export function getSharedMaterial(key: keyof typeof sharedMaterials) {
  return sharedMaterials[key]
}

// Helper to get shared geometry
export function getSharedGeometry(key: keyof typeof sharedGeometries) {
  return sharedGeometries[key]
}
