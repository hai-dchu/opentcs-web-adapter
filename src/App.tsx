// import React from 'react'
import { useRef, useState } from 'react'
import { Stage, Layer, Rect, Line, Circle, useStrictMode } from 'react-konva'

useStrictMode(true)

type Base = {
  id: number
  x: number
  y: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  draggable?: boolean
}

type RectType = Base & {
  type: 'rect'
  width: number
  height: number
}

type CircleType = Base & {
  type: 'circle'
  radius: number
}

type ShapeData = RectType | CircleType

function App() {
  const width = window.innerWidth
  const height = window.innerHeight
  const blockSnapSize = 30

  document.getElementById('root')?.addEventListener('wheel', event => {
    event.preventDefault()
  })

  const gridLayer = () => {
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


  const [shapes, setShapes] = useState<ShapeData[]>([
    { id: 0, type: 'rect', x: 0, y: 0, width: 30, height: 30 },
    { id: 1, type: 'circle', x: 30, y: 30, radius: 15 },
  ])

  const layerRef = useRef<any>(null)

  const updateShapePosition = (id: number, x: number, y: number) => {
    setShapes(prevShapes =>
      prevShapes.map(s =>
        s.id === id ? { ...s, x, y } : s
      )
    )
  }

  const addRandomShape = () => {
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
    setShapes(prevShapes => [...prevShapes, newShape]);
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1>Hello World</h1>
          <p>Hello World</p>
          <button onClick={addRandomShape}>Add Shape</button>
          <button onClick={() => setShapes([])}>Clear Shape</button>
        </div>
        <div className="canvas" style={{ width: 64 }}>
          <Stage id='stage' ref={layerRef} width={640} height={640} draggable={true}>
            {gridLayer()}
            <Layer>
              {
                shapes.map((shape) => {
                  switch (shape.type) {
                    case 'rect':
                      return (
                        <Rect
                          key={shape.id}
                          x={shape.x + blockSnapSize / 2}
                          y={shape.y + blockSnapSize / 2}
                          width={shape.width}
                          height={shape.height}
                          fill={shape.fill || '#000'}
                          stroke={shape.stroke || '#ddd'}
                          strokeWidth={shape.strokeWidth || 2}
                          draggable={shape.draggable || true}
                          onDragEnd={(e) => updateShapePosition(shape.id,
                            Math.round(e.target.x() / blockSnapSize) * blockSnapSize,
                            Math.round(e.target.y() / blockSnapSize) * blockSnapSize
                          )}
                        />
                      )
                    case 'circle':
                      return (
                        <Circle
                          key={shape.id}
                          x={shape.x}
                          y={shape.y}
                          radius={shape.radius}
                          fill={shape.fill || '#000'}
                          stroke={shape.stroke || '#ddd'}
                          strokeWidth={shape.strokeWidth || 2}
                          draggable={shape.draggable || true}
                          onDragEnd={(e) => updateShapePosition(shape.id,
                            Math.round(e.target.x() / blockSnapSize) * blockSnapSize,
                            Math.round(e.target.y() / blockSnapSize) * blockSnapSize
                          )}
                        />
                      )
                    default:
                      return null
                  }
                })
              }
            </Layer>
          </Stage>
        </div>
      </div>
    </>
  )
}

export default App
