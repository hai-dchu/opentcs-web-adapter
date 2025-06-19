import type { GeneralShape } from "../types";

// helper function
// shapes: array containing previous shapes
// setShapes: hook for updating shapes
// blockSnapSize: block dimension
// width: div width
// height: div height
const addRandomShape = (
    shapes: GeneralShape[],
    setShapes: React.Dispatch<React.SetStateAction<GeneralShape[]>>,
    blockSnapSize: number,
    width: number,
    height: number
) => {
    const id = shapes.length;
    const x = Math.random() * width;
    const y = Math.random() * height;
    const newShape: GeneralShape = 0.3 > 0.5
        ? {
            id,
            type: 'rect',
            x: Math.round(x / blockSnapSize) * blockSnapSize,
            y: Math.round(y / blockSnapSize) * blockSnapSize,
            strokeWidth: 1,
            width: 12,
            height: 12
        }
        : {
            id,
            type: 'circle',
            x: Math.round(x / blockSnapSize) * blockSnapSize,
            y: Math.round(y / blockSnapSize) * blockSnapSize,
            strokeWidth: 1,
            radius: 6
        };
    setShapes((prevShapes: any) => [...prevShapes, newShape]);
}

export default addRandomShape