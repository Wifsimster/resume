import type { ServerUnit } from '../types/makerRack'

export const rackUnits: ServerUnit[] = [
  {
    id: 'freebox',
    name: 'maker.rackUnits.freebox.name',
    description: 'maker.rackUnits.freebox.description',
    y: 2.95,
    height: 0.1,
    color: '#1A1A1A',
    type: 'freebox'
  },
  {
    id: 'patch-panel',
    name: 'maker.rackUnits.patchPanel.name',
    description: 'maker.rackUnits.patchPanel.description',
    y: 2.85,
    height: 0.1,
    color: '#1A1A1A',
    type: 'patch-panel'
  },
  {
    id: 'udm-pro',
    name: 'maker.rackUnits.udmPro.name',
    description: 'maker.rackUnits.udmPro.description',
    y: 2.75,
    height: 0.1,
    color: '#FFFFFF',
    type: 'udm-pro'
  },
  {
    id: 'switch',
    name: 'maker.rackUnits.switch.name',
    description: 'maker.rackUnits.switch.description',
    y: 2.65,
    height: 0.1,
    color: '#FFFFFF',
    type: 'switch'
  },
  {
    id: 'silver-1u',
    name: 'maker.rackUnits.silver1u.name',
    description: 'maker.rackUnits.silver1u.description',
    y: 2.45,
    height: 0.1,
    color: '#C0C0C0',
    type: 'silver-1u'
  },
  {
    id: 'electric-switches',
    name: 'maker.rackUnits.electricSwitches.name',
    description: 'maker.rackUnits.electricSwitches.description',
    y: 2.35,
    height: 0.1,
    color: '#1A1A1A',
    type: 'electric-switches'
  },
  {
    id: 'gaming-computer',
    name: 'maker.rackUnits.gamingComputer.name',
    description: 'maker.rackUnits.gamingComputer.description',
    y: 2.0,
    height: 0.4,
    color: '#1A1A1A',
    type: 'gaming-computer'
  },
  {
    id: 'nas',
    name: 'maker.rackUnits.nas.name',
    description: 'maker.rackUnits.nas.description',
    y: 1.0,
    height: 0.4,
    color: '#1A1A1A',
    type: 'nas'
  },
  {
    id: 'ups',
    name: 'maker.rackUnits.ups.name',
    description: 'maker.rackUnits.ups.description',
    y: 0.2,
    height: 0.2,
    color: '#1A1A1A',
    type: 'ups'
  }
]

export const makerColors = {
  electronics: '#00979D',
  led: '#FF6B35',
  wood: '#5D4037',
  wifi: '#03A9F4',
  serverBlue: '#1565C0',
  serverGreen: '#4CAF50',
  serverRed: '#F44336',
  metal: '#37474F',
  darkMetal: '#1A1A1A',
  screenGlow: '#6366F1'
}

