import { useRef, useState } from 'react'
import { Stage, Layer, Rect, Circle, useStrictMode } from 'react-konva'

// user-defined functions
import gridLayer from './components/GridLayer'
import type { ShapeData } from './types'
import addRandomShape from './utils/AddRandomShape'

useStrictMode(true) // force update canvas when there is change

const App = () => {
  const width = window.innerWidth
  const height = window.innerHeight
  const blockSnapSize = 30 // block size

  document.getElementById('root')?.addEventListener('wheel', event => {
    event.preventDefault() // disable scrolling
  })

  const [shapes, setShapes] = useState<ShapeData[]>([
    { id: 0, type: 'rect', x: 0, y: 0, width: 30, height: 30 },
    { id: 1, type: 'circle', x: 30, y: 30, radius: 15 },
  ]) // manage added shapes

  const layerRef = useRef<any>(null)

  // update shape position after dragging
  const updateShapePosition = (id: number, x: number, y: number) => {
    setShapes(prevShapes =>
      prevShapes.map(s =>
        s.id === id ? { ...s, x, y } : s
      )
    )
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1>Hello World</h1>
          <p>Hello World</p>
          <button onClick={() => addRandomShape(shapes, setShapes, blockSnapSize, width, height)}>Add Shape</button>
          <button onClick={() => setShapes([])}>Clear Shape</button>
        </div>
        <div className="canvas" style={{ width: 64 }}>
          <Stage id='stage' ref={layerRef} width={640} height={640} draggable={true}>
            {gridLayer(blockSnapSize, width, height)}
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
