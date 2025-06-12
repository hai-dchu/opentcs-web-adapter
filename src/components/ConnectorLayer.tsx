import { Arrow, Group } from "react-konva";
import type { ConnectorData, ShapeData } from "../types";

import generateConnectors from "../utils/GenerateConnector";

const connectorLayer = (
    connectors: ConnectorData[],
    shapes: ShapeData[],
    blockSnapSize: number
) => {
    return (
        <Group>
            {connectors.map((connector) => {
                const fromShape = shapes.find((t) => t.id === connector.from)
                const toShape = shapes.find((t) => t.id === connector.to)
                if (!fromShape || !toShape) return null
                const points = generateConnectors(fromShape, toShape, blockSnapSize)

                return (
                    <Arrow
                        id={`${connector.id}`}
                        key={connector.id}
                        points={points}
                        fill={connector.fill}
                        stroke={connector.stroke} />
                )
            })}
        </Group>
    )
}

export default connectorLayer