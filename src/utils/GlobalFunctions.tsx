// Functions that works with every object in the app

import type React from "react";
import type { GeneralShape } from "../types";
import generatePath from "./GenerateConnector";

// copy-paste, undo-redo, selection
export const undoRedo = (
  setGeneralShapes: React.Dispatch<React.SetStateAction<GeneralShape[]>>,
  history: React.RefObject<GeneralShape[][]>,
  lastHistoryIndex: React.RefObject<number>,
  resetFlag: React.RefObject<boolean>
) => {
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
    setGeneralShapes(previous)
  }

  const handleRedo = () => {
    if (lastHistoryIndex.current >= history.current.length - 1) return

    const next = history.current[lastHistoryIndex.current + 1]
    lastHistoryIndex.current += 1
    resetFlag.current = false
    setGeneralShapes(next)
  }

  return handleKeydown
}

export const select = (
  shape: GeneralShape,
  generalShapes: GeneralShape[],
  setSelectRect: React.Dispatch<React.SetStateAction<any>>,
  scale: number
) => {
  switch (shape.type) {
    case 'rect':
      setSelectRect({
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
        stroke: 'lightblue',
        strokeWidth: 2,
        dash: [3, 3]
      })
      return
    case 'circle':
      setSelectRect({
        x: shape.x - (shape.radius + 4),
        y: shape.y - (shape.radius + 4),
        width: 2 * shape.radius + 8,
        height: 2 * shape.radius + 8,
        stroke: 'lightblue',
        strokeWidth: 2,
        dash: [3 / scale, 3 / scale]
      })
      return
    case 'path':
      const fromShape = generalShapes.find((t) => t.id === shape.from)
      const toShape = generalShapes.find((t) => t.id === shape.to)
      if (!fromShape || !toShape) return null
      const points = generatePath(fromShape, toShape, scale)

      setSelectRect({
        x: points[0],
        y: points[1],
        width: points[2] - points[0],
        height: points[3] - points[1],
        stroke: 'lightblue',
        strokeWidth: 2,
        dash: [3, 3]
      })
      return
    case 'zone':
      return null
    default:
      return null
  }
}

export const copyPaste = (
  generalShapes: GeneralShape[],
  setGeneralShapes: React.Dispatch<React.SetStateAction<GeneralShape[]>>
) => {
  //
}