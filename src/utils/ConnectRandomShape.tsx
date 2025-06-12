import type { ConnectorData, ShapeData } from "../types"

const connectRandomShapes = (
    shapes: ShapeData[],
    setConnectors: React.Dispatch<React.SetStateAction<ConnectorData[]>>
) => {
    const number = 10
    const result = []
    while (result.length < number) {
        const from = Math.floor(Math.random() * shapes.length)
        const to = Math.floor(Math.random() * shapes.length)
        if (from == to) continue
        const newConnector: ConnectorData = {
            from,
            to,
            id: result.length,
            fill: "black",
            stroke: "black"
        }
        result.push(newConnector)
    }
    setConnectors(result)
}

export default connectRandomShapes;