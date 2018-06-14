import { BrushTool } from "./index"
import { Rgb, Vec2, T2 } from "../../../data"
import { BrushPoint } from "../../rendering/brushShader"

function distance(x0: number, y0: number, x1: number, y1: number): number {
    const x = x1 - x0
    const y = y1 - y0
    return Math.sqrt(x * x + y * y)
}

function lerp(pct: number, start: number, end: number): number {
    return start + (end - start) * pct
}

export interface InputPoint {
    readonly alpha: number
    readonly color: Rgb
    readonly position: Vec2
    readonly pressure: number
    readonly rotation: number
}

export interface InterpolatorState {
    readonly prevPoint: InputPoint
}

export function init(prevPoint: InputPoint): InterpolatorState {
    return { prevPoint }
}

export interface InterpolationResult {
    readonly brushPoints: ReadonlyArray<BrushPoint>
    readonly state: InterpolatorState
}

export function interpolate(
    brush: BrushTool,
    state: InterpolatorState,
    end: InputPoint
): T2<InterpolatorState, ReadonlyArray<BrushPoint>> {
    if (state === null) {
        const brushPoint = {
            alpha: end.alpha,
            color: end.color,
            position: end.position,
            rotation: end.rotation,
            scaledDiameter: brush.diameterPx * end.pressure,
        }
        return [{ prevPoint: end }, [brushPoint]]
    }

    const start = state.prevPoint

    const spacingPx = brush.spacingPct * brush.diameterPx
    const pcts =
        brush.pressureAffectsSize && start.pressure !== end.pressure
            ? interpolateWithPressureScaling(spacingPx, start, end)
            : interpolateNormal(spacingPx, start, end)

    if (pcts.length === 0) return [state, []]

    const pressureIsEq = start.pressure === end.pressure
    const alphaIsEq = start.alpha === end.alpha
    const colorIsEq = start.color.eq(end.color)
    const rotationIsEq = start.rotation === end.rotation

    const pctsLen = pcts.length
    const brushPoints = new Array<BrushPoint>(pctsLen)
    for (let i = 0; i < pctsLen; i++) {
        const pct = pcts[i]

        const alpha = alphaIsEq ? start.alpha : lerp(pct, start.alpha, end.alpha)
        const color = colorIsEq ? start.color : start.color.mix(pct, end.color)
        const position = start.position.lerp(pct, end.position)
        const scaledDiameter =
            brush.diameterPx *
            (pressureIsEq ? start.pressure : lerp(pct, start.pressure, end.pressure))
        const rotation = rotationIsEq ? start.rotation : lerp(pct, start.rotation, end.rotation)

        brushPoints[i] = {
            alpha,
            color,
            position,
            scaledDiameter,
            rotation,
        }
    }

    const lastBrushPoint = brushPoints[brushPoints.length - 1]
    const prevPoint: InputPoint = {
        alpha: lastBrushPoint.alpha,
        color: lastBrushPoint.color,
        position: lastBrushPoint.position,
        pressure: lerp(pcts[pcts.length - 1], start.pressure, end.pressure),
        rotation: lastBrushPoint.rotation,
    }

    return [{ prevPoint }, brushPoints]
}

function interpolateNormal(
    spacingPx: number,
    start: InputPoint,
    end: InputPoint
): ReadonlyArray<number> {
    const totalDist = distance(start.position.x, start.position.y, end.position.x, end.position.y)

    const count = Math.floor(totalDist / spacingPx)
    const arr = new Array<number>(count)

    for (let i = 0; i < count; i++) arr[i] = (i * spacingPx) / totalDist

    return arr
}

// Potential optimization?: the if condition can probably be avoided
function interpolateWithPressureScaling(
    spacingPx: number,
    start: InputPoint,
    end: InputPoint
): ReadonlyArray<number> {
    const arr: Array<number> = []
    const endX = end.position.x
    const endY = end.position.y
    const endPressure = end.pressure
    const endSpacing = Math.max(spacingPx * endPressure, 0.1)

    let x = start.position.x
    let y = start.position.y
    let pressure = start.pressure

    const totalDist = distance(x, y, endX, endY)
    if (totalDist < endSpacing) return arr

    // console.group("interpolation dump1")
    // console.log("start", start)
    // console.log("end", end)
    // console.log("spacingPx, endSpacing", spacingPx, endSpacing)
    // console.groupEnd()

    let dist = totalDist
    let p = 0.5
    let prevX = x
    let prevY = y
    let prevPressure = pressure

    while (dist > endSpacing && p > 0) {
        p = (spacingPx * pressure) / dist
        x += p * (endX - x)
        y += p * (endY - y)
        pressure += p * (endPressure - pressure)

        if (x !== prevX || y !== prevY || pressure !== prevPressure) {
            arr.push(1 - dist / totalDist)
            prevX = x
            prevY = y
            prevPressure = pressure
        }
        dist = distance(x, y, endX, endY)
    }
    return arr
}
