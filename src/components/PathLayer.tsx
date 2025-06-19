import { Arrow, Group } from "react-konva";
import type { GeneralShape } from "../types";

import generatePath from "../utils/GenerateConnector";

const connectorLayer = (
  connectors: GeneralShape[],
  shapes: GeneralShape[],
  handleConnectorSelectionViewInfo: (connector: GeneralShape) => void,
  scale: number
) => {
  return (
    <Group>
      {connectors.map((connector) => {
        if (connector.type !== 'path') return null
        const fromShape = shapes.find((t) => t.id === connector.from)
        const toShape = shapes.find((t) => t.id === connector.to)
        if (!fromShape || !toShape) return null
        const points = generatePath(fromShape, toShape, scale)

        return (
          <Arrow
            id={`${connector.id}`}
            key={connector.id}
            points={points}
            fill={connector.fill}
            stroke={connector.stroke}
            strokeWidth={(connector.strokeWidth || 1) / scale}
            pointerLength={5 / scale}
            pointerWidth={5 / scale}
            onClick={() => handleConnectorSelectionViewInfo(connector)} />
        )
      })}
    </Group>
  )
}

export default connectorLayer