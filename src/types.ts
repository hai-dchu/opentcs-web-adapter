type Data = {
  id: number
  name: string,
  isDeleted: false,
  // ... TODO other attributes here
}

type Shape = {
  fill?: string
  stroke?: string
  strokeWidth?: number
  draggable?: boolean
}

type Rect = Shape & Data & {
  x: number
  y: number
  type: 'rect'
  width: number
  height: number
}

type Circle = Shape & Data & {
  x: number
  y: number
  type: 'circle'
  radius: number
}

export type Node = Rect | Circle

export type Path = Shape & Data & {
  type: 'path'
  from: number // node id
  to: number // node id
  distance: number
}

export type Zone = Data & {
  type: 'zone'
  rows: number
  cols: number
  distanceRow: number
  distanceCol: number
  x: number
  y: number
}

// add more shapes if needed here

export type GeneralShape = Node | Path | Zone // | more shape here