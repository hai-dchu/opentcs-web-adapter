import Konva from "konva";
// import { useRef } from "react";

interface RulerProps {
  axis: "x" | "y";
  stage: Konva.Stage;
  width: number;
  height: number;
}

// ➕ Reusable ruler renderer (top or left)
const useRuler = ({ axis, stage, width, height }: RulerProps) => {
  const group = new Konva.Group({});

  const tickTexts: Konva.Text[] = [];
  const ticks = new Konva.Path({ stroke: "black" });

  const rulerBackground = new Konva.Rect({
    fill: "#f0f0f0",
    width: axis === "x" ? width : 40,
    height: axis === "x" ? 40 : height,
  });

  const tickGroup = new Konva.Group({});
  tickGroup.add(ticks);

  group.add(rulerBackground);
  group.add(tickGroup);

  const update = () => {
    const scale = axis === "x" ? stage.scaleX() : stage.scaleY();
    const stagePos = axis === "x" ? stage.x() : stage.y();
    const rulerLength = axis === "x" ? width : height;
    const step = 40 / scale;

    const start = -stagePos / scale;
    const count = Math.ceil(rulerLength / (step * scale)) + 2;
    const startTick = Math.floor(start / step);

    let path = "";

    for (let i = 0; i < count; i++) {
      const val = (startTick + i) * step;
      const pos = val * scale + stagePos;

      path += axis === "x"
        ? `M${pos},0 L${pos},${8}`
        : `M0,${pos} L${8},${pos}`;
    }

    ticks.data(path);
  };

  return { group, update };
};

export default useRuler