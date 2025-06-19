import type { ConnectorData, GeneralShape } from "../types"

const connectRandomShapes = (
    shapes: GeneralShape[],
    setConnectors: React.Dispatch<React.SetStateAction<ConnectorData[]>>
) => {
    const number = 30
    const result = []
    if (shapes.length <= 0) return
    while (result.length < number) {
        const from = Math.floor(Math.random() * shapes.length)
        const to = Math.floor(Math.random() * shapes.length)
        if (from == to) continue
        const newConnector: ConnectorData = {
            from,
            to,
            id: result.length,
            fill: "black",
            stroke: "black",
            strokeWidth: 1
        }
        result.push(newConnector)
    }
    setConnectors(result)
}

export default connectRandomShapes;