import { Arrow, Circle, Group, Rect } from "react-konva";
import type { GeneralShape, Node } from "../types";
import generatePath from "../utils/GeneratePath";
import { select } from "../utils/GlobalFunctions";
import type React from "react";
import type Konva from "konva";

const shapeLayer = (
  shapes: GeneralShape[],
  setShapes: React.Dispatch<React.SetStateAction<GeneralShape[]>>,
  blockSnapSize: number,
  addPath: (node: Node) => void,
  handleShapeSelectionViewInfo: (shape: GeneralShape) => void,
  isDraggable: boolean,
  setSelectRect: React.Dispatch<React.SetStateAction<number[]>>,
  scale: number
) => {
  const handleDragEnd = (id: number, x: number, y: number) => {
    const newShapes = shapes.map(s => s.id === id ? { ...s, x, y } : s

    )
    setShapes(newShapes)
  }
  return (
    <Group>
      {
        shapes.map((shape) => {
          switch (shape.type) {
            case 'rect':
              return (
                <Rect
                  key={shape.id}
                  x={shape.x - shape.width / 2}
                  y={shape.y - shape.height / 2}
                  width={shape.width}
                  height={shape.height}
                  fill={shape.fill || '#000'}
                  stroke={shape.stroke || '#ddd'}
                  strokeWidth={shape.strokeWidth || 2}
                  draggable={isDraggable}
                  onDragEnd={(e) => handleDragEnd(shape.id,
                    Math.round(e.target.x() / blockSnapSize) * blockSnapSize,
                    Math.round(e.target.y() / blockSnapSize) * blockSnapSize
                  )}
                  onClick={(e: Konva.KonvaEventObject<MouseEvent>) => {
                    console.log(e)
                    if (!isDraggable) select(shape, setSelectRect, e.evt.ctrlKey !== null)
                    addPath(shape)
                    handleShapeSelectionViewInfo(shape)
                  }}
                />
              )
            case 'circle':
              return (
                <Circle
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  radius={shape.radius / scale}
                  fill={shape.fill || '#000'}
                  stroke={shape.stroke || '#ddd'}
                  strokeWidth={shape.strokeWidth || 2}
                  draggable={isDraggable}
                  onDragEnd={(e) => handleDragEnd(shape.id,
                    Math.round(e.target.x() / blockSnapSize) * blockSnapSize,
                    Math.round(e.target.y() / blockSnapSize) * blockSnapSize
                  )}
                  onClick={(e: Konva.KonvaEventObject<MouseEvent>) => {
                    if (!isDraggable) select(shape, setSelectRect, e.evt.shiftKey)
                    addPath(shape)
                    handleShapeSelectionViewInfo(shape)
                  }}
                />
              )

            case 'path':
              const fromShape = shapes.find((t) => t.id === shape.from)
              const toShape = shapes.find((t) => t.id === shape.to)
              if (!fromShape || !toShape) return null
              const points = generatePath(fromShape, toShape)

              return (
                <Arrow
                  id={`${shape.id}`}
                  key={shape.id}
                  points={points}
                  fill={shape.fill}
                  stroke={shape.stroke}
                  strokeWidth={(shape.strokeWidth || 1) / scale}
                  pointerLength={5 / scale}
                  pointerWidth={5 / scale}
                  onClick={(e: Konva.KonvaEventObject<MouseEvent>) => {
                    console.log(e)
                    if (!isDraggable) select(shape, setSelectRect, e.evt.ctrlKey !== null)
                    handleShapeSelectionViewInfo(shape)
                  }}
                />
              )
              return null
            default:
              return null
          }
        })
      }
    </Group>
  )
}

export default shapeLayer