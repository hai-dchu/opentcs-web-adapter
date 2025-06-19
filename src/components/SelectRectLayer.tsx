import { Group, Rect } from "react-konva";
import type { GeneralShape } from "../types";
import generatePath from "../utils/GeneratePath";

const selectRectLayer = (
  shapes: GeneralShape[],
  selectRect: number[],
  scale: number
) => {
  return (
    <Group>
      {selectRect.map((id, index) => {

        const shape = shapes.find((t) => t.id === id)
        if (!shape) return
        switch (shape.type) {
          case 'rect':
            return null
          case 'circle':
            return <Rect
              key={`${index}`}
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
            const [x1, y1, x2, y2] = generatePath(fromShape, toShape)

            const width = 10 / scale
            const angle = Math.atan2(y2 - y1, x2 - x1)
            const shift = angle - Math.PI / 2
            const x = x1 - width / 2 * Math.cos(shift)
            const y = y1 - width / 2 * Math.sin(shift)

            return <Rect
              key={`${index}`}
              x={x}
              y={y}
              width={width}
              height={Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1))}
              stroke={'lightblue'}
              strokeWidth={2 / scale}
              dash={[3 / scale, 3 / scale]}
              rotation={angle * 180 / Math.PI - 90}
            />

          case 'zone':
            return null
          default:
            return null
        }
      })}
    </Group>
  )
}

export default selectRectLayer