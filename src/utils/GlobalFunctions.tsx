// Functions that works with every object in the app

import type React from "react";
import type { GeneralShape } from "../types";
import generatePath from "./GeneratePath";

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
  setGeneralShapes: React.Dispatch<React.SetStateAction<GeneralShape[]>>
) => {
  //
}