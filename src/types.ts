type Base = {
  id: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  draggable?: boolean
}

type RectType = Base & {
  x: number
  y: number
  type: 'rect'
  width: number
  height: number
}

type CircleType = Base & {
  x: number
  y: number
  type: 'circle'
  radius: number
}

type ConnectorType = {
  id: number
  from: number
  to: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  draggable?: boolean
}

// add more shapes if needed here

export type ShapeData = RectType | CircleType // | more shape here
export type ConnectorData = ConnectorType