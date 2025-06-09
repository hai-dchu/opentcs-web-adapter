import { Layer, Line } from "react-konva"

// draw grid layer
// width: div width
// height: div height
// blockSnapSize: block dimension
const gridLayer = (blockSnapSize: number, width: number, height: number) => {
    var row = []
    var col = []
    const padding = blockSnapSize

    for (var i = 0; i < width / padding; ++i) {
        row.push({
            key: `row#${i}`,
            points: [Math.round(i * padding) + 0.5, 0, Math.round(i * padding) + 0.5, height],
            stroke: "#ddd",
            strokeWidth: 1,
        })
    }

    for (var j = 0; j < height / padding; ++j) {
        col.push({
            key: `col#${j}`,
            points: [0, Math.round(j * padding), width, Math.round(j * padding)],
            stroke: "#ddd",
            strokeWidth: 0.5,
        })
    }
    return (
        <Layer>
            {col.map((line) => <Line
                key={line.key}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}>
            </Line>)}

            {row.map((line) => <Line
                key={line.key}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}>
            </Line>)}

        </Layer>
    )
}

export default gridLayer