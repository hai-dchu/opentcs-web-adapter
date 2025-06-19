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
  setSelectRect: React.Dispatch<React.SetStateAction<number>>,
) => {
  setSelectRect(shape.id)
}

export const copyPaste = (
  generalShapes: GeneralShape[],
  setGeneralShapes: React.Dispatch<React.SetStateAction<GeneralShape[]>>
) => {
  //
}