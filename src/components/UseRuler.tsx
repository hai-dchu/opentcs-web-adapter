// import Konva from 'konva'
// import { Layer } from 'react-konva'

// class Ruler {
//     tickLength = 5
//     axis = ''
//     stage: Konva.Stage
//     layer: Konva.Layer
//     ruler: Konva.Group
//     rulerFill: Konva.Rect
//     ticks: Konva.Path
//     width = 0
//     height = 0
//     scale = 1
//     tickText: Konva.Text
//     tickTexts: Konva.Text[] = []
//     tickMarkGroup: Konva.Group

//     constructor(
//         stage: Konva.Stage,
//         layer: Konva.Layer,
//         width: number,
//         height: number,
//         axis: string,
//         thickness: number = 20,
//         fill: string = 'black'
//     ) {
//         Object.preventExtensions(this)
//         this.stage = stage
//         this.layer = layer
//         this.axis = axis
//         this.width = width
//         this.height = height
//         this.ruler = new Konva.Group({
//             x: axis === 'x' ? stage.x() : 0,
//             y: axis === 'x' ? 0 : stage.y(),
//             clip: {
//                 x: 0,
//                 y: 0,
//                 width: this.width,
//                 height: this.height
//             }
//         })
//         this.rulerFill = new Konva.Rect({
//             width: axis === 'x' ? this.width : thickness,
//             height: axis === 'y' ? this.height : thickness,
//             fill: fill
//         })

//         const clip = {
//             x: axis === 'x' ? thickness - 5 : 0,
//             y: axis === 'y' ? thickness - 5 : 0
//         }

//         this.tickMarkGroup = new Konva.Group({
//             clip: {
//                 clipX: clip.x,
//                 clipY: clip.y,
//                 clipWidth: this.width - clip.x,
//                 clipHeight: this.height - clip.y
//             }
//         })

//         this.ticks = new Konva.Path({
//             stroke: 'black',
//         })

//         this.tickText = new Konva.Text({
//             fill: 'black',
//             fontSize: 10,
//             fontFamily: 'Calibri',
//             text: '',
//             align: 'center'
//         })

//         this.ruler.add(this.rulerFill, this.tickMarkGroup)
//         this.tickMarkGroup.add(this.ticks)
//     }

//     get rulerShape() {
//         return this.ruler;
//     }

//     update() {
//         this.ruler.scale({
//             x: 1 / this.stage.scaleX(),
//             y: 1 / this.stage.scaleY()
//         })
//         this.ruler.position({
//             x: -this.stage.x() / this.stage.scaleX(),
//             y: -this.stage.y() / this.stage.scaleY()
//         })
//         const list = this.stage.find('.tickText' + this.axis)
//         for (const tick of list) {
//             tick.setAttr("visible", false)
//         }

//         // Calculate the zero point on the ruler
//         const rulerZero = this.axis === 'x' ? this.stage.x() : this.stage.y()

//         // get the ruler length
//         const rulerLength = (this.axis === 'x' ? this.width : this.height)

//         // Note the scale in force
//         const axisScale = this.axis === 'x' ? this.stage.scaleX() : this.stage.scaleY()

//         // displayStep is the jumps in the number displayed on the tick marks
//         let displayStep = 40 / axisScale

//         // rulerStep is the gap between ruler tick marks we will draw, and 
//         // the position of the text.
//         const rulerStep = (displayStep * axisScale)

//         // how many ticks from zero pt back to start and end of ruler?
//         const ticksBackward = - Math.ceil(rulerZero / rulerStep)
//         const ticksForward = Math.ceil((rulerLength - rulerZero) / rulerStep)

//         // Which makes the positions in px
//         const tickPosStart = rulerZero + (ticksBackward * rulerStep)
//         const tickPosEnd = rulerZero + (ticksForward * rulerStep)

//         // And gives a total px distance from ruler start to end of    
//         const totalDist = tickPosEnd - tickPosStart

//         // used to create path output
//         let dataSteps = []

//         // 
//         let tickCnt = 0 // used to count ticks

//         // Set up the text for the first ruler marker
//         let tickTag = ticksBackward * displayStep

//         // Loop for each ruler mark
//         for (let i = tickPosStart; i < tickPosEnd; i = i + rulerStep) {

//             // Construct the path command for the tick mark
//             dataSteps.push(
//                 this.axis === 'x' ?
//                     `M${i},0 L${i},${this.tickLength}`
//                     :
//                     `M${i},${this.tickLength} L$${this.tickLength},{i}`
//             )

//             // Manage the tick mark text
//             if (this.tickTexts.length < tickCnt + 1) {
//                 const tick = this.tickText.clone({ text: tickTag, width: 100 })
//                 tick.align(this.axis === 'x' ? 'center' : 'left')
//                 tick.name('tickText' + this.axis)
//                 this.tickTexts[tickCnt] = tick
//                 this.tickMarkGroup.add(tick)
//             }

