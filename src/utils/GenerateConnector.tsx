import type { ShapeData } from "../types";

const generateConnectors = (
    from: ShapeData,
    to: ShapeData,
    scale: number
) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    let angle = Math.atan2(-dy, dx);

    let fromRadius = 0
    let toRadius = 0
    let fromShift = 0
    let toShift = 0
    if (from.type === 'rect') {
        fromRadius += Math.sqrt(from.width * from.width + from.height * from.height) / 2
        fromShift += from.width / 2
    } else {
        fromRadius += from.radius
        fromShift += 0
    }

    if (to.type === 'rect') {
        toRadius += Math.sqrt(to.width * to.width + to.height * to.height) / 2
        toShift += to.width / 2
    } else {
        toRadius += to.radius
        fromShift += 0
    }

    return [
        from.x + -fromRadius * Math.cos(angle + Math.PI) + fromShift,
        from.y + fromRadius * Math.sin(angle + Math.PI) + fromShift,
        to.x + -toRadius * Math.cos(angle) + toShift,
        to.y + toRadius * Math.sin(angle) + toShift,
    ]
}

export default generateConnectors