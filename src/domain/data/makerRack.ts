import type { ServerUnit } from '../types/makerRack'

export const rackUnits: ServerUnit[] = [
  {
    id: 'freebox',
    name: 'maker.rackUnits.freebox.name',
    description: 'maker.rackUnits.freebox.description',
    y: 3.25,
    height: 0.1,
    color: '#1A1A1A',
    type: 'freebox'
  },
  {
    id: 'udm-pro',
    name: 'maker.rackUnits.udmPro.name',
    description: 'maker.rackUnits.udmPro.description',
    y: 3.15,
    height: 0.1,
    color: '#FFFFFF',
    type: 'udm-pro'
  },
  {
    id: 'switch',
    name: 'maker.rackUnits.switch.name',
    description: 'maker.rackUnits.switch.description',
    y: 3.05,
    height: 0.1,
    color: '#FFFFFF',
    type: 'switch'
  },
  {
    id: 'ap',
    name: 'maker.rackUnits.ap.name',
    description: 'maker.rackUnits.ap.description',
    y: 2.95,
    height: 0.1,
    color: '#FFFFFF',
    type: 'ap'
  },
  {
    id: 'silver-1u',
    name: 'maker.rackUnits.silver1u.name',
    description: 'maker.rackUnits.silver1u.description',
    y: 2.85,
    height: 0.1,
    color: '#C0C0C0',
    type: 'silver-1u'
  },
  {
    id: 'pdu',
    name: 'maker.rackUnits.pdu.name',
    description: 'maker.rackUnits.pdu.description',
    y: 2.7,
    height: 0.2,
    color: '#1A1A1A',
    type: 'pdu'
  },
  {
    id: 'nas',
    name: 'maker.rackUnits.nas.name',
    description: 'maker.rackUnits.nas.description',
    y: 2.5,
    height: 0.2,
    color: '#1A1A1A',
    type: 'nas'
  },
  {
    id: 'enclosure',
    name: 'maker.rackUnits.enclosure.name',
    description: 'maker.rackUnits.enclosure.description',
    y: 2.3,
    height: 0.2,
    color: '#1A1A1A',
    type: 'enclosure'
  },
  {
    id: 'ups',
    name: 'maker.rackUnits.ups.name',
    description: 'maker.rackUnits.ups.description',
    y: 2.1,
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

