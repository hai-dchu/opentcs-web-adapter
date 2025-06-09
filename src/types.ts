type Base = {
  id: number
  x: number
  y: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  draggable?: boolean
}

type RectType = Base & {
  type: 'rect'
  width: number
  height: number
}

type CircleType = Base & {
  type: 'circle'
  radius: number
}

// add more shapes if needed here

export type ShapeData = RectType | CircleType // | more shape here
