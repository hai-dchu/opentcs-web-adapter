import { Group, Rect } from "react-konva"
import type { Zone } from "../types"

const zoneLayer = (
    zones: Zone[],
    setZones: React.Dispatch<React.SetStateAction<Zone[]>>,
    blockSnapSize: number,
    scale: number
) => {
    return (
        <Group>
            {zones.map((zone) => {
                const width = zone.cols * blockSnapSize + blockSnapSize / 2
                const height = zone.rows * blockSnapSize + blockSnapSize / 2
                const centerX = zone.x - (width / 2) - blockSnapSize / 2
                const centerY = zone.y - (height / 2) - blockSnapSize / 2
                return (
                    <Rect
                        key={zone.id}
                        x={centerX}
                        y={centerY}
                        width={width}
                        height={height}
                        stroke={'black'}
                        dash={[5, 5]}
                        strokeWidth={2 / scale}
                        draggable={true}
                        onDragEnd={(e: any) => {
                            const newZones = zones.map((z) => {
                                if (z.id === zone.id) {
                                    return {
                                        ...z,
                                        x: Math.round((e.target.x() + width / 2) / blockSnapSize) * blockSnapSize,
                                        y: Math.round((e.target.y() + height / 2) / blockSnapSize) * blockSnapSize,
                                    }
                                }
                                return z
                            })
                            setZones(newZones)
                        }}
                    />
                )
            })}
        </Group>
    )
}

export default zoneLayer