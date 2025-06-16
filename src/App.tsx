import React, { useEffect, useRef, useState } from 'react'
import { Circle, Group, Layer, Rect, Stage, useStrictMode } from 'react-konva'

// user-defined functions
import gridLayer from './components/GridLayer'
import type { ShapeData, ConnectorData } from './types'
import connectorLayer from './components/ConnectorLayer'
import shapeLayer from './components/ShapeLayer'
// import Konva from 'konva'
// import type { IRect } from 'konva/lib/types'

useStrictMode(true) // force update canvas when there is change

const App = () => {
  // Manage shapes
  const [shapes, setShapes] = useState<ShapeData[]>([]) // manage added shapes
  const history = useRef<ShapeData[][]>([shapes])
  const lastHistoryIndex = useRef(0)
  const resetFlag = useRef(true)

  //#region Handle Ctrl+Shift+Z (undo), Ctrl+Shift+Y (redo)
  useEffect(() => {
    if (resetFlag.current) {
      history.current.push(shapes);
      lastHistoryIndex.current += 1
    }
    resetFlag.current = true
  }, [shapes])


  const handleKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const metaKey = event.ctrlKey || event.metaKey
    if (metaKey && event.shiftKey && event.key.toLowerCase() === 'z') {
      event.preventDefault()
      handleUndo()
    } else if (metaKey && event.shiftKey && event.key.toLowerCase() === 'y') {
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
  //#endregion

  // Handle "infinite" canvas
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  // TODO Return to origin button 
  const back = () => {
    const stage = stageRef.current
    if (!stage) return
    stage.position({
      x: 0,
      y: 0
    })
    setStagePos({ x: 0, y: 0 })
  }

  const canvasRef = useRef<any>(null)

  //#region handle connectors
  const [connectors, setConnectors] = useState<ConnectorData[]>([])
  //#endregion

  //#region handle zoom/scaling
  const stageRef = useRef<any>(null)
  const [scale, setScale] = useState(1)
  const [blockSnapSize, setBlockSnapSize] = useState(30) // block size

  const handleWheel = (e: any) => {
    // if ctrl/meta key is held, zoom, otherwise scroll
    e.evt.preventDefault();
    const isMetaKeyPressed = e.evt.ctrlKey || e.evt.metaKey

    if (!isMetaKeyPressed) {
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
      // if (e.evt.ctrlKey) {
      //   direction = -direction;
      // }

      const scaleBy = 1.01
      let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      if (newScale < 0.5) newScale = 0.5; // minimum scale
      if (newScale > 4) newScale = 4; // maximum scale
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
  }
  //#endregion

  //#region TODO handle ruler
  const rulerRefX = useRef<any>(null)
  const rulerRefY = useRef<any>(null)
  const groupRef = useRef<any>(null)
  const ruler = (fill: string) => {
    const ticks = []
    // const rulerX = rulerRefX.current
    // const rulerY = rulerRefY.current
    // if (!rulerX || !rulerY) return    

    for (let i = 0; i < 800; i += blockSnapSize * scale) {
      ticks.push(
        <Rect
          key={`x-${i}`}
          x={i + stagePos.x}
          y={0}
          width={1}
          height={10}
          fill={'black'}
        />
      )
    }
    for (let i = 0; i < window.innerHeight; i += blockSnapSize * scale) {
      ticks.push(
        <Rect
          key={`y-${i}`}
          x={0}
          y={i + stagePos.y}
          width={10}
          height={1}
          fill={'black'}
        />
      )
    }
    return (
      <Group ref={groupRef}>
        <Group ref={rulerRefX}>
          <Rect
            width={window.innerWidth * 3 / 5}
            height={20}
            stroke={fill}
            fill={fill} />
          {ticks}
        </Group>
        <Group ref={rulerRefY}>
          <Rect
            width={20}
            height={window.innerHeight * 0.95}
            stroke={fill}
            fill={fill} />
          {ticks}
        </Group>
      </Group>
    )
  }
  //#endregion

  //#region handle add shape
  const [isAddShape, setIsAddShape] = useState(false)
  const handleAddShape = () => {
    setIsAddShape(!isAddShape)
    setIsAddPath(false)
    setIsSelected(-1)
  }

  const addShape = (e: any) => {
    if (isAddShape) {
      setShapes((prevShapes: any) => [...prevShapes, {
        id: shapes.length,
        name: `vehicle #${shapes.length}`,
        type: 'circle',
        x: Math.round((e.evt.x - (window.innerWidth / 7) - e.currentTarget.x()) / e.currentTarget.scaleX() / blockSnapSize) * blockSnapSize,
        y: Math.round((e.evt.y - e.currentTarget.y()) / e.currentTarget.scaleY() / blockSnapSize) * blockSnapSize,
        strokeWidth: 1,
        radius: 6,
        fill: 'yellow'
      }])
    }
  }
  //#endregion

  //#region handle connect shape
  const [isAddPath, setIsAddPath] = useState(false)
  const [shapeQueue, setShapeQueue] = useState<number>(-1)
  const handleShapeSelectionAddPath = () => {
    setIsAddPath(!isAddPath)
    setIsAddShape(false)
    setIsSelected(-1)
  }
  const handleAddPath = (shape: ShapeData) => {
    if (!isAddPath) return
    if (shapeQueue === -1) {
      setShapeQueue(shape.id)
    }
    else {
      if (shapeQueue === shape.id) {
        setShapeQueue(-1)
        return
      }
      setConnectors([...connectors, {
        id: connectors.length,
        from: shapeQueue,
        to: shape.id,
        fill: 'black',
        stroke: 'black',
        strokeWidth: 1
      }])
      setShapeQueue(-1)
    }
  }
  //#endregion

  //#region ONGOING handle select shape for information
  const [isSelected, setIsSelected] = useState(-1)
  const handleShapeSelectionViewInfo = (shape: ShapeData) => {
    if (isAddShape || isAddPath) return
    if (isSelected === shape.id) setIsSelected(-1)
    else setIsSelected(shape.id)
  }

  const handleShapeInfoOnClick = (id: number) => {
    setIsAddShape(false)
    setIsAddPath(false)
    if (isSelected === id) setIsSelected(-1)
    else setIsSelected(id)
  }
  //#endregion

  //#region TODO handle select multiple shapes
  const [selectBox, setSelectBox] = useState({
    visible: false,
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0
  })
  //#endregion

  //#region actual component
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      height: '100vh'
    }} onKeyDown={handleKeydown} tabIndex={0}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '0px 20px',
        gap: '10px',
        width: `${innerWidth / 7}`
      }}>
        <h1>Hello World</h1>
        <p>Hello World</p>
        <button onClick={() => {
          setShapes([])
          setConnectors([])
        }}>Clear Shape</button>
        <button onClick={handleAddShape}>Add Shape</button>
        <button onClick={handleShapeSelectionAddPath}>Add Path</button>
        <button onClick={back}>Back</button>
        <p>Add Shape mode: {isAddShape ? 'on' : 'off'}</p>
        <p>Add Path mode: {isAddPath ? 'on' : 'off'}</p>
      </div>
      <div className="canvas" style={{
        display: 'flex'
      }} ref={canvasRef}>
        <Stage
          id='stage'
          width={window.innerWidth * 3 / 5}
          height={window.innerHeight * 0.95}
          draggable={true}
          ref={stageRef}
          onDragMove={(e: any) => {
            console.log(e);
            const group = groupRef.current
              if (group) {
                group.position({
                  x: -e.currentTarget.x() / e.currentTarget.scaleX(),
                  y: -e.currentTarget.y() / e.currentTarget.scaleY(),
                })
                group.scale({
                  x: 1 / e.currentTarget.scaleX(),
                  y: 1 / e.currentTarget.scaleY(),
                })
              }
              // const rulerX = rulerRefX.current
              // const rulerY = rulerRefY.current
          }}
          onDragEnd={(e: any) => {
            setStagePos(e.currentTarget.position())
            const group = groupRef.current
            if (group) {
              group.position({
                x: -e.currentTarget.x() / e.currentTarget.scaleX(),
                y: -e.currentTarget.y() / e.currentTarget.scaleY(),
              })
              group.scale({
                x: 1 / e.currentTarget.scaleX(),
                y: 1 / e.currentTarget.scaleY(),
              })
            }
          }}
          onClick={addShape}
          onWheel={(e) => {
            // setStagePos(e.currentTarget.position())
            handleWheel(e)
            const group = groupRef.current
            if (group) {
              group.position({
                x: -e.currentTarget.x() / e.currentTarget.scaleX(),
                y: -e.currentTarget.y() / e.currentTarget.scaleY(),
              })
              group.scale({
                x: 1 / e.currentTarget.scaleX(),
                y: 1 / e.currentTarget.scaleY(),
              })
            }
          }}
        >
          <Layer>
            {gridLayer(blockSnapSize, window.innerWidth * 3 / 5, window.innerHeight * 0.95, stagePos, scale)}
            {connectorLayer(connectors, shapes, blockSnapSize, scale)}
            {shapeLayer(
              shapes,
              setShapes,
              15,
              handleAddPath,
              handleShapeSelectionViewInfo,
              scale
            )}
          </Layer>
          <Layer>
            {/* {ruler('white')} */}
          </Layer>
          <Layer>
            <Circle x={0} y={0} radius={1} stroke={'black'} />
            {selectBox.visible && (
              <Rect
                x={Math.min(selectBox.x1, selectBox.x2)}
                y={Math.min(selectBox.y1, selectBox.y2)}
                width={Math.abs(selectBox.x2 - selectBox.x1)}
                height={Math.abs(selectBox.y2 - selectBox.y1)}
                fill="rgba(0,0,255,0.5)"
              />
            )}
          </Layer>
        </Stage>
      </div>
      <div style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        // width: window.innerWidth * 9 / 35,
        // height: window.innerHeight * 0.95,
        padding: '0px 10px',
        overflow: 'scroll'
      }}>
        <h1>Information</h1>
        {isSelected === -1 ? shapes.map((shape) => {
          return (
            <div key={shape.id} onClick={() => handleShapeInfoOnClick(shape.id)}>
              <p>{shape.id}: {shape.name}</p>
            </div>
          )
        }) : (
          <div onClick={() => handleShapeInfoOnClick(isSelected)}>
            <p>{shapes[isSelected].id}: {shapes[isSelected].name}</p>
            <p>Deleted: {shapes[isSelected].isDeleted ? "True" : "False"}</p>
          </div>
        )}
      </div>
    </div>
  )
  //#endregion
}

export default App
