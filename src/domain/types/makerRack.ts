export type ServerUnitType = 'freebox' | 'patch-panel' | 'udm-pro' | 'switch' | 'ap' | 'silver-1u' | 'electric-switches' | 'pdu' | 'nas' | 'enclosure' | 'ups' | 'gaming-computer'

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

