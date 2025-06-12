import React, { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Circle, useStrictMode } from 'react-konva'

// user-defined functions
import gridLayer from './components/GridLayer'
import type { ShapeData, ConnectorData } from './types'
import addRandomShape from './utils/AddRandomShape'
import connectRandomShapes from './utils/ConnectRandomShape'
import connectorLayer from './components/ConnectorLayer'

useStrictMode(true) // force update canvas when there is change


const App = () => {
  const width = window.innerWidth
  const height = window.innerHeight
  const blockSnapSize = 30 // block size

  // document.getElementById('root')?.addEventListener('wheel', event => {
  //   event.preventDefault() // disable scrolling
  // })

  // Manage shapes
  const [shapes, setShapes] = useState<ShapeData[]>([]) // manage added shapes
  const history = useRef<ShapeData[][]>([shapes])
  const lastHistoryIndex = useRef(0)
  const resetFlag = useRef(true)

  useEffect(() => {
    if (resetFlag.current) {
      history.current.push(shapes);
      lastHistoryIndex.current += 1
    }
    resetFlag.current = true
  }, [shapes])


  // Handle Ctrl+Shift+Z, Ctrl+Shift+Y and possible other keybinds in the future
  const handleKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'z') {
      event.preventDefault()
      handleUndo()
    } else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'y') {
      event.preventDefault()
      handleRedo()
    }
  }

  const handleUndo = () => {
    if (lastHistoryIndex.current <= 0) return

    const previous = history.current[lastHistoryIndex.current - 1]
    lastHistoryIndex.current -= 1
    resetFlag.current = false
    setShapes(previous)
  }

  const handleRedo = () => {
    if (lastHistoryIndex.current >= history.current.length - 1) return

    const next = history.current[lastHistoryIndex.current + 1]
    lastHistoryIndex.current += 1
    resetFlag.current = false
    setShapes(next)
  }

  // Handle snapping (aline shape into grid)
  // update shape position after dragging
  const handleDragEnd = (id: number, x: number, y: number) => {
    const newShapes = shapes.map(s => s.id === id ? { ...s, x, y } : s

    )
    setShapes(newShapes)
  }

  // Handle "infinite" canvas
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  // const back = () => {
  //   setStagePos({ x: 0, y: 0 }) // return to origin - not done
  // }

  const canvasRef = useRef<any>(null)

  const [connectors, setConnectors] = useState<ConnectorData[]>([])

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }} onKeyDown={handleKeydown} tabIndex={0}>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '0px 10px' }}>
        <h1>Hello World</h1>
        <p>Hello World</p>
        <button onClick={() => addRandomShape(shapes, setShapes, blockSnapSize, width, height)}>Add Shape</button>
        <button onClick={() => connectRandomShapes(shapes, setConnectors)}>Add connectors</button>
        <button onClick={() => {
          setShapes([])
          setConnectors([])
        }}>Clear Shape</button>
        {/* <button onClick={back}>Back</button> */}
      </div>
      <div className="canvas" style={{ display: 'flex' }} ref={canvasRef}>
        <Stage
          id='stage'
          width={width}
          height={height}
          draggable={true}
          ref={canvasRef}
          onDragEnd={(e) => {
            setStagePos(e.currentTarget.position())
          }}>
          {gridLayer(blockSnapSize, width, height, stagePos)}
          {connectorLayer(connectors, shapes, blockSnapSize)}
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
                        onDragEnd={(e) => handleDragEnd(shape.id,
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
                        onDragEnd={(e) => handleDragEnd(shape.id,
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
  )
}

export default App
