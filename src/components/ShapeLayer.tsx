import { Circle, Group, Rect } from "react-konva";
import type { ShapeData } from "../types";

const shapeLayer = (
    shapes: ShapeData[],
    setShapes: React.Dispatch<React.SetStateAction<ShapeData[]>>,
    blockSnapSize: number,
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
                                    draggable={shape.draggable || true}
                                    onDragEnd={(e) => handleDragEnd(shape.id,
                                        Math.round(e.target.x() / blockSnapSize) * blockSnapSize,
                                        Math.round(e.target.y() / blockSnapSize) * blockSnapSize
                                    )}
                                />
                            )
                        case 'circle':
                            return (
                                <Circle
                                    key={shape.id}
                                    x={shape.x}
                                    y={shape.y}
                                    radius={shape.radius}
                                    fill={shape.fill || '#000'}
                                    stroke={shape.stroke || '#ddd'}
                                    strokeWidth={shape.strokeWidth || 2}
                                    draggable={shape.draggable || true}
                                        // onDragMove={(e) => {
                                        //     handleDragEnd(shape.id, e.target.x(), e.target.y())
                                        // }}
                                    onDragEnd={(e) => handleDragEnd(shape.id,
                                        Math.round(e.target.x() / blockSnapSize) * blockSnapSize,
                                        Math.round(e.target.y() / blockSnapSize) * blockSnapSize
                                    )}
                                />
                            )
                        default:
                            return null
                    }
                })
            }
        </Group>
    )
}

export default shapeLayer