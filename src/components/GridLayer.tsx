import { Layer, Line } from "react-konva"

// draw grid layer
// width: div width
// height: div height
// blockSnapSize: block dimension
const gridLayer = (blockSnapSize: number, width: number, height: number, stagePos: { x: number, y: number }) => {
    const grid = []

    const padding = blockSnapSize
    const startX = Math.floor(-stagePos.x / padding) * padding
    const endX = Math.floor((-stagePos.x + width) / padding) * padding

    const startY = Math.floor(-stagePos.y / padding) * padding
    const endY = Math.floor((-stagePos.y + height) / padding) * padding

    for (let x = startX; x <= endX; x += padding) {
        grid.push({
            key: `v#${x}`,
            points: [x + 0.5, startY, x + 0.5, endY],
            stroke: "#ddd",
            strokeWidth: x === 0 ? 5 : 1,
        })
    }

    for (let y = startY; y <= endY; y += padding) {
        grid.push({
            key: `h#${y}`,
            points: [startX, y + 0.5, endX, y + 0.5],
            stroke: "#ddd",
            strokeWidth: y === 0 ? 5 : 1,
        })
    }
    return (
        <Layer>
            {grid.map((line) => <Line
                key={line.key}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}>
            </Line>)}
        </Layer>
    )
}

export default gridLayer