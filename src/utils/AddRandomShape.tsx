import type { ShapeData } from "../types";

// helper function
// shapes: array containing previous shapes
// setShapes: hook for updating shapes
// blockSnapSize: block dimension
// width: div width
// height: div height
const addRandomShape = (
    shapes: ShapeData[],
    setShapes: React.Dispatch<React.SetStateAction<ShapeData[]>>,
    blockSnapSize: number,
    width: number,
    height: number
) => {
    const id = shapes.length;
    const x = Math.random() * width;
    const y = Math.random() * height;
    const newShape: ShapeData = Math.random() > 0.5
        ? {
            id,
            type: 'rect',
            x: Math.round(x / blockSnapSize) * blockSnapSize,
            y: Math.round(y / blockSnapSize) * blockSnapSize,
            width: 30,
            height: 30
        }
        : {
            id,
            type: 'circle',
            x: Math.round(x / blockSnapSize) * blockSnapSize,
            y: Math.round(y / blockSnapSize) * blockSnapSize,
            radius: 15
        };
    setShapes((prevShapes: any) => [...prevShapes, newShape]);
}

export default addRandomShape