// Functions that works with every object in the app

import type React from "react";
import type { GeneralShape, Node } from "../types";

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
  setSelectRect: React.Dispatch<React.SetStateAction<number[]>>,
  key: boolean
) => {
  if (key) {
    setSelectRect((ids: number[]) => {
      if (ids.find(t => t === shape.id)) return [...ids]
      return [...ids, shape.id]
    })
  }
  else setSelectRect([shape.id])
}

export const copyPaste = (
  generalShapes: GeneralShape[],
  setGeneralShapes: React.Dispatch<React.SetStateAction<GeneralShape[]>>,
  selectRect: number[],
  cacheCopy: GeneralShape[],
  setCacheCopy: React.Dispatch<React.SetStateAction<GeneralShape[]>>
): any[] => {
  const tmpNodes: Node[] = []
  const handleKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const metaKey = event.ctrlKey || event.metaKey
    if (metaKey && event.key.toLowerCase() === 'c') {
      const tmpCache: GeneralShape[] = []
      selectRect.forEach(id => {
        const tmp = generalShapes.find(t => t.id === id)
        if (tmp) tmpCache.push(tmp)
      })
      setCacheCopy(tmpCache)
    } else if (metaKey && event.key.toLowerCase() === 'v') {
      if (!selectRect.length) return
      const shift = 2
      const tmpCache = structuredClone(cacheCopy)
      tmpCache.map((shape, index) => {
        shape.id = generalShapes.length + index
        switch (shape.type) {
          case 'rect':
            shape.x += shift
            shape.y += shift
            tmpNodes.push(shape)
            return shape
          case 'circle':
            shape.x += shift
            shape.y += shift
            tmpNodes.push(shape)
            return shape
          case 'path':
            return shape
          case 'zone':
            return shape
          default:
            return shape
        }
      })
      setCacheCopy(tmpCache)
      setGeneralShapes((prevShapes: GeneralShape[]) => [...prevShapes, ...tmpCache])
    }
  }
  return [handleKeydown, tmpNodes]
}