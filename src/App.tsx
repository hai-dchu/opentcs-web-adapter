// For temporary use
import { useEffect, useRef, useState } from 'react'
import { Circle, Layer, Stage, useStrictMode } from 'react-konva'

// user-defined functions
import './App.css'
import gridLayer from './components/GridLayer'
import type { GeneralShape, Node, Path } from './types'
import shapeLayer from './components/GeneralShapeLayer'
// import zoneLayer from './components/ZoneLayer'
import { copyPaste, undoRedo } from './utils/GlobalFunctions'
import selectRectLayer from './components/SelectRectLayer'

useStrictMode(true) // force update canvas when there is change

const App = () => {
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
  const stageRef = useRef<any>(null)

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

  //#region handle zoom/scaling
  const [scale, setScale] = useState(1)
  const blockSnapSize = 7.5 // block size

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
      // const scales = [0.5, 1, 2, 4]
      // const index = scales.reduce((prev, curr) => {
      //     return Math.abs(curr - newScale) < Math.abs(prev - newScale) ? curr : prev
      // }, 1)
      // setBlockSnapSize(7.5) // update block size based on scale
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

  //#region handle add shape
  const [nodes, setNodes] = useState<Node[]>([])
  const [isAddNode, setIsAddNode] = useState(false)

  const controlRef = useRef<any>(null)

  const handleAddNode = () => {
    setIsAddNode(!isAddNode)
    setIsAddPath(false)
    setSelectRect([])
  }
  const addNode = (e: any) => {
    if (isAddNode) {
      const shift = controlRef.current.offsetWidth
      const newNode: Node = {
        id: generalShapes.length,
        name: `Node #${nodes.length}`,
        type: 'circle',
        x: Math.round((e.evt.x - e.currentTarget.x() - shift) / e.currentTarget.scaleX() / blockSnapSize) * blockSnapSize,
        y: Math.round((e.evt.y - e.currentTarget.y()) / e.currentTarget.scaleY() / blockSnapSize) * blockSnapSize,
        strokeWidth: 1,
        radius: 6,
        isDeleted: false,
        fill: 'yellow' // ONGOING change later when need more roles
      }
      setNodes((prevNodes: Node[]) => [...prevNodes, newNode])
      setGeneralShapes((prevShapes: GeneralShape[]) => [...prevShapes, newNode])
    }
  }
  //#endregion

  //#region handle connect shape
  const [paths, setPaths] = useState<Path[]>([])
  const [isAddPath, setIsAddPath] = useState(false)
  const [nodeQueue, setNodeQueue] = useState<number>(-1)

  const handleAddPath = () => {
    setIsAddPath(!isAddPath)
    setIsAddNode(false)
    setSelectRect([])
  }

  const addPath = (node: Node) => {
    if (!isAddPath) return
    if (nodeQueue === -1) {
      setNodeQueue(node.id)
    } else {
      if (nodeQueue === node.id) {
        setNodeQueue(-1)
        return
      }

      const newPath: Path = {
        type: 'path',
        id: generalShapes.length,
        name: `path #${paths.length}`,
        from: nodeQueue,
        to: node.id,
        fill: 'black',
        stroke: 'black',
        strokeWidth: 1,
        isDeleted: false,
        distance: 0
      }
      setGeneralShapes([...generalShapes, newPath])
      setPaths([...paths, newPath])
      setNodeQueue(-1)
    }
  }
  //#endregion

  //#region ONGOING handle select shape for information
  const handleShapeInfoOnClick = (id: number) => {
    setIsAddNode(false)
    setIsAddPath(false)
    let val = selectRect.find(s => s === id);

    if (val !== undefined) setSelectRect([])
    else setSelectRect([id])
  }

  const clearAll = () => {
    setGeneralShapes([])
    setNodes([])
    setPaths([])
    setSelectRect([])
    setStagePos({ x: 0, y: 0 })
  }

  const [selectRect, setSelectRect] = useState<number[]>([])
  //#endregion

  //#region copy paste
  const [cacheCopy, setCacheCopy] = useState<GeneralShape[]>([])
  //#endregion

  //#region the component
  return (
    <div id='container'
      onKeyDown={(e: any) => {
        undoRedo(
          setGeneralShapes,
          history,
          lastHistoryIndex,
          resetFlag
        )(e)
        const [func, tmpNode] = copyPaste(
          generalShapes,
          setGeneralShapes,
          selectRect,
          cacheCopy,
          setCacheCopy
        )
        setNodes((prevNodes) => [...prevNodes, ...tmpNode])
        func(e)
      }}
      tabIndex={0}
    >
      <div id='control' ref={controlRef}>
        <h4>Aubot AGV Simulation</h4>
        <p>Hello World</p>
        <button onClick={() => {
          setIsDraggable(!isDraggable)
          setIsAddNode(false)
          setIsAddPath(false)
        }
        }>Drag mode</button>
        <button onClick={clearAll}>Clear Shape</button>
        <button onClick={handleAddNode}>Add Node</button>
        <button onClick={handleAddPath}>Add Path</button>
        <button onClick={back}>Back</button>
        <p>Add Shape mode: {isAddNode ? 'on' : 'off'}</p>
        <p>Add Path mode: {isAddPath ? 'on' : 'off'}</p>
      </div>


      <div id="canvas">
        <Stage
          id='stage'
          width={window.innerWidth * 3 / 5}
          height={window.innerHeight * 0.98}
          draggable={isDraggable}
          ref={stageRef}
          onDragEnd={(e: any) => {
            setStagePos(e.currentTarget.position())
          }}
          onClick={(e: any) => {
            addNode(e)
            // handleCreateZone(e)
            if (e.target && e.target.id() !== 'stage') return
            if (isDraggable) return
            setSelectRect([])
          }}
          onWheel={(e) => {
            // setStagePos(e.currentTarget.position())
            handleWheel(e)
          }}
        >
          <Layer>
            {gridLayer(blockSnapSize, window.innerWidth * 3 / 5, window.innerHeight * 0.98, stagePos, scale)}
            <Circle x={0} y={0} radius={1} stroke={'black'} />
            {/* {zoneLayer(zones, setZones, blockSnapSize, scale)} */}
            {!isDraggable ? selectRectLayer(generalShapes, selectRect, scale) : null}
            {shapeLayer(
              generalShapes,
              setGeneralShapes,
              7.5,
              addPath,
              isDraggable,
              setSelectRect,
              scale
            )}
          </Layer>
          {/* <Layer>
            {ruler('white')}
          </Layer> */}
        </Stage>
      </div>


      <div id='info'>
        <h4>Information</h4>
        {selectRect.length === 0 ?
          (<div>
            <p>Node</p>
            {nodes.map((node) => {
              return (
                <div key={node.id} onClick={() => handleShapeInfoOnClick(node.id)}>
                  <p>{node.id}: {node.name}</p>
                </div>
              )
            })}
            <br />
            <p>Path</p>
            {paths.map((path) => {
              return (
                <div key={path.id} onClick={() => handleShapeInfoOnClick(path.id)}>
                  <p>{path.id}: {path.name}</p>
                </div>
              )
            })
            }
          </div>
          ) : (
            selectRect.map((id, index) => {
              return (
                <div key={`${index}`} onClick={() => handleShapeInfoOnClick(id)}>
                  <p>{id}: {generalShapes[id].name}</p>
                  {generalShapes[id].type === 'path' ? (
                    <div>
                      <p>From: {generalShapes[id].from}</p>
                      <p>To: {generalShapes[id].to}</p>
                      <p>Distance: {generalShapes[id].distance}</p>
                    </div>
                  ) : (
                    <div>
                      {/* <p>{generalShapes[id].id}: {generalShapes[id].name}</p> */}
                    </div>
                  )}
                  <p>Deleted: {generalShapes[id].isDeleted ? "True" : "False"}</p>
                </div>
              )
            })
          )

        }
      </div>
    </div>
  )
  //#endregion
}

export default App