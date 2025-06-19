import { useEffect, useRef, useState } from 'react'
import { Circle, Group, Layer, Rect, Stage, useStrictMode } from 'react-konva'

// user-defined functions
import gridLayer from './components/GridLayer'
import type { GeneralShape, Path, Zone } from './types'
import shapeLayer from './components/GeneralShapeLayer'
import zoneLayer from './components/ZoneLayer'
import { undoRedo } from './utils/GlobalFunctions'

useStrictMode(true) // force update canvas when there is change

const AppTemp = () => {
  // Manage shapes
  const [isDraggable, setIsDraggable] = useState(true)

  //#region Handle Ctrl+Shift+Z (undo), Ctrl+Shift+Y (redo)
  const [generalShapes, setGeneralShapes] = useState<GeneralShape[]>([]) // manage added shapes
  const history = useRef<GeneralShape[][]>([generalShapes])
  const lastHistoryIndex = useRef(0)
  const resetFlag = useRef(true)

  useEffect(() => {
    if (resetFlag.current) {
      history.current.push(generalShapes);
      lastHistoryIndex.current += 1
    }
    resetFlag.current = true
  }, [generalShapes])
  //#endregion

  // Handle "infinite" canvas
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  // #region return to origin button 
  const back = () => {
    const stage = stageRef.current
    if (!stage) return
    stage.position({
      x: 0,
      y: 0
    })
    setStagePos({ x: 0, y: 0 })
  }
  //#endregion

  const canvasRef = useRef<any>(null)

  //#region handle paths
  const [paths, setPaths] = useState<Path[]>([])
  //#endregion

  //#region handle zoom/scaling
  const stageRef = useRef<any>(null)
  const [scale, setScale] = useState(4)
  const [blockSnapSize, setBlockSnapSize] = useState(7.5) // block size

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

      const scaleBy = 1.01
      let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      if (newScale < 0.5) newScale = 0.5; // minimum scale
      if (newScale > 4) newScale = 4; // maximum scale
      const scales = [0.5, 1, 2, 4]
      const index = scales.reduce((prev, curr) => {
        return Math.abs(curr - newScale) < Math.abs(prev - newScale) ? curr : prev
      }, 1)
      setBlockSnapSize(7.5) // update block size based on scale
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
    setIsShapeSelected(-1)
  }

  const addShape = (e: any) => {
    if (isAddShape) {
      setGeneralShapes((prevShapes: any) => [...prevShapes, {
        id: generalShapes.length,
        name: `vehicle #${generalShapes.length}`,
        type: 'circle',
        x: Math.round((e.evt.x - (window.innerWidth / 7) - e.currentTarget.x()) / e.currentTarget.scaleX() / blockSnapSize) * blockSnapSize,
        y: Math.round((e.evt.y - e.currentTarget.y()) / e.currentTarget.scaleY() / blockSnapSize) * blockSnapSize,
        strokeWidth: 1,
        radius: 6,
        fill: 'yellow' // ONGOING change later when need more roles
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
    setIsShapeSelected(-1)
  }
  const handleAddPath = (shape: GeneralShape) => {
    if (!isAddPath) return
    if (shapeQueue === -1) {
      setShapeQueue(shape.id)
    }
    else {
      if (shapeQueue === shape.id) {
        setShapeQueue(-1)
        return
      }
      const newPath: GeneralShape = {
        type: 'connector',
        id: paths.length,
        name: `path #${paths.length}`,
        from: shapeQueue,
        to: shape.id,
        fill: 'black',
        stroke: 'black',
        strokeWidth: 1,
        isDeleted: false,
        distance: 0
      }
      setGeneralShapes([...generalShapes, newPath])
      setPaths([...paths, newPath])
      setShapeQueue(-1)
    }
  }
  //#endregion

  //#region ONGOING handle select shape for information
  // const [isClickedOnShapeOrPath, setIsClickedOnShapeOrPath] = useState(false)
  const [isShapeSelected, setIsShapeSelected] = useState(-1)
  const handleShapeSelectionViewInfo = (shape: GeneralShape) => {
    if (isAddShape || isAddPath) return
    if (isShapeSelected === shape.id) setIsShapeSelected(-1)
    else {
      setIsPathSelected(-1)
      setIsShapeSelected(shape.id)
    }
  }

  const handleShapeInfoOnClick = (id: number) => {
    setIsAddShape(false)
    setIsAddPath(false)
    // setIsClickedOnShapeOrPath(true)
    if (isShapeSelected === id) setIsShapeSelected(-1)
    else setIsShapeSelected(id)
  }

  const [isPathSelected, setIsPathSelected] = useState(-1)
  const handlePathSelectionViewInfo = (path: GeneralShape) => {
    if (isAddShape || isAddPath) return
    if (isPathSelected === path.id) setIsPathSelected(-1)
    else setIsPathSelected(path.id)
  }

  const handlePathInfoOnClick = (id: number) => {
    setIsAddShape(false)
    setIsAddPath(false)
    // setIsClickedOnShapeOrPath(true)
    if (isPathSelected === id) setIsPathSelected(-1)
    else setIsPathSelected(id)
  }
  //#endregion

  //#region TODO handle create zone
  const [isCreateZone, setIsCreateZone] = useState(false)
  const [inputZone, setInputZone] = useState<Zone>({
    type: 'zone',
    id: -1,
    name: '',
    isDeleted: false,
    rows: -1,
    cols: -1,
    distanceRow: -1,
    distanceCol: -1,
    x: -1,
    y: -1
  })
  const [zones, setZones] = useState<Zone[]>([])

  const handleCreateZone = (e: any) => {
    if (e.target && e.target.id() !== 'stage') return
    if (isCreateZone) {
      const pos = {
        x: Math.round((e.evt.x - (window.innerWidth / 7) - e.currentTarget.x()) / e.currentTarget.scaleX() / blockSnapSize) * blockSnapSize,
        y: Math.round((e.evt.y - e.currentTarget.y()) / e.currentTarget.scaleY() / blockSnapSize) * blockSnapSize
      }

      setInputZone({
        ...inputZone,
        x: pos.x,
        y: pos.y
      })
    }
  }

  const isZoneSelected = useState(-1)

  const handleSubmitZone = (e: any) => {
    if (isCreateZone && inputZone.cols === -1 || inputZone.rows === -1 ||
      inputZone.distanceCol === -1 || inputZone.distanceRow === -1) return
    e.preventDefault()
    const newZone: Zone = {
      type: 'zone',
      id: zones.length,
      name: `zone #${zones.length}`,
      isDeleted: false,
      rows: inputZone.rows,
      cols: inputZone.cols,
      distanceRow: inputZone.distanceRow,
      distanceCol: inputZone.distanceCol,
      x: inputZone.x,
      y: inputZone.y
    }
    setZones([...zones, newZone])
    setInputZone({
      type: 'zone',
      id: -1,
      name: '',
      isDeleted: false,
      rows: -1,
      cols: -1,
      distanceRow: -1,
      distanceCol: -1,
      x: -1,
      y: -1
    })
  }
  //#endregion

  const clearAll = () => {
    setGeneralShapes([])
    setPaths([])
    setZones([])
    setIsAddShape(false)
    setIsAddPath(false)
    setIsCreateZone(false)
    setIsShapeSelected(-1)
    setIsPathSelected(-1)
    setInputZone({
      type: 'zone',
      id: -1,
      name: '',
      isDeleted: false,
      rows: -1,
      cols: -1,
      distanceRow: -1,
      distanceCol: -1,
      x: -1,
      y: -1
    })
    setStagePos({ x: 0, y: 0 })
  }

  //#region actual component
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      height: '100vh'
    }} onKeyDown={(e: any) => {
      undoRedo(
        setGeneralShapes,
        history,
        lastHistoryIndex,
        resetFlag
      )(e)
    }} tabIndex={0}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '0px 20px',
        gap: '10px',
        width: `${innerWidth / 7}`
      }}>
        <h4>Aubot AGV Simulation</h4>
        <p>Hello World</p>
        <button onClick={() => setIsDraggable(!isDraggable)}>Drag mode</button>
        <button onClick={clearAll}>Clear Shape</button>
        <button onClick={handleAddShape}>Add Shape</button>
        <button onClick={handleShapeSelectionAddPath}>Add Path</button>
        <button onClick={back}>Back</button>
        <p>Add Shape mode: {isAddShape ? 'on' : 'off'}</p>
        <p>Add Path mode: {isAddPath ? 'on' : 'off'}</p>
        {isCreateZone ? (
          <div>
            <p>Create Zone mode: on</p>
            <div>
              <p>Zone position on screen</p>
              <p>X: {inputZone.x}</p>
              <p>Y: {inputZone.y}</p>
            </div>
            <form onSubmit={handleSubmitZone}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
              }}>
                <label htmlFor="col">Number of cols: </label>
                <input
                  type="number"
                  maxLength={5}
                  name='col'
                  value={inputZone.cols}
                  onChange={(e: any) => {
                    const cols = e.target.value
                    setInputZone({
                      ...inputZone,
                      cols: cols
                    })
                  }}
                  style={{
                    maxWidth: '40px',
                  }} />
                <label htmlFor="row">Number of rows: </label>
                <input
                  type="number"
                  maxLength={5}
                  name='row'
                  value={inputZone.rows}
                  onChange={(e: any) => {
                    const rows = e.target.value
                    setInputZone({
                      ...inputZone,
                      rows: rows
                    })
                  }}
                  style={{
                    maxWidth: '40px',
                  }} />

                <label htmlFor="discol">Distance between cols: </label>
                <input
                  type="number"
                  maxLength={5}
                  name='discol'
                  value={inputZone.distanceCol}
                  onChange={(e: any) => {
                    const distanceCol = e.target.value
                    setInputZone({
                      ...inputZone,
                      distanceCol: distanceCol
                    })
                  }}
                  style={{
                    maxWidth: '40px',
                  }} />
                <label htmlFor="disrow">Distance between rows: </label>
                <input
                  type="number"
                  maxLength={5}
                  name='disrow'
                  value={inputZone.distanceRow}
                  onChange={(e: any) => {
                    const distanceRow = e.target.value
                    setInputZone({
                      ...inputZone,
                      distanceRow: distanceRow
                    })
                  }}
                  style={{
                    maxWidth: '40px',
                  }} />
                <button type='submit'>Submit</button>
              </div>
            </form>
            <button onClick={() => setIsCreateZone(false)}>Cancel</button>
          </div>
        ) : (
          <div>
            <p>Create Zone mode: off</p>
            <button onClick={() => setIsCreateZone(true)}>Create Zone</button>
          </div>
        )}
      </div>
      <div className="canvas" style={{
        display: 'flex'
      }} ref={canvasRef}>
        <Stage
          id='stage'
          width={window.innerWidth * 3 / 5}
          height={window.innerHeight * 0.95}
          draggable={isDraggable}
          ref={stageRef}
          // onDragMove={(e: any) => {
          //   const group = groupRef.current
          //     if (group) {
          //       group.position({
          //         x: -e.currentTarget.x() / e.currentTarget.scaleX(),
          //         y: -e.currentTarget.y() / e.currentTarget.scaleY(),
          //       })
          //       group.scale({
          //         x: 1 / e.currentTarget.scaleX(),
          //         y: 1 / e.currentTarget.scaleY(),
          //       })
          //     }
          // }}
          onDragEnd={(e: any) => {
            setStagePos(e.currentTarget.position())
            // const group = groupRef.current
            // if (group) {
            //   group.position({
            //     x: -e.currentTarget.x() / e.currentTarget.scaleX(),
            //     y: -e.currentTarget.y() / e.currentTarget.scaleY(),
            //   })
            //   group.scale({
            //     x: 1 / e.currentTarget.scaleX(),
            //     y: 1 / e.currentTarget.scaleY(),
            //   })
            // }
          }}
          onClick={(e: any) => {
            addShape(e)
            handleCreateZone(e)
          }}
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
            <Circle x={0} y={0} radius={1} stroke={'black'} />
            {zoneLayer(zones, setZones, blockSnapSize, scale)}
            {shapeLayer(
              generalShapes,
              setGeneralShapes,
              7.5,
              handleAddPath,
              handleShapeSelectionViewInfo,
              handlePathSelectionViewInfo,
              scale
            )}
          </Layer>
          <Layer>
            {/* {ruler('white')} */}
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
        <h4>Information</h4>
        {isShapeSelected === -1 ?
          (isPathSelected === -1 ?
            (<div>
              <p>Node</p>
              {generalShapes.map((shape) => {
                return (
                  <div key={shape.id} onClick={() => handleShapeInfoOnClick(shape.id)}>
                    <p>{shape.id}: {shape.name}</p>
                  </div>
                )
              })}
              <br />
              <p>Path</p>
              {paths.map((connector) => {
                return (
                  <div key={connector.id} onClick={() => handlePathInfoOnClick(connector.id)}>
                    <p>{connector.id}: {connector.name}</p>
                  </div>
                )
              })
              }
            </div>) : (
              <div onClick={() => handlePathInfoOnClick(isPathSelected)}>
                <p>{paths[isPathSelected].id}: {paths[isPathSelected].name}</p>
                {/* <p>From: {connectors[isPathSelected].from}</p>
                <p>To: {connectors[isPathSelected].to}</p>
                <p>Distance: {connectors[isPathSelected].distance}</p> */}
                <p>Deleted: {paths[isPathSelected].isDeleted ? "True" : "False"}</p>
              </div>
            )
          ) : (
            <div onClick={() => handleShapeInfoOnClick(isShapeSelected)}>
              <p>{generalShapes[isShapeSelected].id}: {generalShapes[isShapeSelected].name}</p>
              <p>Deleted: {generalShapes[isShapeSelected].isDeleted ? "True" : "False"}</p>
            </div>
          )}
      </div>
    </div>
  )
  //#endregion
}

// export default App
