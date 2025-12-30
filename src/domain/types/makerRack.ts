export type ServerUnitType = 'freebox' | 'udm-pro' | 'switch' | 'ap' | 'silver-1u' | 'pdu' | 'nas' | 'enclosure' | 'ups'

export interface ServerUnit {
  id: string
  name: string
  description: string
  y: number
  height: number
  color: string
  type: ServerUnitType
  meshRef?: any
}

