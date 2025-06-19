import { Rect } from "react-konva";
import type { GeneralShape } from "../types";
import generatePath from "../utils/GenerateConnector";

{/* <Layer>
{selectRect !== null ? (
    <Rect
    x={selectRect.x}
    y={selectRect.y}
    width={selectRect.width}
    height={selectRect.height}
    stroke={selectRect.stroke}
    strokeWidth={selectRect.strokeWidth}
    dash={selectRect.dash}
    />
) : (null)}
</Layer> */}

const selectRectLayer = (
  shapes: GeneralShape[],
  selectRect: number,
  scale: number
) => {
  const shape = shapes.find((t) => t.id === selectRect)
  if (!shape) return
  switch (shape.type) {
    case 'rect':
      return null
    case 'circle':
      return <Rect
        x={shape.x - shape.radius / scale - 4 / scale}
        y={shape.y - shape.radius / scale - 4 / scale}
        width={2 * shape.radius / scale + 8 / scale}
        height={2 * shape.radius / scale + 8 / scale}
        stroke={'lightblue'}
        strokeWidth={2 / scale}
        dash={[3 / scale, 3 / scale]}
      />
    case 'path':
      const fromShape = shapes.find((t) => t.id === shape.from)
      const toShape = shapes.find((t) => t.id === shape.to)
      if (!fromShape || !toShape) return null
      const points = generatePath(fromShape, toShape, scale)

      return <Rect
        x={points[0]}
        y={points[1]}
        width={(points[2] - points[0])}
        height={(points[3] - points[1])}
        stroke={'lightblue'}
        strokeWidth={2 / scale}
        dash={[3 / scale, 3 / scale]}
      />
    case 'zone':
      return null
    default:
      return null
  }
}

export default selectRectLayer