//             // Update the tick number
//             this.tickTexts[tickCnt].setAttrs({
//                 x: this.axis === 'x' ? i - (this.tickTexts[tickCnt].width() / 2) : 10,
//                 y: this.axis === 'x' ? 10 : i - (this.tickTexts[tickCnt].height() / 2),
//                 text: tickTag,
//                 visible: true
//             })

//             tickCnt = tickCnt + 1

//             tickTag = tickTag + displayStep
//         }

//         // Apply that path data that we constructed.
//         this.ticks.data(dataSteps.join(' '))
//     }
// }

// const UseRuler = () => {

//     return (
//         <Layer></Layer>
//     )
// }

// export default UseRuler

import React, { useEffect, useRef, useState } from "react"
import { Group, Path, Rect, Text } from "react-konva"
import Konva from "konva"

type RulerProps = {
    stageRef: React.RefObject<Konva.Stage>
    axis: "x" | "y"
    width: number
    height: number
    thickness?: number
    fill?: string
}

const Ruler: React.FC<RulerProps> = ({
    stageRef,
    axis,
    width,
    height,
    thickness = 20,
    fill = "#f0f0f0"
}) => {
    const [ticksData, setTicksData] = useState<{ path: string; texts: any[] }>({ path: "", texts: [] })
    const groupRef = useRef<Konva.Group>(null)

    useEffect(() => {
        const stage = stageRef.current
        if (!stage) return

        const scale = axis === "x" ? stage.scaleX() : stage.scaleY()
        const pos = axis === "x" ? stage.x() : stage.y()
        const rulerLength = axis === "x" ? width : height

        const displayStep = 40 / scale
        const rulerStep = displayStep * scale
        const rulerZero = pos

        const ticksBackward = -Math.ceil(rulerZero / rulerStep)
        const ticksForward = Math.ceil((rulerLength - rulerZero) / rulerStep)

        const tickPosStart = rulerZero + ticksBackward * rulerStep
        const tickPosEnd = rulerZero + ticksForward * rulerStep

        const pathParts: string[] = []
        const texts: any[] = []

        let tickValue = ticksBackward * displayStep
        let tickCount = 0

        for (let i = tickPosStart; i <= tickPosEnd; i += rulerStep) {
            const pos = i

            // Path line
            pathParts.push(
                axis === "x"
                    ? `M${pos},0 L${pos},${thickness}`
                    : `M0,${pos} L${thickness},${pos}`
            )

            texts.push({
                key: tickCount,
                text: Math.round(tickValue).toString(),
                x: axis === "x" ? pos - 20 : 4,
                y: axis === "x" ? 4 : pos - 8,
            })

            tickValue += displayStep
            tickCount++
        }

        setTicksData({ path: pathParts.join(" "), texts })
    }, [stageRef, axis, width, height, thickness, fill])

    useEffect(() => {
        if (!stage) return
        const handleDragMove = () => {
            if (groupRef.current) {
                groupRef.current.scale({
                    x: 1 / scale.x,
                    y: 1 / scale.y
                })
                groupRef.current.position({
                    x: -position.x / scale.x,
                    y: -position.y / scale.y
                })
            }
        }
        stage.on('dragmove', handleDragMove)
        return () => {
            stage.off('dragmove', handleDragMove)
        }
    }, [])
    const stage = stageRef.current
    if (!stage) return null

    const scale = stage.scale()
    const position = stage.position()

    const groupProps = {
        x: axis === "x" ? position.x : 0,
        y: axis === "y" ? position.y : 0,
        clipX: 0,
        clipY: 0,
        clipWidth: width,
        clipHeight: height,
    }

    // stage.on('dragmove', () => {
    //     if (groupRef.current) {
    //         groupRef.current.scale({
    //             x: 1 / scale.x,
    //             y: 1 / scale.y
    //         })
    //         groupRef.current.position({
    //             x: -position.x / scale.x,
    //             y: -position.y / scale.y
    //         })
    //     }
    // })

    return (
        <Group ref={groupRef} {...groupProps}
            scale={{
                x: 1 / scale.x,
                y: 1 / scale.y
            }}
            position={{
                x: -position.x / scale.x,
                y: -position.y / scale.y
            }}>
            <Rect
                width={axis === "x" ? width : thickness}
                height={axis === "y" ? height : thickness}
                fill={fill}
            />
            <Path
                data={ticksData.path}
                stroke="#444"
                strokeWidth={1}
            />
            {ticksData.texts.map((t) => (
                <Text
                    key={t.key}
                    text={t.text}
                    x={t.x}
                    y={t.y}
                    fontSize={10}
                    fontFamily="Calibri"
                    fill="#000"
                />
            ))}
        </Group>
    )
}

export default Ruler
