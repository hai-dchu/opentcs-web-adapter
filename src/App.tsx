import React, { useEffect, useRef, useState } from 'react'
import { Layer, Stage, useStrictMode } from 'react-konva'

// user-defined functions
import gridLayer from './components/GridLayer'
import type { ShapeData, ConnectorData } from './types'
import addRandomShape from './utils/AddRandomShape'
import connectRandomShapes from './utils/ConnectRandomShape'
import connectorLayer from './components/ConnectorLayer'
import shapeLayer from './components/ShapeLayer'

useStrictMode(true) // force update canvas when there is change

const App = () => {
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

  // Handle snapping (align shape into grid)
  // update shape position after dragging

  // Handle "infinite" canvas
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  // const back = () => {
  //   setStagePos({ x: 0, y: 0 }) // return to origin - not done
  // }

  const canvasRef = useRef<any>(null)

  // handle connectors
  const [connectors, setConnectors] = useState<ConnectorData[]>([])

  const stageRef = useRef<any>(null)
  const [scale, setScale] = useState(1)
  const [blockSnapSize, setBlockSnapSize] = useState(30) // block size

  const handleWheel = (e: any) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    // how to scale? Zoom in? Or zoom out?
    let direction = e.evt.deltaY > 0 ? 1 : -1;

    // when we zoom on trackpad, e.evt.ctrlKey is true
    // in that case lets revert direction
    if (e.evt.ctrlKey) {
      direction = -direction;
    }

    const scaleBy = 1.01;
    let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    if (newScale < 0.5) newScale = 0.5; // minimum scale
    if (newScale > 4) newScale = 4; // maximum scale
    // console.log(newScale);
    const scales = [0.5, 1, 2, 4]
    const index = scales.reduce((prev, curr) => {
      return Math.abs(curr - newScale) < Math.abs(prev - newScale) ? curr : prev
    }, 1)
    setBlockSnapSize(30 / index) // update block size based on scale
    setScale(newScale)

    stage.scale({ x: newScale, y: newScale })

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }} onKeyDown={handleKeydown} tabIndex={0}>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '0px 10px' }}>
        <h1>Hello World</h1>
        <p>Hello World</p>
        <button onClick={() => addRandomShape(shapes, setShapes, blockSnapSize, 800, window.innerHeight)}>Add Shape</button>
        <button onClick={() => connectRandomShapes(shapes, setConnectors)}>Add connectors</button>
        <button onClick={() => {
          setShapes([])
          setConnectors([])
        }}>Clear Shape</button>
      </div>
      <div className="canvas" style={{ display: 'flex' }} ref={canvasRef}>
        <Stage
          id='stage'
          width={800}
          height={window.innerHeight}
          draggable={true}
          ref={stageRef}
          // onDragMove={(e) => {}}
          onDragEnd={(e) => {
            setStagePos(e.currentTarget.position())
          }}
          onWheel={handleWheel}>
          <Layer>
            {gridLayer(blockSnapSize, 800, window.innerHeight, stagePos, scale)}
            {connectorLayer(connectors, shapes, blockSnapSize, scale)}
            {shapeLayer(shapes, setShapes, 7.5, scale)}
          </Layer>
        </Stage>
      </div>
    </div>
  )
}

export default App
